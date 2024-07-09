const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const chatController = require("../Controllers/chatControllers");
router.get("/api/users", authenticate, chatController.chatUsers);
router.post("/api/user/chat", authenticate, chatController.createChat);
router.get("/api/user/fetchchats", authenticate, chatController.chatData);

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


router.post("/api/user/sendmessage",  upload.single("image"), authenticate, chatController.sendMessage);

router.get(
  "/api/user/allmessages/:chatId",
  authenticate,
  chatController.allMessages
);
router.get('/user/download/:imageUrl', authenticate, chatController.downloadImg);
router.put('/user/deleteforme/:messageId', authenticate, chatController.deleteForMe);
router.post('/user/deleteforeveryone/:messageId/:chatId', authenticate, chatController.deleteForEveryone);
router.post('/user/api/creategroup', authenticate, chatController.createGroupChat);
router.put('/user/api/renamegroup', authenticate, chatController.renameGroup);
router.put('/user/api/groupadd', authenticate, chatController.addToGroup);
router.put('/user/api/groupremove', authenticate, chatController.removeFromGroup);
module.exports = router;
