import mongoose, {Schema} from "mongoose";

const reportSchema = new Schema({
    userID:{
        type:Schema.Types.ObjectId, // User who reported the post
        ref:"User",
        required:true
    },
    postID:{
        type:Schema.Types.ObjectId, // Post that was reported
        ref:"Post",
        required:true
    },
    reportReason:{
        type:String, // Reason for reporting the post
        required:true
    }
},
{timestamps:true},
);

export const Report = mongoose.model("Report",reportSchema)