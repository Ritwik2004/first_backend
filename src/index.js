
// require('dotenv').config({path : "./env"});
import dotenv from "dotenv";
import DB from "./db/DB_Connection.js";
import app from "./app.js"

dotenv.config({
    path: "./env"
})

DB()
.then(()=>{
    app.listen(process.env.PORT||8000,(err)=>{
        if(err){
            console.log("app listining is fail : ",err);
        } 
        else{
            console.log("Your app is listen in port : ",process.env.PORT);
        }
    })
})
.catch((err)=>{
    console.log("Mongodb connection fail !!!");
})





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