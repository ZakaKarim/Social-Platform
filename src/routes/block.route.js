import express from 'express'
const router = express.Router();
import { blockUser, unblockUser } from '../controllers/block.controller.js';

//Route to Block a User
router.route('/block').post(blockUser);

//Route to unBlock a User
router.route('/unblock').post(unblockUser);
export default router;