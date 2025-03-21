import mongoose,{Schema} from "mongoose";

const blockSchema = new Schema({
    blockerUserID:{
        type: Schema.Types.ObjectId, // User who blocked another user
        ref:"User",
        required: true
    },
    blockedUserID:{
        type: Schema.Types.ObjectId, // User who was bloack
        ref:"User",
        required: true
    }
},
{timestamps:true}
);
export const Block = mongoose.model("Block",blockSchema)