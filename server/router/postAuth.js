const express = require("express");
const postrouter = express.Router();
require("../db/connect");
const authenticate = require("../middleware/authenticate");
const postController = require("../Controllers/postControllers");

//create post logic

const multer = require("multer");
const createPostStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./images");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

// Multer upload instance
const uploadCreatePost = multer({
  storage: createPostStorage,
  fileFilter: fileFilter,
});

// Create Post Endpoint
postrouter.post(
  "/user/createpost/:userId",
  uploadCreatePost.single("image"),
  authenticate,
  postController.createPost
);

postrouter.get("/user/posts/:userId", authenticate, postController.userPost);

// Backend code to delete a post
postrouter.delete(
  "/user/deletepost/:postId",
  authenticate,
  postController.deletePost
);

//get post for update

postrouter.get("/user/editpost/:postId", authenticate, postController.editPost);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./images");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

//update post logic
postrouter.post(
  "/user/updatepost/:postId",
  upload.single("image"),
  authenticate,
  postController.updatePost
);

postrouter.get("/user/allposts/:userId", authenticate, postController.Allposts);

// Like post logic
postrouter.post(
  "/user/likepost/:postId/:userId",
  authenticate,
  postController.likePost
);

postrouter.get("/user/:userId", authenticate, postController.User);
postrouter.put("/user/api/comment",authenticate,postController.createComment)
postrouter.put("/user/api/comment/:commentId/:postId",authenticate,postController.replyComment)
postrouter.put("/user/api/replyonComment/:commentId/:postId",authenticate,postController.replyonreply)
module.exports = postrouter;
