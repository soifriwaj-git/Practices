const express= require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const mongoose= require('mongoose');
const userModel = require('../Database/Models/userModel');


//Login Route
router.post('/login', (req,res) =>{
    const { userName, password } = req.body;
    userModel.findOne({username: userName}).exec()
    .then((user) => {
        if(!user){
            return res.json({message: `User not found`});
        }
        else{
            if(user.password !== password){
                return res.status(400).json({message : `Authentication failed for some reason`});
            }
            const payload = {username: userName};
            jwt.sign(payload, process.env.SECRET_KEY, {expiresIn: '1h'}, (err, token) =>{
                if(err){
                    return res.json({tokenmessage: err.message});
                }
                return res.json({AccessToken : token});
            });
        }
    })
    .catch((err) =>{
        res.json({message: err.message});
    });

});

//GET all users
router.get('/getUsers',(req,res) =>{
    userModel.find()
    .exec()
    .then((users) =>{
        const usersFiltered = users.map((user) =>{ return {Firstname : user.firstName, LastName: user.lastName, EmailId: user.username}});
        return res.status(200).json({Users : usersFiltered});
    })
    .catch((error) =>{
        return res.status(500).json({message: error.message});
    });
});


//CREATE User
router.post('/createUser',verifyToken , (req,res) =>{
    if(!req.token){
        return res.status(401).json('Not authorised to create users');
    }
    const {firstName, lastName, username} = req.body;
    const user = userModel({
        firstName: firstName,
        lastName: lastName,
        username: username
    });
    user.save()
    .then((user) =>{
        return res.status(201).json({message: 'User created successfully', userCreated : user});
    })
    .catch((err) =>{
        if(err.code === 11000){
            return res.status(400).json({message: err.message});
        }
        else{
            return res.status(500).json({message: err.message});
        }
        
    });
});

// Auth Middleware
 function verifyToken(req,res,next) {
    const token = req.headers['authorization'].split(' ')[1];
    try {
         jwt.verify(token, process.env.SECRET_KEY);
        req.token = token;
    } catch (error) {
        console.log(error);
    }
    next();
}

//UPDATE user
 router.put('/updateUser/:emailId',verifyToken,(req,res) =>{
    if(!req.token){
        return res.status(401).json('Not authorised to create users');
    }
    const { firstName, lastName, username } = req.body;
    const id = req.params.emailId;
    //console.log(id)
    userModel.findOne({username: id})
    .then((user) =>{        
        if(!user){
            return res.status(404).json({message: 'User not found'});
        }
        //console.log(user._id)
        userModel.updateOne({username: id}, { $set : {firstName: firstName, lastName: lastName, username: username}}).exec();
    }).then((user) =>{
        console.log(user)
        return res.status(200).json({message:'user updated successfully'});
    })
    .catch((error) =>{
        return res.status(500).json({message : error.message})
    });

 });

 //DELETE user
router.delete('/deleteUser/:emailId', verifyToken,(req,res) =>{
    if(!req.token){
        return res.status(401).json('Not authorised to create users');
    }
    const id = req.params.emailId;

    userModel.findOne({username: id})
    .then((user) =>{        
        if(!user){
            return res.status(404).json({message: 'User not found'});
        }
        //console.log(user._id)
        userModel.deleteOne({username: id}).exec();
    }).then((user) =>{
        console.log(user)
        return res.status(200).json({message:'user removed successfully'});
    })
    .catch((error) =>{
        return res.status(500).json({message : error.message})
    });
});


//CREATE bulk users
router.post('/createBulkUsers', verifyToken, (req,res) =>{
    if(!req.token){
        return res.status(401).json('Not authorised to create users');
    }
    const bulkData = req.body.bulkData;
    if(!bulkData){
        return res.status(400).json({message: 'Please provide list of users'});
    }
    userModel.insertMany(bulkData)
    .then(() =>{
        return res.status(200).json({message: 'Users created successfully'});
    })
    .catch((error) =>{
        return res.status(500).json({message : error.message});
    });
});


module.exports= router;