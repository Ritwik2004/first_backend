import mongoose,{ Schema } from "mongoose";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowecase: true,
            index: true
        },
        
        email: {
            type: String,
            required: [true, "Email is requird"],
            unique: true,
            trim: true,
            lowecase: true,
        },

        fullname: {
            type: String,
            required: true,
            trim: true,
            index: true
        },

        avatar: {
            type: String, //cloudinary url
            required: true,
        },

        coverImage: {
            type: String, //cloudinary url
        },

        watchHistory: [
            {
                type: Schema.types.ObjectId,
                ref: "Video"
            }
        ],

        password: {
            type: String,
            required: [true, "Password is required"]
        },

        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

export const Users = mongoose.model("User",userSchema);