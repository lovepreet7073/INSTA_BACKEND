const mongoose = require("mongoose");


const replySchema = new mongoose.Schema({
  reply: { type: String, required: true },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  replies: [{ type: mongoose.Schema.Types.Mixed }]
});

const commentSchema = new mongoose.Schema({
  comment: { type: String, required: true },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  replies: [replySchema]
});

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    // required: true
  },
  image: {
    filename: {
      type: String,
      required: true
    },
    originalname: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: [commentSchema],
  dislikes: {
    type: Number,
    default: 0
  },
  likedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  ],
  dislikedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  ]
}, {
  timestamps: true,
});

const Post = mongoose.model("Post", postSchema);
const Reply = mongoose.model("Reply", replySchema);
module.exports = Post;
