const express = require('express');
require('dotenv').config();
const app = express();
const port = process.env.APP_PORT;
const initDB = require('./Database/initDB');
const bodyParser = require('body-parser');
const userRoutes = require('./Users/userRoutes');

app.use(bodyParser.json());
app.use((req,res,next) =>{
    res.setHeader('Access-Control-Allow-Origin','*');
    next();
});


app.use('/users', userRoutes);


app.listen(port, async () =>{
    console.log(`Application running on PORT ${port}`);
    const dbDetails = await initDB();
    console.log(dbDetails);
});