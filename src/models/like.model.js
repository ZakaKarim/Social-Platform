import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId, // User who liked the post
      ref: "User",
      required: true,
    },  
    postID: {
      type: mongoose.Schema.Types.ObjectId, // Post that was liked
      ref: "Post",
      required: true,
    },
  },
  { timestamps: true }
);
export const Like = mongoose.model("Like", likeSchema);
