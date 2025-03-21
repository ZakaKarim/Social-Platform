import mongoose,{Schema} from "mongoose";

const commentSchema = new Schema({
    userID:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    postID:{
        type:Schema.Types.ObjectId,
        ref:"Post",
        required:true
    },
    comment:{
        type:String,
        required:true
    }
},
{timestamps:true},
);

export const Comment = mongoose.model("Comment",commentSchema)