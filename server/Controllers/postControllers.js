const User = require("../models/userSchema");
const Post = require("../models/postSchema");
const mongoose = require("mongoose");
const Story = require("../models/storySchema")
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

      image:req.file.filename,
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
    
    const posts = await Post.find({ userId })
      .populate("userId")
      .sort({ createdAt: -1 }) // Sort posts by the latest first
      .skip((page - 1) * Number(limit)) 
      .limit(Number(limit));

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
      post.image = image.filename;
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
      .populate('userId')  // Populates the user who created the post
      .populate({
        path: 'comments',
        populate: [
          {
            path: 'postedBy',  // Populates the user who posted the comment
            model: 'User'
          },
          {
            path: 'replies',
            populate: [
              {
                path: 'postedBy',  // Populates the user who replied to the comment
                model: 'User'
              },
              {
                path: 'replies',
                populate: {
                  path: 'postedBy',  // Populates the user who replied to a reply
                  model: 'User'
                }
              }
            ]
          }
        ]
      })

    const totalPosts = await Post.countDocuments({
      userId: { $in: userAndFollowingIds },
    });

    const hasMore = totalPosts > page * Number(limit);
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
      .populate('userId')  // Populates the user who created the post
      .populate({
        path: 'comments',
        populate: [
          {
            path: 'postedBy',  // Populates the user who posted the comment
            model: 'User'
          },
          {
            path: 'replies',
            populate: [
              {
                path: 'postedBy',  // Populates the user who replied to the comment
                model: 'User'
              },
              {
                path: 'replies',
                populate: {
                  path: 'postedBy',  // Populates the user who replied to a reply
                  model: 'User'
                }
              }
            ]
          }
        ]
      })
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
  console.log(commentId, "id")
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    console.log(reply, 'replyComment');
    comment.replies.push({
      reply,
      postedBy: userId,

    },
    )
    await post.save();
    const updatedPost = await Post.findById(postId)

      .populate('userId')  // Populates the user who created the post
      .populate({
        path: 'comments',
        populate: [
          {
            path: 'postedBy',  // Populates the user who posted the comment
            model: 'User'
          },
          {
            path: 'replies',
            populate: [
              {
                path: 'postedBy',  // Populates the user who replied to the comment
                model: 'User'
              },
              {
                path: 'replies',
                populate: {
                  path: 'postedBy',  // Populates the user who replied to a reply
                  model: 'User'
                }
              }
            ]
          }
        ]
      })

    res.status(201).json(updatedPost);

  } catch (error) {


    res.status(500).json({ message: "Server error", error });
  }
}


exports.replyonreply = async (req, res) => {
  const { postId, commentId } = req.params;
  const { replytext, parentReplyId } = req.body;
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
    console.log(replytext, "text")

    // Finding the parent reply
    let parentReply = null;
    const findParentReply = (replies, parentId) => {
      for (const reply of replies) {
        if (reply._id.toString() === parentId) {
          return reply;
        }
        if (reply.replies && reply.replies.length > 0) {
          const found = findParentReply(reply.replies, parentId);
          if (found) return found;
        }
      }
      return null;
    };

    parentReply = findParentReply(comment.replies, parentReplyId);
    console.log(`Parent reply: ${JSON.stringify(parentReply)}, parentReplyId: ${parentReplyId}`);

    if (!parentReply) {
      return res.status(404).json({ message: 'Parent reply not found' });
    }
    const newReplyId = new mongoose.Types.ObjectId(); // Generate a new _id
    parentReply.replies.push({
      _id: newReplyId,
      reply: replytext,
      postedBy: userId,
      replies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await post.save();
    const updatedPost = await Post.findById(postId)
      .populate('userId')  // Populates the user who created the post
      .populate({
        path: 'comments',
        populate: [
          {
            path: 'postedBy',  // Populates the user who posted the comment
            model: 'User'
          },
          {
            path: 'replies',
            populate: [
              {
                path: 'postedBy',  // Populates the user who replied to the comment
                model: 'User'
              },
              {
                path: 'replies',
                populate: {
                  path: 'postedBy',  // Populates the user who replied to a reply
                  model: 'User'
                }
              }
            ]
          }
        ]
      })
    res.status(201).json(updatedPost);
  } catch (error) {
    console.error(error); // Improved error logging
    res.status(500).json({ message: "Server error", error });
  }
};

exports.addStory = async (req, res) => {
  try {
    const story = new Story({
      image: req.file.filename,
       
      postedBy: req.user._id, // Store the user ID
    });

    const savedStory = await story.save();


    const populatedStory = await Story.findById(savedStory._id).populate('postedBy', 'name profileImage');

    res.status(201).json(populatedStory);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

exports.getStory = async (req, res) => {
  try {
    const userId = req.user._id; // Get the logged-in user ID

    // Fetch the logged-in user's following list
    const user = await User.findById(userId).populate('following', '_id');

    const followingIds = user.following.map(user => user._id);

    // Fetch stories from followed users
    const allStories = await Story.find({ postedBy: { $in: followingIds } })
      .populate('postedBy', 'name profileImage').populate({
        path: 'viewers',
        select: 'name profileImage',
      });

    // Separate logged-in user's stories from others
    const userStories = allStories.filter(story => story.postedBy._id.toString() === userId.toString());
    const otherStories = allStories.filter(story => story.postedBy._id.toString() !== userId.toString());

    // Group stories by user
    const groupedStories = [...userStories, ...otherStories].reduce((acc, story) => {
      const userId = story.postedBy._id.toString();
      if (!acc[userId]) {
        acc[userId] = {
          user: story.postedBy,
          stories: []
        };
      }
      acc[userId].stories.push(story);
      return acc;
    }, {});

    // Format the stories
    const formattedStories = Object.values(groupedStories);

    res.status(200).json({
      allStories: formattedStories
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

exports.updateViewers = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user._id;

    const story = await Story.findById(storyId).populate('postedBy', '_id');

    if (!story) {
      return res.status(404).json({ message: 'Story not found.' });
    }
    if (story.postedBy._id.toString() !== userId.toString() && !story.viewers.includes(userId)) {
      story.viewers.push(userId);
      await story.save();
    }
    // Populate the viewer details (name and profileImage)
    const populatedStory = await Story.findById(storyId).populate({
      path: 'viewers',
      select: 'name profileImage', // Select only the fields you need
    });

    res.status(200).json(populatedStory);
  } catch (err) {
    res.status(500).json({ message: 'Error updating viewers.', error: err });
  }
};
