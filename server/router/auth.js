const express = require("express");
const router = express.Router();
require("../db/connect");
const authenticate = require("../middleware/authenticate");
const authcontroller = require("../Controllers/authControllers")
//register page logic
router.post("/register", authcontroller.register);

router.post("/login", authcontroller.login);

router.get("/user", authenticate, (req, res) => {
  res.send(req.user);
});

//update logic

const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./images");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

router.post(
  "/user/update/:userId",
  upload.single("profileImage"),
  authenticate,
  authcontroller.updateUser
);

router.get("/logout", (req, res) => {
  res.status(200).send("user logout");
});

//follow logic
router.put("/user/follow/:userId", authenticate, authcontroller.userFollow);

//unfolow logic-->

router.put("/user/unfollow/:userId", authenticate, authcontroller.userUnfollow);
router.get("/user/allusers", authenticate, authcontroller.allUsers);
router.post(
  "/user/password/:userId",
  authenticate,
  authcontroller.updatePassword
);
router.post("/forgetpassword",authcontroller.forgetPassword)
    router.post("/resetpassword/:token",authcontroller.resetPassword)
module.exports = router;

router.post("/googleLogin",authcontroller.googleLogin)
router.get("/verifyaccount/:id/:token",authcontroller.verifyAccount)
router.post("/resend-confirmation",authcontroller.resendConfirmation)
router.get("/user/api/generate-token/:userId",authcontroller.generateToken)