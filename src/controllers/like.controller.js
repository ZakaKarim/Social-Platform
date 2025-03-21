import { Like } from "../models/like.model.js";
// import { Post } from "../models/post.model.js";

const likePost = async (req, res) => {
  try {
    const { userID, postID } = req.body;
    // Check if userID and postID are provided
    if (!userID || !postID) {
      return res.status(400).json({ message: "All fields are required" });
    }

     // Check if the user has already liked the post
     const existingLike = await Like.findOne({ userID, postID });
     if (existingLike) {
       return res.status(400).json({ message: "You have already liked this post" });
     }

    // Create a new like
    const newLike = new Like({ userID, postID });
    //Saving it to DataBase
     await newLike.save();
    res.status(200).json({ message: "Post Liked Successfully", newLike });

  } catch (error) {
    console.log("Error while liking a post", error);
    return res
      .status(500)
      .json({ message: "Server error || Error while liking a post", error });
  }
};

export { likePost };
