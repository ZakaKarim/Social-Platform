import { User } from "../models/user.model.js";
import { Post } from "../models/post.model.js";
import { Comment } from "../models/comment.model.js";
import { Block } from "../models/block.model.js";
import mongoose from "mongoose";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

// Method to Register a new user
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if ([email, username, password].some((field) => field?.trim() === "")) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const profileLocalPath = req.files?.profileImage[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;
    console.log("req.files contain this information", req.files);

    let coverImageLocalPath;
    if (
      req.files &&
      Array.isArray(req.files.coverImage) &&
      req.files.coverImage.length > 0
    ) {
      coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!profileLocalPath) {
      return res.status(400).json({ message: "Profile Picture is required" });
    }

    const profileImage = await uploadOnCloudinary(profileLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    // console.log("profile image:",profileImage);
    if (!profileImage) {
      return res
        .status(400)
        .json({ message: "Error while Uploading the Picture" });
    }
    // if (!coverImage) {
    //   return res
    //     .status(400)
    //     .json({ message: "Error while Uploading the Cover Image" });
    // }

    const user = new User({
      username,
      email,
      password,
      profilePictureURL: profileImage.url,
      profilePicturePublicId: profileImage.public_id,
      coverPhotoURL: coverImage?.url || "",
    });

    if (!user) {
      return res.status(400).json({ message: "Error while creating the User" });
    }

    const response = await user.save();
    res.status(201).json({ message: "User registered successfully", response });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error || Error while Register a User", error });
    console.error("Error while Register a User", error);
  }
};

//Method to Login a User
const loginUser = async (req, res) => {
  try {
    // Get user input
    const { username, password } = req.body;
    console.log(req.body);
    if (!username) {
      return res.status(404).json({ Message: "Username is required" });
    }
    // Checking if the user sending the information or not

    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).json({ Message: "User not found" });
    }

    const isMatch = await user.isPasswordCorrect(password);
    if (!isMatch) {
      return res
        .status(404)
        .json({ Message: "Pasword is incorrect || Invalid user credentials" });
    }
    console.log(isMatch);

    const token = user.generateToken();

    res.status(200).json({
      Message: "Login Successfully your new token is given below",
      token,
      user: {
        name: user.username,
        email: user.email,
        profilePictureURL: user.profilePictureURL,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error || Error while Login a User", error });
    console.error("Error while Login a User", error);
  }
};

//Method to Fetch all the Users
const fetchAllUser = async (req, res) => {
  try {
    // const users = await User.find().select(
    //   "-password -friends -pendingRequests"
    // );
    const users = await User.find();
    res.status(200).json({ Message: "Users Fetch Successfully", users });
  } catch (error) {
    console.error("Error while Fetching the Users", error);
    return res.status(500).json({
      message: "Server error || Error while Fetching the Users",
      error,
    });
  }
};

//Method to Fetch a Single User Details
const fetchSingleUser = async (req, res) => {
  try {
    // Checking what is coming in the req.user middleware from jwt
    // const userId = req.user.id;
    // console.log("User  ID:", userId);
    // console.log("req.user Details:", req.user);
    //Checking the username in the params to find the friend the user trying to find
    const username = req.params.username; // Assume the id is passed as a route parameter
    console.log(req.params.username);
    console.log(req.params);

    const user = await User.findOne({ username: username }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User  not found" });
  }
  if(user.isDeactivated){
    return res.status(404).json({ message: "User  is Deactivated Sorry " })
  }
    //console.log(`User with id ${id} and name ${user.username} fetched`);
    res.status(200).json({ Message: "Sinlge User Fetch Successfully", user });
  } catch (error) {
    res.status(500).json({
      message: "Server error || Error while Fetching Single Users",
      error,
    });
    console.error("Error while Fetching Single Users", error);
  }
};

//Method to Update the Profile Picture
const updateProfilePicture = async (req, res) => {
  try {
    const userId = req.params.id;

    const profileLocalPath = req.file.path;

    if (!profileLocalPath) {
      return res
        .status(400)
        .json({ Message: "Error while uploading the Profile Picture" });
    }

    // Fetch user from DB to get the old Cloudinary public_id
    const userpublicid = await User.findById(userId);
    if (!userpublicid) {
      return res.status(404).json({ Message: "User not found" });
    }

    const oldPublicId = userpublicid.profilePicturePublicId;

    const profilepicture = await uploadOnCloudinary(profileLocalPath);
    if (!profilepicture.url || !profilepicture.public_id) {
      return res
        .status(404)
        .json({ Message: "Error while uploading on cloudinary" });
    }

    // Delete old image from Cloudinary (if exists)
    if (oldPublicId) {
      await deleteFromCloudinary(oldPublicId);
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          profilePictureURL: profilepicture.url,
          profilePicturePublicId: profilepicture.public_id,
        },
      },
      { new: true }
    ).select("-password -friends -pendingRequests");
    return res.status(200).json({
      Message: "Profile Picture Upload Succesfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error || Error while Uploading the Profile Picture",
      error,
    });
    console.error("Error while Updating the Picture", error);
  }
};

