const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
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
      },likes:{
        type:Number,
        default:0
      },
      dislikes:{
        type:Number,
        default:0
      },
      likedBy:[
        {
          type:mongoose.Schema.Types.ObjectId,
          ref:"User",
        }
      ],
      dislikedBy:[
        {
          type:mongoose.Schema.Types.ObjectId,
          ref:"User",
        }
      ]
},{
  timestamps: true,
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
