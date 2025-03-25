import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    profilePictureURL: {
      type: String, //Cloudinary URL
      required: true,
    },
    profilePicturePublicId: {
      type: String, // Store Cloudinary public_id
      default: "",
    },
    coverPhotoURL: {
      type: String, //Cloudinary URL
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId, // Array of friend UserIDs(users who are friends)
        ref: "User",
      },
    ],
    pendingRequests: [
      {
        type: mongoose.Schema.Types.ObjectId, // Array of pending RequestIDs(Pending Friends Request)
        ref: "FriendRequest",
      },
    ],
    isDeactivated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Pre hook to hash the password just before the user s save in the DataBase 
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare the plan text password to hash passsword  in the DataBase
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Method to generate a JWT token
userSchema.methods.generateToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
};

export const User = mongoose.model("User", userSchema);