//Method to Update the Cover Image
const updateCoverImage = async (req, res) => {
  try {
    const userId = req.params.id;
    const coverImageLocalPath = req.file.path;

    if (!coverImageLocalPath) {
      return res.status(404).json({ Message: "Cover Image is Required " });
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage.url) {
      return res
        .status(404)
        .json({ Message: "Error while uploading the Cover Image" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          coverPhotoURL: coverImage.url,
        },
      },
      { new: true }
    );
    res
      .status(200)
      .json({ Message: "Cover Image is Updated Successfully", user });
  } catch (error) {
    return res.status(500).json({
      message: "Server error || Error while Uploading the Cover Image",
      error,
    });
  }
};

//Method to change User Password
const changePassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    console.log(user);
    if (!user) {
      return res.status(404).json({ Message: "User not found sorry!!" });
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
      return res
        .status(404)
        .json({ Message: "Pasword is incorrect || Invalid user credentials" });
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
    res.status(200).json({ Message: "Password Updated Successfully", user });
  } catch (error) {
    console.log("Error while updating the password", error);
    res.status(500).json({
      message: "Server error || Error while updating the Password",
      error,
    });
  }
};

//Method to Update the User Accout Details
const updateAccountDetails = async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email } = req.body;
    if (!(username || email)) {
      return res
        .status(404)
        .json({ Message: "Enter Username or Email to Update it " });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ Message: "User not found" });
    }

    const updatedAccount = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          username: username,
          email: email,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );
    //console.log(updatedAccount );
    res.status(200).json({
      Message: "Account Details Updated Successfully",
      updatedAccount,
    });
  } catch (error) {
    console.log("Error while updating the Account Deatils ", error);
    res.status(500).json({
      message: "Server error || Error while updating the Account Deatils ",
      error,
    });
  }
};
//Method to Delete the User
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    // Checking if the User Exist in the DataBase
    if (!user) {
      return res
        .status(404)
        .json({ Message: "User does not exist in the DataBase" });
    }

    const DeletedUser = await User.findOneAndDelete({ _id: userId });
    res.status(200).json({ Message: "User Deleted Successfully", DeletedUser });
  } catch (error) {
    res.status(500).json({
      message: "Server error || Error while Deleting the User",
      error,
    });
    console.error("Error while Deleting the User", error);
  }
};

