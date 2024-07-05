const express = require("express");
const postrouter = express.Router();
require("../db/connect");
const User = require("../models/userSchema");
const Post = require("../models/PostSchema");
const authenticate = require("../middleware/authenticate");

exports.createPost = async (req, res) => {
    const { title, description } = req.body;
    const userId = req.params.userId;

    if (!title || !description) {
      return res
        .status(400)
        .json({ error: "Title and description are required fields" });
    }

    try {
      let imageUrl;
      if (req.file) {
        imageUrl = req.file.path;
      }

      const newPostData = {
        title,
        description,
        image: {
          filename: req.file.filename,
          originalname: req.file.originalname,
          path: req.file.path,
        },
        userId,
      };

      const newPost = new Post(newPostData);

      const savedPost = await newPost.save();

      const user = await User.findById(userId);
      user.posts.push(savedPost._id);
      await user.save();
      const posts = await Post.find({ userId });
      res
        .status(201)
        .json({ message: "Post created successfully!", post: posts });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error while creating post" });
    }
  }
 
  exports.userPost =  async (req, res) => {
    const userId = req.params.userId;
  
    try {
      const posts = await Post.find({ userId }).populate("userId");
      if (!posts || posts.length === 0) {
        return res.status(404).json({ error: "Posts not found for the user" });
      }
  
      res.json(posts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error while fetching posts" });
    }
  }  
 
  exports.deletePost = async (req, res) => {
    const postId = req.params.postId;
    const postt = await Post.findById(postId);
    try {
      const post = await Post.findByIdAndDelete(postId);
  
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      const userId = postt.userId;
      await User.findByIdAndUpdate(
        userId,
        { $pull: { posts: postId } },
        { new: true }
      );
  
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error while deleting post" });
    }
  }

exports.editPost  =
async (req, res) => {
    const postId = req.params.postId;
  
    try {
      const post = await Post.findById(postId);
  
      if (!post) {
        return res.status(404).json({ error: "Post not found for the user" });
      }
  
      res.json(post);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error while fetching post" });
    }
  }

  exports.updatePost =  async (req, res) => {
    const { title, description } = req.body;
    const postId = req.params.postId;
    const image = req.file;

    if (!title || !description) {
      return res
        .status(400)
        .json({ error: "Title and description are required fields" });
    }

    try {
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      // Update title and description
      post.title = title;
      post.description = description;

      if (image) {
        post.image = {
          originalname: image.originalname,
          path: image.path,
          filename: image.filename,
        };
      }

      await post.save();
      return res.json({ message: "Post updated successfully!" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Update error!" });
    }
  }

  exports.Allposts = async (req, res) => {
    try {
      const { userId } = req.params;
  
      const user = await User.findById(userId);
  
      const followingUserIds = user.following;
  
      const posts = await Post.find({
        userId: { $in: followingUserIds },
      }).populate("userId");
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(posts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error while fetching posts" });
    }
  }

  exports.likePost = async (req, res) => {
    try {
      const { postId, userId } = req.params;
  
      const post = await Post.findById(postId);
      const user = await User.findById(userId);
  
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
  
      if (!user) {
        return res.status(404).json({ message: "" });
      }
      const likedIndex = post.likedBy.indexOf(userId);
      if (likedIndex !== -1) {
        post.likedBy.splice(likedIndex, 1);
        post.likes -= 1;
      } else {
        post.likedBy.push(userId);
        post.likes += 1;
      }
  
      const savedPost = await post.save();
      await savedPost.populate("userId");
      res.status(200).json(savedPost);
    } catch (error) {
      console.error("Error liking post:", error);
      res
        .status(500)
        .json({ message: "An error occurred while liking the post." });
    }
  }

  exports.User  = async (req, res) => {
    try {
      const { userId } = req.params;
  
      const user = await User.findById(userId);
  
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: "" });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      res
        .status(500)
        .json({ message: "An error occurred while fetching user data" });
    }
  }