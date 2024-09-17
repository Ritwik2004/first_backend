import {AsyncHandeler} from "../utils/asyncHandeler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js"
// import {User} from "../model/user.model.js";
const registerUser=AsyncHandeler(async(req,res)=>{
    // res.status(200).json({
    //     message: "ok"
    // })


    // algorithm :-
    
    //1. get data from user 
    //2. validation (not empty)
    //3. check if user previously exist or not(email,username)
    //4. confirm that user browse avatar img
    //5. upload img in cloudinary
    //6. create user object
    //7. remove password and token
    //8. check user create or not
    //9. return res

    // 1. get data
    const {fullname,email,username,password}=req.body;
    console.log(email);

    //validation
    if(
        [fullname,email,username,password].some((field)=>
            field?.trim()=="")
     ) {
        throw new ApiError(400, "All fields are required")
    }

    //existance
    const existeduser=Users.findOne({
        $or: [{ username }, { email }]
    })
    if(existeduser){
        throw new ApiError(409, "User with email or username already exist");
    }
     
    //img handeling
    const avataerLocalPath=req.files?.avatar[0]?.path
    const coverImageLocalPath=req.files?.coverImage[0]?.path;
    if(!avataerLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }

    //upload to cloudinary
    const avatar = await uploadOnCloudinary(avataerLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(404,"Avatar file is required")
    }

    // create a user
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase
    })

    // remove password and refreshToken from response
    const createdUser = await user.findOneById(user._id).select(
        "-password -refreshToken"
    )

    // check if new user is created or not in DB
    if(!createdUser){
        throw new ApiError(500,"Something Went Wrong")
    }

    //return response
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registerd successfully.")
    )

})

export {registerUser};