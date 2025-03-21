import { Block } from "../models/block.model.js";
import { User } from "../models/user.model.js";
import { FriendRequest } from "../models/friendRequest.model.js";

// Method to Block a User 
const blockUser = async (req, res) => {
  try {
    const { blockerUserID, blockedUserID } = req.body;
    //Check if they are already Block
    const exisitingBlock = await Block.findOne({
      blockerUserID,
      blockedUserID,
    });
    if (exisitingBlock) {
      return res.status(404).json({ Message: "User is already blocked" });
    }

    // Remove from friends list
    await User.findByIdAndUpdate(blockerUserID, {
      $pull: { friends: blockedUserID },
    });
    await User.findByIdAndUpdate(blockedUserID, {
      $pull: { friends: blockerUserID },
    });

    // Remove pending friend requests between the two users from the  FriendRequest DataBase
    await FriendRequest.deleteMany({
      $or: [
        { senderUserID: blockerUserID, receiverUserID: blockedUserID },
        { senderUserID: blockedUserID, receiverUserID: blockerUserID },
      ],
    });

    // Remove from pendingRequests array in both users' documents
    await User.findByIdAndUpdate(blockerUserID, {
      $pull: { pendingRequests: blockedUserID },
    });
    await User.findByIdAndUpdate(blockedUserID, {
      $pull: { pendingRequests: blockerUserID }, 
    });

    // Create a new block record
    const newBlock = new Block({ blockerUserID, blockedUserID });
    await newBlock.save();

    return res.status(200).json({ Message: "User blocked successfully" });
  } catch (error) {
    console.log("Error while Blocking a User", error);
    return res
      .status(500)
      .json({ Message: "Error while Blocking a User..||", error });
  }
};


//Method to UnBlock a User
const unblockUser = async (req,res)=>{
    try {
        const { blockerUserID, blockedUserID } = req.body;
        
    // Check if the block record exists
    const blockedRecord = await Block.findOneAndDelete({ blockerUserID,blockedUserID })
    if(!blockedRecord)
    {
        return res.status(404).json({Message: "Block Record Not Found"})
    }

    return res.status(200).json({ Message: "User unBlocked successfully" });

    } catch (error) {
        console.log("Error while unBlocking the User", error);
        return res.status(500).json({Message: "Error while UnBlocking the User", error})
    }
}
export { blockUser, unblockUser };