//Method to see how who is my Friend with their details
const getAllFriendRequest = async (req, res) => {
  const userId = req.params.id;
  console.log(userId);
  // Extract userId from the URL parameters
  // const userId = req.params.id;
  if (!userId) {
    return res.status(404).json({ Message: "User ID is required" });
  }
  try {
    // Aggregation Pipeline
    const allRequests = await User.aggregate([
      {
        // Match the user by their ID
        $match: { _id: new mongoose.Types.ObjectId(userId) },
      },
      //First $lookup: Join with friendrequests collection
      {
        $lookup: {
          from: "friendrequests", // The Collection to Join With
          localField: "_id", // The field from the User collection
          foreignField: "receiverUserID", // The field from the FriendReuqest collection that references the user
          as: "RequestDetails", // The name of the new array field to store the joined requests
        },
      },
      // {
      //   // Unwind the SenderDetails array (since $lookup returns an array)
      //   $unwind: "$RequestDetails",
      // },

      // Second $lookup: Join with User collection to get sender details
      {
        $lookup: {
          from: "users", // The Collection to Join With (User collection)
          localField: "RequestDetails.senderUserID", // The field from the RequestDetails
          foreignField: "_id", // The field from the User collection
          as: "SenderDetails", // The name of the new array field to store the sender details
        },
      },
      // {
      //   // Unwind the SenderDetails array (since $lookup returns an array)
      //   $unwind: "$SenderDetails",
      // },

      // Add sender's username to RequestDetails
      // {
      //   $addFields:{
      //     "RequestDetails.sendUsername": "$SenderDetails.username" // Add sender's username to RequestDetails
      //   }
      // },
      {
        $project: {
          username: 1,
          email: 1,
          profilePictureURL: 1,
          "RequestDetails.senderUserID": 1, // Sender's ID
          "SenderDetails.username": 1, // Sender's username
        },
      },
      // {
      //   $project: {
      //     username: 1,
      //     email: 1,
      //     RequestDetails: {
      //       senderUserID: 1,
      //       sendUsername: 1
      //     }
      //   },
      // },
    ]);
    // Send the user products as the response
    res.status(200).json(allRequests);
  } catch (error) {
    console.log("Error while getting all the friends request", error);
    res
      .status(500)
      .json({ Message: "Error while getting all the friends request", error });
  }
};

// const getAllFriendRequest = async (req, res) => {
//   try {
//     const userId = req.params.id;
//     console.log(userId);

//     if (!userId) {
//       return res.status(404).json({ Message: "User ID is required" });
//     }
//     // Aggregation Pipeline
//     const allRequests = await User.aggregate([
//       {
//         // Match the user by their ID
//         $match: { _id: new mongoose.Types.ObjectId(userId) },
//       },
//       {
//         // Lookup to join with friendrequests collection
//         $lookup: {
//           from: "friendrequests", // The Collection to Join With
//           localField: "_id", // The field from the User collection
//           foreignField: "receiverUserID", // The field from the FriendRequest collection that references the user
//           as: "RequestDetails", // The name of the new array field to store the joined requests
//         },
//       },
//       {
//         // Unwind the RequestDetails array (to process each request individually)
//         $unwind: "$RequestDetails",
//       },
//       {
//         // Lookup to join with users collection to get sender details
//         $lookup: {
//           from: "users", // The Collection to Join With (User collection)
//           localField: "RequestDetails.senderUserID", // The field from the RequestDetails
//           foreignField: "_id", // The field from the User collection
//           as: "SenderDetails", // The name of the new array field to store the sender details
//         },
//       },
//       {
//         // Unwind the SenderDetails array (to get the sender's username)
//         $unwind: "$SenderDetails",
//       },
//       {
//         // Group the results back into a single document
//         $group: {
//           _id: "$_id", // Group by the user ID
//           username: { $first: "$username" }, // Keep the user's username
//           email: { $first: "$email" }, // Keep the user's email
//           profilePictureURL: { $first: "$profilePictureURL" }, // Keep the user's profile picture
//           RequestDetails: {
//             $push: {
//               senderUserID: "$RequestDetails.senderUserID", // Include senderUserID
//               senderUsername: "$SenderDetails.username", // Include sender's username
//             },
//           },
//         },
//       },
//       {
//         // Project the required fields
//         $project: {
//           _id: 0, // Exclude the _id field
//           username: 1, // Include username
//           email: 1, // Include email
//           profilePictureURL: 1, // Include profile picture
//           RequestDetails: 1, // Include RequestDetails
//         },
//       },
//     ]);

