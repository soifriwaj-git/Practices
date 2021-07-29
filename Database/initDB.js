const mongoose = require('mongoose');
const db_port= process.env.DB_PORT;
const db_uri = process.env.DB_URI;
const db= process.env.DB;


function initDB() {
    const promise = new Promise((resolve,reject) =>{
        mongoose.connect(`${db_uri}:${db_port}/${db}`)
        .then((conn) =>{
            resolve('Database connected with details '+ conn);
        }).catch((err) =>{
            reject('Something wrong while connecting to DB '+ err);
        });
    });

    return promise;
}

module.exports = initDB;