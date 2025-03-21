import express from 'express';
const router = express.Router();
import { upload } from '../middlewares/multer.js';
import { createPost, fetchAllPosts } from '../controllers/post.controller.js';

//Route to create a new Post
router.route('/create').post(upload.single('postMedia'), createPost)

//Route to fetch all the posts
router.route('/').get(fetchAllPosts)

export default router;