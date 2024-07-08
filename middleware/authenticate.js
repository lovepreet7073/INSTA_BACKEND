const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");

const authenticate = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1]; // Assuming the token is sent in the Authorization header as "Bearer <token>"

    if (!token) {
      return res.status(401).json({ message: "Authorization token is missing" });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      // Extract the user ID from the token's payload
      const userId = decoded.userId;
  
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      req.user = user;
  
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
};
module.exports = authenticate;
