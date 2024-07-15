const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  mobile: {
    type: Number,
  },
  password: {
    type: String,
    required: true,
  },
  confirmPassword: {
    type: String,
  },
  profileImage: {
    type: String,
    default: 'profileImg.jpg'
  },
  verified: {
    type: Boolean, default: false
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  ],
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
}, { timestamps: true });
userSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password")) {
      if (this.password) {
        this.password = await bcrypt.hash(this.password, 12);
      }
      if (this.confirmPassword) {
        this.confirmPassword = await bcrypt.hash(this.confirmPassword, 12);
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});



const User = mongoose.model("User", userSchema);
module.exports = User;
