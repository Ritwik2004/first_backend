
// require('dotenv').config({path : "./env"});
import dotenv from "dotenv";
import DB from "./db/DB_Connection.js";
import app from "./app.js"

dotenv.config({
    path: "./env"
})

DB()
.then(() => {
    app.listen(process.env.PORT || 3000, (err) => { // Set a default port if process.env.PORT is not defined
      if (err) {
        console.log("App listen is fail !!!");
      } else {
        console.log("App is running on port: ", process.env.PORT || 3000);
      }
    });
})
.catch((err) => {
    console.log("Mongodb connection failed !!! Error: ", err);
});



/*
import mongoose from "mongoose";
import { DB_NAME } from "./constants";
import { express } from "express";
const app=express();
( async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("ERROR: ",error);
            throw error
        })

        app.listen(process.env.PORT,()=>{
            console.log(`Server is listen on port ${PORT}`);
        })
        
    } catch (error) {
        console.error("ERROR: ",error)
        throw err
    }
})()
*/