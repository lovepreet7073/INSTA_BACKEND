const User = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET_KEY;
const sendMail = require("../utils/mailUtil");
const {generateToken04} = require("../utils/tokenGenerator")
const Token = require("../models/tokenschema");

exports.register = async (req, res) => {
  const { name, email, mobile, password, confirmPassword } = req.body;

  if (!name || !email || !mobile || !password || !confirmPassword) {
    return res.status(422).json({ error: "Please fill all fields" });
  }
  let user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(433).send({ message: "User already exists!" });
  }
  try {
    const user = new User({ name, email, mobile, password, confirmPassword });
    await user.save();

    const token = await new Token({
      userId: user._id,
      token: jwt.sign({ _id: user._id }, secretKey, {
        expiresIn: "5m",
      }),
    }).save();

    const mailHtml = `  
      <div style="font-family: Arial, sans-serif; text-align: center;">
        <h2>Verify Email</h2>
        <p>click below to Verify your Email.</p>
        <a href="http://localhost:3000/verifyaccount/${user._id}/${token.token}" style="display: inline-block; margin: 20px auto; padding: 10px 20px; font-size: 16px; color: #1A1919 ; background-color: #5cdd5c; text-decoration: none; border-radius: 5px;">Verify Email</a>

      </div>
    `;

    await sendMail(user.email, "verify Email", mailHtml);

    res
      .status(201)
      .json({ message: "An Email sent to your account please verify!" });
  } catch (err) {
    console.log(err);
  }
};

exports.verifyAccount = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(400).send({ message: "Invalid Link" });

    const tokenDoc = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!tokenDoc) return res.status(400).send({ message: "Invalid Link" });

    const decoded = jwt.verify(req.params.token, secretKey);
    console.log(tokenDoc.token,decoded.exp,Date.now()/1000,'testt');
    if (decoded.exp <= Math.floor(Date.now() / 1000)) {
      // Token is expired
      await Token.deleteOne({ _id: tokenDoc._id });
      return res.status(401).send({ message: "Token has expired. Please request a new verification link." });
    }

    user.verified = true;
    await user.save();

    // Remove the token from the database
    // await Token.deleteOne({ _id: tokenDoc._id });
    res.status(200).send({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).send({ message: "Internal Server Error!" });
  }
};

exports.resendConfirmation = async (req, res) => {
  const { email } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not registered" });
    }

    if (user.verified) {
      return res.status(400).json({ message: "Email already confirmed." });
    }

    const newToken = jwt.sign({ _id: user._id }, secretKey, { expiresIn: "5m" });

    await Token.findOneAndUpdate(
      { userId: user._id },
      { token: newToken },
      { upsert: true, new: true }
    );

    const mailHtml = `
      <div style="font-family: Arial, sans-serif; text-align: center;">
        <h2>Verify Email</h2>
        <p>Click below to verify your email.</p>
        <a href="http://localhost:3000/verifyaccount/${user._id}/${newToken}" style="display: inline-block; margin: 20px auto; padding: 10px 20px; font-size: 16px; color: #1A1919; background-color: #5cdd5c; text-decoration: none; border-radius: 5px;">Verify Email</a>
      </div>
    `;

    await sendMail(user.email, "Verify Email", mailHtml);
    res.status(200).json({ message: "New confirmation email sent." });
  } catch (error) {
    console.error("Resend confirmation error:", error);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    if (!user.verified) {
      let token = await Token.findOne({ userID: user._id });
      if (!token) {
        const token = jwt.sign({ _id: user._id }, secretKey, {
          expiresIn: "1d",
        });

        const mailHtml = `
      <div style="font-family: Arial, sans-serif; text-align: center;">
        <h2>Verify Email</h2>
        <p>click below to Verify your Email.</p>
        <a href="http://localhost:3000/verifyaccount/${user._id}/${token}" style="display: inline-block; margin: 20px auto; padding: 10px 20px; font-size: 16px; color: #1A1919 ; background-color: #5cdd5c; text-decoration: none; border-radius: 5px;">verify email</a>

      </div>
    `;

        await sendMail(user.email, "verify Email", mailHtml);
      }
      return res
        .status(400)
        .send({ message: "An Email sent to your account please verify!" });
    }
    const token = jwt.sign({ _id: user._id }, secretKey, {
      expiresIn: "1d",
    });

    res.json({ token, user });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Server error during login" });
  }
};

