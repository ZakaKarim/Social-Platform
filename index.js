import "dotenv/config";
import express from "express";
const app = express();

import connectDB from "./src/db.js";

//Import Axios File
// import { fetchData } from "./src/utils/fetchData.js";
// //Call the function to run the Axios get method 
// fetchData();

app.use(express.json({limit: "30kb"}))
app.use(express.urlencoded({extended: true, limit: "30kb"}))
app.use(express.static("public"));


//Routes import
import userRouter from "./src/routes/user.route.js";
import postRouter from "./src/routes/post.route.js";
import likeRouter from "./src/routes/like.route.js";
import commentRouter from "./src/routes/comment.route.js";
import reportRouter from "./src/routes/report.route.js"
import friendRequest from './src/routes/friendRequest.route.js'
import blockfriend from "./src/routes/block.route.js"

//Routes Declaration
app.use("/user", userRouter);
app.use("/post", postRouter);
app.use("/like", likeRouter);
app.use("/comment", commentRouter);
app.use("/report", reportRouter);
app.use("/friendrequest", friendRequest)
app.use("/friend", blockfriend)


//Calling the connectDB function
connectDB();

app.listen(process.env.PORT || 8000, ()=>{
    console.log(`⚙️ Server is Started on Port : ${process.env.PORT}⚙️`)
})