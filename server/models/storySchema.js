const mongoose = require("mongoose");

const storySchema = new mongoose.Schema({
  image: {
    type: String,
    required:true
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '24h',
  },
  viewers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    
    },
  ],
});

const Story = mongoose.model("Story", storySchema);

module.exports = Story;
