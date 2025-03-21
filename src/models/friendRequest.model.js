import mongoose,{Schema} from "mongoose";

const friendRequestSchema = new Schema({
    senderUserID: {
        type: Schema.Types.ObjectId, //User who send the Request
        ref:"User",
        required: true
    },
    receiverUserID: {
        type: Schema.Types.ObjectId, //User who receive the Request 
        ref:"User",
        required: true,
    },
    status:{
        type: String,
        enum: ["Accepted","Rejected","Pending"], //Friend Request Status
        default: "Pending",
    },

},
{timestamps: true}
)

export const FriendRequest = mongoose.model("FriendRequest",friendRequestSchema);