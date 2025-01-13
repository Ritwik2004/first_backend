import {AsyncHandeler} from "../utils/asyncHandeler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { application } from "express";
import jwt from "jsonwebtoken";
// import {User} from "../model/user.model.js";

const generateAccessAndRefreshToken = (async(userId)=>{
    try {
       const user = await User.findById(userId);
       const accessToken = user.generateAccessToken();
       const refreshToken = user.generateRefreshToken();
       user.refreshToken = refreshToken;
       await user.save({validateBeforeSave: false});
       return {accessToken,refreshToken};
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating refresh token and access token")
    }
})

const registerUser = AsyncHandeler(async(req,res)=>{


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


    // console.log("req body : ",req.body);
    
    // 1. get data
    const {fullname,email,username,password}=req.body;
console.log("data arived");
    //validation
    if(
        [fullname,email,username,password].some((field)=>
            field?.trim()=="")
     ) {
        throw new ApiError(400, "All fields are required")
    }
console.log("validation complete");

    //existance
    const existeduser=await User.findOne({
        $or: [{ username }, { email }]
    })
    if(existeduser){
        throw new ApiError(409, "User with email or username already exist");
    }

console.log("Existence checked");
    //img handeling
    const avatarLocalPath = req.files?.avatar[0]?.path;
// console.log("avatar coming with : ",req.files);
    // const coverImageLocalPath=req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }
    console.log("local path decleared successfully")
    console.log("avatar : ",avatarLocalPath)
    //upload to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    console.log("coverimage : ",coverImageLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    console.log(avatar)
    console.log(coverImage)
    // if(!avatar){
    //     throw new ApiError(404,"Avatar file is required")
    // }
console.log("immages are handled successfully");
    // create a user
    const user = await User.create({
        fullname,
        avatar: avatar?.url || "",
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
console.log("user create successfully");
    // remove password and refreshToken from response
    const createdUser = await User.findById(user._id).select(
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

const loginUser = AsyncHandeler(async(req,res)=>{
    //req body -> data
    //verify user by username or emailId
    //check password
    //generate accessToken and refreshToken
    //send them by using cookies

// 1. req body ->data
    const {email, username, password} = req.body;
    console.log("username : ",username);
// 2. verify user by username or email 
    if(!username && !email){
        throw new ApiError(400,"username or email is required");
    }
    const user = await User.findOne({
        $or: [{username},{email}]
    })
    if(!user){
        throw new ApiError(404,"User does not exist");
    }
// 3. check password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(404,"Invalid user creadentials !!!");
    }
// 4. generate accesstoken and refreshtoken by using "generateAccessAndRefreshToken()" function
    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id);
//hide refresh token and password from user
    const loggedinUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly : true,
        secure : true
    }
// 5. send them to the user
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedinUser, accessToken, refreshToken
            },
            "user loggedin successfully !!!"
        )
    );
})

const logoutUser = AsyncHandeler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken : undefined
            }
        },
        {
            new : true
        }
    )
    const option ={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .clearCookie("accessToken",option)
    .clearCookie("refreshToken",option)
    .json(new ApiResponse(200, {}, "User logged out successfully !!!"))
})

const refreshAccessToken = AsyncHandeler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized request");
    }
    try {
        const decodedAccessRefreshToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedAccessRefreshToken?._id);
        if(!user){
            throw new ApiError(401,"invalid refreshToken");
        }
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"Refresh token is expired or used");
        }
        const options = {
            httpOnly : true,
            secure : true
        }
        const {newaccessToken,newrefreshToken} = await generateAccessAndRefreshToken(user._id)
        return res
        .result(200)
        .cookie("accessToken",newaccessToken,options)
        .cookie("refreshToken",newrefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken : newaccessToken,
                    refreshToken : newrefreshToken
                },
                "Access token refreshed"
            )
        )       
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token")
    }
})

const changeCurrentPassword = AsyncHandeler(async(req,res)=> {
    const {oldPassword, newPassword, confirmPassword} = req.body;
    if(!oldPassword || !newPassword || !confirmPassword){
        throw new ApiError(401,"Old Password or New Password is required");
    }
    if(newPassword === confirmPassword){
        throw new ApiError(401,"Confirm password and new password are not same");
    }
    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if(!isPasswordCorrect)
    {
        throw new ApiError(401,"Invalid old password");
    }
    user.password = newPassword;
    user.save({validateBeforeSave : false})
    return res.
    status(200)
    .json(new ApiResponse(200,{},"Password changed successfully"))
})

const getCurrentUser = AsyncHandeler(async(req,res)=>{
    return res
    .status(200)
    .json(200,req.user,"current user fetched successfully")
})

const updateAccountDetails = AsyncHandeler(async(req,res)=>{
    const {fullname, email} = req.body;
    if(!fullname || !email)
    {
        throw new ApiError(401,"All fields are required");
    }
    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email
            }
        },
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Account updated successfully"));
})

const updateAvatar = AsyncHandeler(async(req,res)=>{
    const avatarLocalPath = req.files?.avatar[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError(401,"Avatar file is required")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar.url) {
        throw new ApiError(401,"Error while uploading on cloudinary")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                avatar: avatar.url
            }
        },
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Avatar updated successfully")
    )
})

const updateCoverImage = AsyncHandeler(async(req,res)=>{
    const coverImageLocalPath = req.file?.path
    if(!coverImageLocalPath){
        throw new ApiError(401,"coverImage file is required")
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!coverImage.url) {
        throw new ApiError(401,"Error while uploading on cloudinary")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                coverImage: coverImage.url
            }
        },
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"cover image updated successfully")
    )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvatar,
    updateCoverImage
};
