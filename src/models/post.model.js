import mongoose, { Schema } from "mongoose";

const postSchema = new Schema(
  {
    userID: {
      type: Schema.Types.ObjectId, // User who create the Post
      ref: "User",
      required: true,
    },
    contentType: {
      type: String,
      enum: ["Image", "Video"], // Type of content
      required: true,
    },
    privacy: {
      type: String,
      enum: ["Friends", "Public"], // Privacy setting
      default: "Public",
    },
    contentURL: {
      type: String, // URL of the image or video
      required: true,
    },
    isHidden: {  
      type: Boolean,
      default: false, // Posts are visible by default
    },
  },
  { timestamps: true }
);

export const Post = mongoose.model("Post", postSchema);
