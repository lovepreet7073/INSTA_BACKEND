const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization
      ? req.headers.authorization.split(" ")[1]
      : null;

    if (!token) {
      throw new Error("Token not provided");
    }

    const verifyToken = jwt.verify(token, process.env.SECRET_KEY);

    if (verifyToken.exp < Date.now() / 1000) {
      throw new Error("Token has expired");
    }
    const rootUser = await User.findOne({
      _id: verifyToken._id
    });

    if (!rootUser) {
      throw new Error("User not found");
    }

    req.token = token;
    req.user = rootUser;
    
    next();
  } catch (error) {
    res.status(401).send("Unauthorized: Invalid or expired token");
  }
};