//     // Send the response
//     res.status(200).json(allRequests[0] || {});
//   } catch (error) {
//     console.error("Error fetching friend requests:", error);
//     res.status(500).json({ Message: "Internal Server Error" });
//   }
// };

//Method to see which user i have sent friend request
// const getAllsentRequest = async (req, res) => {
//   try {
//     const userId = req.params.id;
//     //Check if the UserID is Provided
//     if (!userId) {
//       return res.status(404).json({ Message: "User ID is required" });
//     }
//     const response = await User.aggregate([
//       {
//         // Match the user by their ID
//         $match: { _id: new mongoose.Types.ObjectId(userId) },
//       },
//       {
//         // Lookup to join with friendrequests collection
//         $lookup: {
//           from: "friendrequests", // The Collection to Join With
//           localField: "_id", // The field from the User collection
//           foreignField: "senderUserID", // The field from the FriendRequest collection that references the user
//           as: "Freind_Request_I_have_Sent_To", // The name of the new array field to store the joined requests
//         },
//       },
//       // {
//       //   $unwind: "$Freind_Request_I_have_Sent_To"
//       // },
//       {
//         // Second $lookup: Join with User collection to get receiver details
//         $lookup: {
//           from: "users", // The Collection to Join With
//           localField: "Freind_Request_I_have_Sent_To.receiverUserID", // The field from the User collection
//           foreignField: "_id", // The field from the FriendRequest collection that references the user
//           as: "ReciverDetails", // The name of the new array field to store the joined requests
//         },
//       },
//       // {
//       //   $unwind: "$ReciverDetails"
//       // },
//       {
//         $project: {
//           _id: 0, // Exclude the _id field
//           username: 1, // Include username
//           email: 1, // Include email
//           profilePictureURL: 1, // Include profile pictureFreind_Request_I_have_Sent
//           "Freind_Request_I_have_Sent_To.receiverUserID": 1,
//          "ReciverDetails.username": 1
//          //ReciverDetails: 1
//         },
//       },
//     ]);
//     res.status(200).json(response);
//   } catch (error) {
//     console.error("Error fetching All Sent friend requests:", error);
//     res
//       .status(500)
//       .json({ Message: "Error fetching All Sent friend requests" });
//   }
// };

const getAllsentRequest = async (req, res) => {
  try {
    const userID = req.params.id;
    //Aggregation Pipeline
    const user = await User.aggregate([
      {
        // Match the user by their ID
        $match: { _id: new mongoose.Types.ObjectId(userID) },
      },
      {
        $lookup: {
          from: "friendrequests", // The Collection to Join With
          localField: "_id", // The field from the User collection
          foreignField: "senderUserID", // The field from the FriendRequest collection that references the user
          // The name of the new array field to store the the users id which i have sent request too
          as: "Freind_Request_I_have_Sent_To",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "receiverUserID",
                foreignField: "_id",
                as: "ReceiverDetails",
              },
            },
            {
              $unwind: "$ReceiverDetails",
            },
          ],
        },
      },
      // {
      //   $unwind: "$Freind_Request_I_have_Sent_To",
      // },
      {
        $project: {
          _id: 0, // Exclude the _id field
          username: 1, // Include username
          email: 1, // Include email
          profilePictureURL: 1, // Include profile pictureFreind_Request_I_have_Sent
          "Freind_Request_I_have_Sent_To.receiverUserID": 1,
          "Freind_Request_I_have_Sent_To.ReceiverDetails.username": 1,
        },
      },
    ]);

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error while fetching all sent friend requests:", error);
    res.status(500).json({
      Message:
        "Internal Server Error || Error while fetching all sent friend requests",
      error,
    });
  }
};

