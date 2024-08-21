// constants.js
module.exports = {
    //authentication url's
    
    REGISTER_URL: "/register",
    LOGIN_URL: "/login",
    USER_URL: "/user",
    UPDATE_USER_URL: "/user/update/:userId",
    FOLLOW_USER_URL: "/user/follow/:userId",
    UNFOLLOW_USER_URL: "/user/unfollow/:userId",
    ALL_USERS_URL: "/user/allusers",
    UPDATE_PASSWORD_URL: "/user/password/:userId",
    FORGET_PASSWORD_URL: "/forgetpassword",
    RESET_PASSWORD_URL: "/resetpassword/:token",
    GOOGLE_LOGIN_URL: "/googleLogin",
    VERIFY_ACCOUNT_URL: "/verifyaccount/:id/:token",
    RESEND_CONFIRMATION_URL: "/resend-confirmation/:id",
    LOGOUT_URL: "/logout",


      // Post URLs
  CREATE_POST_URL: "/user/createpost/:userId",
  USER_POSTS_URL: "/user/posts/:userId",
  DELETE_POST_URL: "/user/deletepost/:postId",
  EDIT_POST_URL: "/user/editpost/:postId",
  UPDATE_POST_URL: "/user/updatepost/:postId",
  ALL_POSTS_URL: "/user/allposts/:userId",
  LIKE_POST_URL: "/user/likepost/:postId/:userId",

  // Comment URLs
  CREATE_COMMENT_URL: "/user/api/comment",
  REPLY_COMMENT_URL: "/user/api/comment/:commentId/:postId",
  REPLY_ON_REPLY_URL: "/user/api/replyonComment/:commentId/:postId",

  // Story URLs
  ADD_STORY_URL: "/user/api/addstory",
  GET_STORY_URL: "/user/api/getstory",
  UPDATE_VIEWERS_URL: "/user/api/updateviewers/:storyId",
  
  // Other User URLs
  GET_USER_URL: "/user/:userId",

//chat URL'S
  CHAT_USERS_URL: "/api/users",
  CREATE_CHAT_URL: "/api/user/chat",
  FETCH_CHATS_URL: "/api/user/fetchchats",
  SEND_MESSAGE_URL: "/api/user/sendmessage",
  ALL_MESSAGES_URL: "/api/user/allmessages/:chatId",
  DOWNLOAD_IMAGE_URL: "/user/download/:imageUrl",
  DELETE_FOR_ME_URL: "/user/deleteforme/:messageId",
  DELETE_FOR_EVERYONE_URL: "/user/deleteforeveryone/:messageId/:chatId",
  CREATE_GROUP_CHAT_URL: "/user/api/creategroup",
  RENAME_GROUP_URL: "/user/api/renamegroup",
  ADD_TO_GROUP_URL: "/user/api/groupadd",
  REMOVE_FROM_GROUP_URL: "/user/api/groupremove",
  USER_REMOVE_FROM_GROUP_URL: "/user/api/userremove/:userId",
  };
  