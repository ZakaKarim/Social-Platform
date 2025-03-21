import { FriendRequest } from "../models/friendRequest.model.js";
import { User } from "../models/user.model.js";
import { Block } from "../models/block.model.js";

//Send Friend Request Method
const sendFriendRequest = async (req, res) => {
  try {
    const { senderUserID, receiverUserID } = req.body;
    // Check if sender and receiver are the same
    if (senderUserID === receiverUserID) {
      return res
        .status(404)
        .json({ Message: "You cannot send a friend request to yourself" });
    }

    // Check if the sender or receiver is already blocked cannot send the friend request again
    const blockedUser = await Block.findOne({
      $or: [
        {
          blockerUserID: senderUserID,
          blockedUserID: receiverUserID,
        },
        {
          blockedUserID: senderUserID,
          blockerUserID: receiverUserID,
        },
      ],
    });
    if (blockedUser) {
      return res.status(401).json({ Message: "This User is already Blocked" });
    }

    // Check if the request is already exist
    const exisitingRequest = await FriendRequest.findOne({
      senderUserID,
      receiverUserID,
      status: "Pending",
    });
    if (exisitingRequest) {
      return res.status(404).json({ Message: "Friend Request already sent" });
    }

    // Create a new friend request
    const newRequest = new FriendRequest({ senderUserID, receiverUserID });
    await newRequest.save();

    // Update sender's and receiver's pending requests
    // await User.findByIdAndUpdate(senderUserID, {
    //   $push: { pendingRequests: newRequest._id },
    // });
    // await User.findByIdAndUpdate(receiverUserID, {
    //   $push: { pendingRequests: newRequest._id },
    // });

    //Add userID to friends array
    await User.findByIdAndUpdate(senderUserID, {
      $push: { pendingRequests: receiverUserID },
    });
    await User.findByIdAndUpdate(receiverUserID, {
      $push: { pendingRequests: senderUserID },
    });
    return res.status(200).json({
      message: "Friend request sent successfully",
      request: newRequest,
    });
  } catch (error) {
    console.log("Error while sending a Friend Request", error);
    return res.status(500).jsojn({
      Message: "Server error || Error while sending a Friend Request",
      error,
    });
  }
};

// Accept or reject a friend request Method
const respondToFriendRequest = async (req, res) => {
  try {
    const { requestID, status } = req.body;

    // Validate status
    if (!["Accepted", "Rejected"].includes(status)) {
      return res.status(400).json({ Message: "Invalid Status" });
    }

    // Find the request
    const updateRequest = await FriendRequest.findById(requestID);
    if (!updateRequest) {
      return res.status(404).json({ Message: "Friend Request not found" });
    }

    // Check if the status is already Accepted
    if (updateRequest.status === "Accepted") {
      return res.status(400).json({ message: "Status is already Accepted" });
    }

    //Check if the status is already Rejected
    if (updateRequest.status === "Rejected") {
      return res
        .status(200)
        .json({ Message: "Friend requst is already Rejected" });
    }

    // Update the request status
    updateRequest.status = status;
    await updateRequest.save();

    // If the request is accepted, add each other as friends
    if (status === "Accepted") {
      await User.findByIdAndUpdate(updateRequest.senderUserID, {
        $push: { friends: updateRequest.receiverUserID },
      });
      await User.findByIdAndUpdate(updateRequest.receiverUserID, {
        $push: { friends: updateRequest.senderUserID },
      });
    }
    // Remove the request from both users pending requests
    await User.findByIdAndUpdate(updateRequest.senderUserID, {
      $pull: { pendingRequests: updateRequest.receiverUserID },
    });
    await User.findByIdAndUpdate(updateRequest.receiverUserID, {
      $pull: { pendingRequests: updateRequest.senderUserID },
    });

    return res.status(200).json({
      message: `Friend request ${status} successfully`,
      request: updateRequest,
    });
  } catch (error) {
    console.log("Error while Respond to Friend Request", error);
    return res.status(500).jsojn({
      Message: "Server error || Error while Respond to Friend Request",
      error,
    });
  }
};

// UnFriend a user
const unfriendUser = async (req, res) => {
  try {
    const { userID, friendID } = req.body;

    // Remove friend from both users friends list
    await User.findByIdAndUpdate(userID, { $pull: { friends: friendID } });
    await User.findByIdAndUpdate(friendID, { $pull: { friends: userID } });

    return res.status(200).json({ Message: "Unfriend Successfully" });
  } catch (error) {
    console.log("Error while unFriend a User", error);
    return res
      .status(500)
      .json({ Message: "Error while UnFriend a User", error });
  }
};

export { sendFriendRequest, respondToFriendRequest, unfriendUser };
