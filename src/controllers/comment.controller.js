import { Comment } from "../models/comment.model.js";

const addcomment = async (req, res) => {
  try {
    const { userID, postID, comment } = req.body;
    // Check if userID, postID and comment are provided
    if (!userID || !postID || !comment) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the user has already comment on the post
    const existingComment = await Comment.findOne({ userID, postID });
    if (existingComment) {
      return res
        .status(400)
        .json({ message: "You have already Comment this post" });
    }

    // Create a new comment
    const newComment = new Comment({ userID, postID, comment });
    await newComment.save();
    return res
      .status(201)
      .json({ message: "Comment added successfully", comment: newComment });
  } catch (error) {
    console.log("Error while adding a comment", error);
    return res
      .status(500)
      .json({ message: "Server error || Error while adding a comment", error });
  }
};

export { addcomment };
