import express from 'express';
const router = express.Router();
 import { addcomment } from '../controllers/comment.controller.js';

 router.route('/').post(addcomment)



export default router;