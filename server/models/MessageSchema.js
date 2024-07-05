const mongoose = require("mongoose");
const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    content: {
      type: String,
      trim: true,
    },
    ImageUrl: {
      type: String,
      default: ""
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, 
      ref: "User" }]


  },
  { timestamps: true }
);

const Message = mongoose.model("Message", MessageSchema);
module.exports = Message;