//Method to Fetch all the post for the home page public post and friend post with privacy setting firend only
const getHomePagePosts = async (req, res) => {
  try {
    // Step 1: Get the logged-in user's ID from the JWT token
    const userId = req.user._id;

    // Step 2: Fetch the user's friends list //agar koi error ata hai to yaha phr .select('friends') lagnai hai
    const user = await User.findById(userId);
    console.log(user);
    const friendsList = user.friends; // Array of friend userIDs
    //Checking what is coming in friends array
    console.log("FriendList:", friendsList);

    // Step 3: Fetch posts
    // Fetch posts from friends with privacy set to "Friends"
    const friendsPosts = await Post.find({
      userID: { $in: friendsList }, // Posts by friends
      privacy: "Friends", // Only friends' posts
    }).populate({ path: "userID", select: "username" });
    console.log("FriendPost", friendsPosts);

    // Fetch public posts with privacy set to "Public" agar ap nai just yaha phr
    // content URL show karnai hai to .select use karnai hai at the end
    const publicPosts = await Post.find({
      privacy: "Public", // Public posts
    }).populate({ path: "userID", select: "username" });
    console.log("PublicPost", publicPosts);
    // Step 4: Combine and sort posts by createdAt (newest first)
    const allPosts = [...friendsPosts, ...publicPosts];
    //allPosts.sort((a, b) => b.createdAt - a.createdAt);
    console.log("Combinbe All Post ", allPosts);
    //return res.status(200).json(allPosts);
     const activePosts = allPosts.filter(
      (post) => !post.isHidden && !post.userID.isDeactivated
    ); // Filter out hidden posts and deactivated users
    return res.status(200).json(activePosts);
  } catch (error) {
    console.log("Error while Fetching Post for Home Page", error);
    return res
      .status(500)
      .json({ Message: "Error while Fetching Post for Home Page", error });
  }
};

//Method to comment on the post only if you are friend or the post privacy is set to Friend
const addComment = async (req, res) => {
  try {
    // Step 1: Get the logged-in user's ID from the JWT token
    const userId = req.user._id;
    console.log("UserID: ", userId);

    // Step 2: Get the postID and comment from the request body
    const { postID, comment } = req.body;

    // Step 3: Fetch the post
    const post = await Post.findById(postID);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }
    //console.log("post & comment", post,postID,comment)

    // Step 4: Check the post's privacy
    if (post.privacy === "Friends") {
      const postCreater = await User.findById(post.userID);
      console.log("Postcreater", postCreater);
      const friendsList = postCreater.friends;
      console.log(friendsList);
      // Check if the logged-in user is a friend of the post creator
      if (!friendsList.includes(userId)) {
        return res.status(404).json({
          success: false,
          message: "Only friends can comment on this post",
        });
      }
    }
    // Step 5: Create the comment
    const newComment = new Comment({
      userID: userId,
      postID: postID,
      comment: comment,
    });

    // Save the comment to the database
    await newComment.save();

    // Step 6: Return the response
    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: newComment,
    });
  } catch (error) {
    console.log("Error while adding a comment on the post", error);
    return res
      .status(500)
      .json({ Message: "Error while adding a comment on the post", error });
  }
};

//Method to view the profilepost of friends
const getProfilePosts = async (req, res) => {
  try {
    // Step 1: Extract visitor's userID from JWT
    const visitorUserId = req.user._id;
    console.log("visitorUserId", visitorUserId);

    // Step 2: Get profile owner's userID from URL params
    const profileUserId = req.params.id;
    console.log("ProfileUserId:", profileUserId);

    // Step 3: Check if visitor is a friend of the profile owner
    const profileOwner = await User.findById(profileUserId);
    console.log("ProfileOwner...", profileOwner);
    const isFriend = profileOwner.friends.includes(visitorUserId);
    console.log(isFriend);

    // Step 4: Fetch posts based on friendship status
    let posts;
    if (isFriend) {
      // If friends, fetch both "Friends" and "Public" posts
      posts = await Post.find({
        userID: profileUserId,
        privacy: { $in: ["Friends", "Public"] },
      });
    } else {
      // If not friends, fetch only "Public" posts
      posts = await Post.find({
        userID: profileUserId,
        privacy: "Public",
      });
    }
    console.log("POSTS", posts);
    // Step 5: Return the posts
    res.status(200).json({ success: true, posts });
  } catch (error) {
    console.log("Error While fetching profile post", error);
    return res
      .status(500)
      .json({ Message: "Error While fetching profile post", error });
  }
};