exports.updateUser = async (req, res) => {
  const { name, mobile } = req.body;
  const userId = req.params.userId;

  if (!name || !mobile) {
    return res
      .status(400)
      .json({ error: "Name and mobile are required fields" });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.name = name;
    user.mobile = mobile;
    if (req.file) {
      user.profileImage = req.file.filename;
    }
    await user.save();
    return res.json({
      message: "User data updated successfully!",
      user: user,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Update error!" });
  }
};

exports.userFollow = async (req, res) => {
  const userId = req.params.userId;
  const { loginUserId } = req.body;

  if (!loginUserId) {
    return res.status(400).json({ error: "Missing followId in request body" });
  }

  try {
    const currentUser = await User.findById(loginUserId);
    const userBeingFollowed = await User.findById(userId);

    if (!currentUser) {
      return res.status(404).json({ error: "Current user not found" });
    }

    if (!userBeingFollowed) {
      return res.status(404).json({ error: "User to follow not found" });
    }

    if (currentUser.following.includes(userId)) {
      return res
        .status(400)
        .json({ error: "You are already following this user" });
    }

    userBeingFollowed.followers.push(loginUserId);

    currentUser.following.push(userId);

    await currentUser.save();
    await userBeingFollowed.save();
    const users = await User.find();

    if (!users) {
      return res.status(404).json({ error: "No user found" });
    }

    res.json({
      success: true,
      currentUser: currentUser,
      userBeingFollowed: userBeingFollowed,
      users: users,
    });
  } catch (error) {
    console.log(error,"error")
    res.status(422).json({ error: error.message });
  }
};

exports.userUnfollow = async (req, res) => {
  const userId = req.params.userId;
  const { loginUserId } = req.body;

  if (!loginUserId) {
    return res.status(400).json({ error: "Missing followId in request body" });
  }

  try {
    const currentUser = await User.findById(loginUserId);
    const userBeingUnfollowed = await User.findById(userId);

    if (!currentUser) {
      return res.status(404).json({ error: "Current user not found" });
    }

    if (!userBeingUnfollowed) {
      return res.status(404).json({ error: "User being unfollowed not found" });
    }

    if (!userBeingUnfollowed.followers.includes(loginUserId)) {
      return res.status(400).json({ error: "This user is not following you" });
    }

    userBeingUnfollowed.followers.pull(loginUserId);

    currentUser.following.pull(userId);

    await currentUser.save();
    await userBeingUnfollowed.save();
    const users = await User.find();

    if (!users) {
      return res.status(404).json({ error: "No user found" });
    }
    res.json({
      success: true,
      message: "Unfollowed successfully",
      currentUser: currentUser,
      userBeingUnfollowed: userBeingUnfollowed,
      users: users,
    });
  } catch (error) {
    res.status(422).json({ error: error.message });
  }
};

exports.allUsers = async (req, res) => {
  try {
    const user = await User.find();

    if (!user) {
      return res.status(404).json({ error: "No user found" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error while fetching user data" });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { password, newPassword, confirmPassword } = req.body;

    if (!password || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ error: "New password and confirmation do not match" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "password is incorrect" });
      
    }
    const hashedPassword = await bcrypt.hash(newPassword, 8);

    user.password = newPassword;

    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {

    console.error("Error changing password:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.forgetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(422).json({ message: "User not registered!" });
    }

    const token = jwt.sign({ _id: user._id }, secretKey, {
      expiresIn: "1m",
    });

    const mailHtml = `
      <div style="font-family: Arial, sans-serif; text-align: center;">
        <h2>Password Reset</h2>
        <p>Seems like you forgot your password click below to reset your password.</p>
        <a href="http://localhost:3000/resetpassword/${token}" style="display: inline-block; margin: 20px auto; padding: 10px 20px; font-size: 16px; color: #1A1919 ; background-color: #F6238C; text-decoration: none; border-radius: 5px;">Reset My Password</a>
        <p>If you did not forget your password you can safely ignore this email.</p>
      </div>
    `;

    try {
      const mailResponse = await sendMail(email, "Password Reset", mailHtml);
      return res.json(mailResponse);
    } catch (mailError) {
      return res.json({ message: mailError.message });
    }
  } catch (error) {
    console.error("Forget password error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const id = decoded._id;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(
      { _id: id },
      { password: hashedPassword, confirmPassword: hashedPassword } // Update both fields
    );

    return res.json({ status: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

//api for google login



exports.googleLogin = async (req, res) => {
  const { email_verified, email, name, clientId, picture } = req.body;

  if (email_verified) {
    User.findOne({ email: email }).then(async (savedUser) => {
      if (savedUser) {
        if (!savedUser.verified) {
          savedUser.verified = true;
          await savedUser.save();
        }

        const token = jwt.sign({ _id: savedUser._id }, secretKey);
        const { _id, name, email } = savedUser;
        res.json({ token, user: { _id, name, email } });
      } else {
        const password = email + clientId;
        const newUser = new User({
          name,
          email,
          password: password,
          profileImage: picture,
          verified: true,
        });

        newUser.save()
          .then((user) => {
            const token = jwt.sign({ _id: user._id }, secretKey, { expiresIn: "1d" });
            const { _id, name, email } = user;
            res.json({ token, user: { _id, name, email } });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({ error: "Failed to create new user" });
          });
      }
    });
  } else {
    res.status(400).json({ error: "Email is not verified" });
  }
};


exports.generateToken = async(req,res,next)=>{
try {
  const appId = parseInt(process.env.APP_ID);
  const serverSecret = process.env.SECRET_SERVER_ID;
  const userId = req.params.userId;
  const effectiveTime = 3600;
  const payload = "";
  if(appId && serverSecret && userId){
    const token = generateToken04(appId,userId,serverSecret,effectiveTime,payload);
    res.status(200).json({token});
  } else {
    return res.status(400).send("User id,app id and server secret is required!");
  }
} catch (error) {
  next(error);
}
}