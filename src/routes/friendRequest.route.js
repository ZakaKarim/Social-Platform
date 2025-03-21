import express from 'express'
import { respondToFriendRequest, sendFriendRequest, unfriendUser } from '../controllers/friendRequest.controller.js';
const router = express.Router();

// Send a friend request
router.route('/send').post(sendFriendRequest)

// Accept or reject a friend request
router.route('/response').post(respondToFriendRequest)

//Unfriend user
router.route('/unfriend').post(unfriendUser)


export default router;