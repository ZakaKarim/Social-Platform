import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = async (req, res, next) => {
  try {
    //check karnai hai yah phel kai user login hai ya nahi
    // const authorization = req.headers.authorization;
    // if (!authorization) {
    //   return res.status(401).json({ Message: "Token not found" });
    // }

    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({
        message: "Unauthorized Request",
      });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -profilePicturePublicId"
    );
    if (!user) {
     return res.status(401).json({
        message: "Invalid Access Token",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in JWT verification", error);
    return res.status(401).json({
      message: "Unauthorized",
      error,
    });
  }
};

