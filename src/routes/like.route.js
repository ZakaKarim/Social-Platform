import express from 'express';
const router = express.Router();
 import { likePost } from '../controllers/like.controller.js';

 router.route('/').post(likePost)



export default router;