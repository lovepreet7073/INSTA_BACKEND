require("../db/connect");
const User = require("../models/userSchema");
const Post = require("../models/PostSchema");

exports.createPost = async (req, res) => {
  const { title } = req.body;
  const userId = req.params.userId;
  try {
    let imageUrl;
    if (req.file) {
      imageUrl = req.file.path;
    }

    const newPostData = {
      title,

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

exports.userPost = async (req, res) => {

  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const posts = await Post.find({ userId }).populate("userId").skip((page - 1) * Number(limit)) // Ensure limit is a number
      .limit(Number(limit)) //  
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

exports.editPost = async (req, res) => {
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

exports.updatePost = async (req, res) => {
  const { title } = req.body;
  const postId = req.params.postId;
  const image = req.file;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    post.title = title;
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
    const userId = req.params.userId;
    const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10 if not provided

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const followingUserIds = user.following.map(id => id.toString()); // Ensure IDs are strings
    const userAndFollowingIds = [...followingUserIds, userId.toString()];
    const posts = await Post.find({
      userId: { $in: userAndFollowingIds },
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * Number(limit)) // Ensure limit is a number
      .limit(Number(limit)) // Ensure limit is a number
      .populate("userId").populate('comments.postedBy', '_id name profileImage')
      .populate('comments.replies.postedBy', '_id name profileImage')

    const totalPosts = await Post.countDocuments({
      userId: { $in: userAndFollowingIds },
    });

    const hasMore = totalPosts > page * Number(limit);
    console.log("totalPosts:", totalPosts, "hasMore:", hasMore, "page:", page, "posts:", posts.length);
    res.json({ posts, hasMore, page });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error while fetching posts" });
  }
};

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

exports.User = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "" });
    }
  } catch (error) {
    console.error("Error fetching user data:", error); w
    res
      .status(500)
      .json({ message: "An error occurred while fetching user data" });
  }
}

exports.createComment = async (req, res) => {
  try {
    const comment = {
      comment: req.body.text,
      postedBy: req.user._id
    };

    const result = await Post.findByIdAndUpdate(
      req.body.postId,
      {
        $push: { comments: comment }
      },
      {
        new: true
      }
    )
      .populate("comments.postedBy", "_id name profileImage")
      .populate("userId", "_id name profileImage")
      .populate('comments.replies.postedBy', '_id name profileImage')
    if (!result) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(result);
  } catch (err) {
    console.error("Error creating comment:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
exports.replyComment = async (req, res) => {
  const { postId, commentId } = req.params;
  const { reply } = req.body;
  const userId = req.user._id;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    comment.replies.push({
      reply,
      postedBy: userId
    },
    )
    await post.save();
    const updatedPost = await Post.findById(postId)
      .populate('comments.replies.postedBy', '_id name profileImage')
      .populate('userId', '_id name profileImage')
      .populate("comments.postedBy", "_id name profileImage")
    res.status(201).json(updatedPost);

  } catch (error) {

    console.log(error, 'test')

    res.status(500).json({ message: "Server error", error });
  }
}