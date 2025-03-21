import { Report } from "../models/report.model.js";

const addReport = async (req, res) => {
  try {
    const { userID, postID, reportReason } = req.body;

    // Check if userID, postID and reportReason are provided
    if (!userID || !postID || !reportReason) {
      return res
        .status(400)
        .json({ message: "All fields are required to report a post" });
    }

    const existingReport = await Report.findOne({ userID, postID });
    if (existingReport) {
      return res.status(400).json({
        message:
          "You have already reported this post || Cannot report the same post twice",
      });
    }

    // Create the new Report Instance
    const newReport = new Report({ userID, postID, reportReason });
    // Save it into DataBase
    await newReport.save();
    return res
      .status(200)
      .json({ Message: "We recieve your Report", newReport });
  } catch (error) {
    console.log("Error while adding a report", error);
    return res
      .status(500)
      .json({ message: "Server error || Error while adding a report", error });
  }
};

//Fetch all the Report
const fetchAllReport = async (req, res) => {
  try {
    //.populate({path: 'userID', select: 'username'}).sort({ createdAt: -1 });
    const posts = await Report.find()
      .populate({ path: "userID", select: "username" })
      .populate({ path: "postID", select: "contentURL" });
    return res.status(200).json({ posts });
  } catch (error) {
    console.error("Error while fetching all posts", error);
    return res
      .status(500)
      .json({
        message: "Server error || Error while fetching all posts",
        error,
      });
  }
};

export { addReport, fetchAllReport };
