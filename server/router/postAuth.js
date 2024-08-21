const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const postController = require("../Controllers/postControllers");
const upload = require("../middleware/multerMiddleware");
const constants = require('../constants/apiUrls')
router.post(
  constants.CREATE_POST_URL,
  upload.single("image"),
  authenticate,
  postController.createPost
);

router.get(constants.USER_POSTS_URL, authenticate, postController.userPost);

// Backend code to delete a post
router.delete(
  constants.DELETE_POST_URL,
  authenticate,
  postController.deletePost
);

//get post for update

router.get(constants.EDIT_POST_URL, authenticate, postController.editPost);

router.post(
  constants.UPDATE_POST_URL,
  upload.single("image"),
  authenticate,
  postController.updatePost
);

router.get(constants.ALL_POSTS_URL, authenticate, postController.Allposts);

// Like post logic
router.post(
  constants.LIKE_POST_URL,
  authenticate,
  postController.likePost
);

router.get(constants.GET_USER_URL, authenticate, postController.User);
router.put(constants.CREATE_COMMENT_URL, authenticate, postController.createComment)
router.put(constants.REPLY_COMMENT_URL, authenticate, postController.replyComment)
router.put(constants.REPLY_ON_REPLY_URL, authenticate, postController.replyonreply)



router.post(constants.ADD_STORY_URL, upload.single("image"), authenticate, postController.addStory)
router.get(constants.GET_STORY_URL, authenticate, postController.getStory)
router.post(constants.UPDATE_VIEWERS_URL, authenticate, postController.updateViewers)
module.exports = router;
