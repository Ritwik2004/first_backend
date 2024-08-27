import mongoose from "mongoose";
import DBNAME from "../constants.js"; 

const DB= (async ()=>{
    try {
        let connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DBNAME}`);
        console.log("Mongodb is connected successfully !!! Host : ",connectionInstance.connection.host)
    } catch (error) {
        console.log("Mongodb Connection error : ",error)
        process.exit(1);
    }
})

export default DB;