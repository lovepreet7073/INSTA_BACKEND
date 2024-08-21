const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const authcontroller = require("../Controllers/authControllers")
const upload = require("../middleware/multerMiddleware");
const constants = require("../constants/apiUrls")
//register page logic
router.post(  constants.REGISTER_URL, authcontroller.register);

router.post(constants.LOGIN_URL, authcontroller.login);

router.get(constants.USER_URL, authenticate, (req, res) => {
  res.send(req.user);
});



router.post(
  constants.UPDATE_USER_URL,
  upload.single("profileImage"),
  authenticate,
  authcontroller.updateUser
);

router.get(constants.LOGOUT_URL, (req, res) => {
  res.status(200).send("user logout");
});

//follow logic
router.put(constants.FOLLOW_USER_URL, authenticate, authcontroller.userFollow);

//unfolow logic-->

router.put(constants.UNFOLLOW_USER_URL, authenticate, authcontroller.userUnfollow);
router.get(constants.ALL_USERS_URL, authenticate, authcontroller.allUsers);
router.post(
  constants.UPDATE_PASSWORD_URL,
  authenticate,
  authcontroller.updatePassword
);
router.post(constants.FORGET_PASSWORD_URL, authcontroller.forgetPassword)
router.post(constants.RESET_PASSWORD_URL, authcontroller.resetPassword)


router.post(constants.GOOGLE_LOGIN_URL, authcontroller.googleLogin)
router.get(constants.VERIFY_ACCOUNT_URL, authcontroller.verifyAccount)
router.post(constants.RESEND_CONFIRMATION_URL, authcontroller.resendConfirmation)
module.exports = router;