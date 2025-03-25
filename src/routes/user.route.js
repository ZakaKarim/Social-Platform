import express from 'express';
const router = express.Router();
import { registerUser,loginUser, fetchAllUser, fetchSingleUser, updateProfilePicture, deleteUser, updateCoverImage, changePassword, updateAccountDetails, getAllFriendRequest, getAllsentRequest, getHomePagePosts, addComment, getProfilePosts, getBlockpost, deactivateAccount, activateAccount } from '../controllers/user.controller.js';

import { upload } from '../middlewares/multer.js';
import { verifyJWT } from '../middlewares/auth.js';

//Route to Register a User
router.route('/register').post(
    upload.fields([
        { 
            name: "profileImage",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        },

    ]),
    registerUser)

//Route to Login a User
router.route('/login').post(loginUser)

//Route to Fetch all Users Data
router.route('/').get(fetchAllUser)

//Route to Fetch a Single User with findOne Method
router.route('/:username').get(fetchSingleUser)

//Route to update the profile Pictures
router.route('/:id/updateProfilePicture').patch(upload.single('profileImage'),updateProfilePicture)

//Route to update the cover Iamge 
router.route('/:id/updateCoverImage').patch(upload.single('coverImage'),updateCoverImage)

//Route to Update the User Password
router.route('/:id/updatePassword').post(changePassword)

//Route to Update the User Account Details 
router.route('/:id/updateAccountDetails').put(updateAccountDetails)

//Route to Delete the User
router.route('/:id').delete(deleteUser)

//Route to get all the freind Request that i user have using Aggregate Pipeline
router.route('/aggregate/:id').get(getAllFriendRequest)

//Route to get all the sent freind Request that i user have sent too using Aggregate Pipeline
router.route('/aggregate/send/:id').get(getAllsentRequest)

//Route to Fetch all the home page post
router.route('/homepage').post(verifyJWT,getHomePagePosts)

//Route to add a comment on the post only if you are friend 
router.route('/addcomment').post(verifyJWT,addComment)

//Route to view the ProfilePost if you are friend only 
router.route('/friendprofilepost/:id').post(verifyJWT,getProfilePosts)

//Route for the block user who cannot see post of the user
router.route('/blockuser/:id').post(verifyJWT,getBlockpost)

//Route to Deactivate Account
 router.route('/deactivateAccount').post(verifyJWT,deactivateAccount)

 //Route to Deactivate Account
 router.route('/activateAccount').post(verifyJWT,activateAccount)
export default router;