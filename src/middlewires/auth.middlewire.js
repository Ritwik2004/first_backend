import { ApiError } from "../utils/ApiError.js";
import { AsyncHandeler } from "../utils/asyncHandeler.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.model.js";

export const verifyJWT = AsyncHandeler(async(req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.repleace("Bearer ","");
        if(!token){
            throw new ApiError(401,"Unauthorized request");
        }
    
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id).select("-password -refreshToken");
        if(!user){
            throw new ApiError(401,"Invalid Accesstoken !!!");
        }
        req.user=user;
        next();     
    } catch (error) {
        throw new ApiError(401,error.message || "Invalid accesstoken" ); 
    }
})