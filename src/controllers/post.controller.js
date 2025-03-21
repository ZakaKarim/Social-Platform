import { Post } from "../models/post.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

//Method to create a New Post
const createPost = async (req, res) => {
  try {
    const { userID, contentType, privacy } = req.body;

    //Check if all fields are present
    if ([userID, contentType].some((field) => field?.trim() === "")) {
      return res.status(400).json({ message: "All fields are required" });
    }

    //Check if the postMedia is present
    const postLocalPath = req.file.path;
    if (!postLocalPath) {
      return res.status(400).json({ message: "Post is required" });
    }

    //Upload to Cloudinary
    const post = await uploadOnCloudinary(postLocalPath);
    if (!post) {
      return res
        .status(500)
        .json({ message: "Error while uploading the post to Cloudinary" });
    }

    //Create a new Post
    const newPost = new Post({
      userID,
      contentType,
      privacy,
      contentURL: post.url,
    });

    if (!newPost) {
      return res.status(500).json({ message: "Error while Creating a Post" });
    }

    const response = await newPost.save();
    return res
      .status(200)
      .json({ message: "Post Created Successfully", response });
  } catch (error) {
    console.error("Error while Creating a Post", error);
    return res
      .status(500)
      .json({ message: "Server error || Error while Creating a Post", error });
  }
};

//Fetch all the post
const fetchAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate({path: 'userID', select: 'username'}).sort({ createdAt: -1 });
        return res.status(200).json({ posts });
    } catch (error) {
        console.error("Error while fetching all posts", error);
        return res
        .status(500)
        .json({ message: "Server error || Error while fetching all posts", error });
    }
}

export { createPost, fetchAllPosts };