//Method that if a user block you than you cannot able to view his public or private Posts
const getBlockpost = async (req, res) => {
  try {
    // 1: Get the logged-in user's ID from JWT
    const currentUserId = req.user._id;
    console.log("req.user.friend",req.user.friends)
    console.log("Current User who want to view the profile", currentUserId);

    const userId = req.params.id;
    console.log("The user jis ki profile deknai cha raha hai", userId);

    // 2. Find users who blocked current user
    const blockedRecords = await Block.find({ blockedUserID: currentUserId });
    console.log("blockedRecords",blockedRecords)
    const blockerIds = blockedRecords.map(record => record.blockerUserID);
    console.log("blockerIds",blockerIds)

    
    // // 3. Get all posts NOT from blockers
    // const allVisiblePosts = await Post.find({
    //   userID: { $nin: blockerIds } // Exclude posts from blockers
    // });
    // console.log("allVisiblePosts",allVisiblePosts)

      // Step 3: Fetch posts (excluding blocked users)
      const posts = await Post.find({
        // Condition 1: Post is either "Public" OR from a friend
        $or: [
          { privacy: "Public" },
          { 
            privacy: "Friends",
            userID: { $in: req.user.friends } // Only friends' posts
          }
        ],
        // Condition 2: Exclude posts from users who blocked the current user
        userID: { $nin: blockerIds}
      })
      console.log("Posts",posts)

    res.status(200).json(posts);
  } catch (error) {
    console.log("Error While fetching profile post", error);
    return res
      .status(500)
      .json({ Message: "Error While fetching profile post", error });
  }
};

//Method to Deactivate Account
const deactivateAccount = async(req,res)=>{
    try {
      const userId = req.user._id;
      console.log("Logged in User", userId)
      console.log("FULL DATA", req.user)
       // 1. Mark user as deactivated
      const user = await User.findByIdAndUpdate(userId, { isDeactivated: true });
      console.log("user",user)
  
      // 2. (Optional) Hide all their posts immediately
      const post = await Post.updateMany(
        { userID: userId },
        { $set: { isHidden: true } }  // Add this field to Post model if needed
      )
      console.log("Posts",post)
      res.status(200).json({ success: true, message: "Account deactivated" });
    } catch (error) {
      console.log("Error While Deactivating Account", error);
      return res
        .status(500)
        .json({ Message: "Error While Deactivating Account", error });
    }
}

//Method to Activate Account
const activateAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("Logged in User", userId)
    console.log("FULL DATA", req.user)

    // 1. Mark user as active
    const user = await User.findByIdAndUpdate(userId, { isDeactivated: false });
    console.log("user",user)

    // 2. (Optional) Unhide all their posts
    await Post.updateMany(
      { userID: userId },
      { $set: { isHidden: false } }
    );

    res.status(200).json({ success: true, message: "Account activated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  registerUser,
  loginUser,
  fetchAllUser,
  fetchSingleUser,
  updateProfilePicture,
  updateCoverImage,
  changePassword,
  updateAccountDetails,
  deleteUser,
  getAllFriendRequest,
  getAllsentRequest,
  getHomePagePosts,
  addComment,
  getProfilePosts,
  getBlockpost,
  deactivateAccount,
  activateAccount
};
