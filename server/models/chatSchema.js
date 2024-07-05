const mongoose = require("mongoose");


const ChatSchema = new mongoose.Schema({
  chatName: { type: String, trim: true },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  latestMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
    default: null,
  }
}, {
  timestamps: true,
});

const Chat = mongoose.model("Chat", ChatSchema);
module.exports = Chat;
