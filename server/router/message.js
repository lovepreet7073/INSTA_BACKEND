const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const chatController = require("../Controllers/chatControllers");
const upload = require("../middleware/multerMiddleware");
const constants = require('../constants/apiUrls')

router.get(constants.CHAT_USERS_URL, authenticate, chatController.chatUsers);
router.post(constants.CREATE_CHAT_URL, authenticate, chatController.createChat);
router.get(constants.FETCH_CHATS_URL, authenticate, chatController.chatData);




router.post(constants.SEND_MESSAGE_URL, upload.single("image"), authenticate, chatController.sendMessage);

router.get(
  constants.ALL_MESSAGES_URL,
  authenticate,
  chatController.allMessages
);
router.get(constants.DOWNLOAD_IMAGE_URL, authenticate, chatController.downloadImg);
router.put(constants.DELETE_FOR_ME_URL, authenticate, chatController.deleteForMe);
router.post(constants.DELETE_FOR_EVERYONE_URL, authenticate, chatController.deleteForEveryone);
router.post(constants.CREATE_GROUP_CHAT_URL, authenticate, chatController.createGroupChat);
router.put(constants.RENAME_GROUP_URL, authenticate, chatController.renameGroup);
router.put(constants.ADD_TO_GROUP_URL, authenticate, chatController.addToGroup);
router.put(constants.REMOVE_FROM_GROUP_URL, authenticate, chatController.removeFromGroup);
router.put(constants.USER_REMOVE_FROM_GROUP_URL, authenticate, chatController.userRemoveFromGroup);
module.exports = router;
