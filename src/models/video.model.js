import mongoose,{ Schema } from "mongoose";

const videoSchema = new Schema(
    {
        videoFile: {
            type: String, //cloudinary url
            require: true
        },
        thumbnail: {
            type: String, //cloudinary url
            require: true
        },
        title: {
            type: String, 
            require: true
        },
        description: {
            type: String, 
            require: true
        },
        duration: {
            type: Number, 
            require: true
        },
        views: {
            type: Number,
            default: 0
        },
        isPublish: {
            type: Boolean,
            default: true
        },
        woner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
)

export const Video = mongoose.model("Video",videoSchema);