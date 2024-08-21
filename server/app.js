const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const server = http.createServer(app);
const Routes  = require('../server/router/index')
const io = require("socket.io")(server, {
  cors: {
      origin: "http://localhost:3000",
    methods: ["GET", "POST","PUT","DELETE"],
    credentials: true,
    pingTimeout: 60000,
  },
});

const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: "./.env" });

app.use(cors({
  origin: process.env.CORS_ORIGIN_CLIENT,
  methods: ['GET', 'POST', 'PUT','DELETE'],
  credentials: true
}));

server.listen( process.env.PORT, () => {
  console.log(`Server started at port: ${process.env.PORT}`);
});

let users = [];
const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};
const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};


io.on("connection", (socket) => {

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    console.log('setup successfully')
    // socket.emit("connected");
  });

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User with ID ${userId} joined room ${userId}`);
  });

  socket.on("join chat", (room) => {
    socket.join(room);
  });
  socket.on("new message", (newMessageReceived) => {
    var chat = newMessageReceived.chat;
    if (!chat || !chat.users) {
      return console.log("chat or chat.users not defined");
    }
    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) return;
 
      socket.in(user._id).emit("message received", newMessageReceived);
      console.log(newMessageReceived.content)
    });
  });

  socket.on('create group', (groupId, groupUsers) => {
    groupUsers.forEach((user) => {
      socket.in(user._id).emit("group created");
    });
  });

  
  socket.on('leaveGroup', (chat) => {
    chat.users.forEach((user) => {
      socket.in(user._id).emit("userLeftGroup",chat);
    });

  });
 
  socket.on('removeuserbyadmin', async (chat, userId) => {

    chat.users.forEach((user) => {
      socket.in(user._id).emit("userRemoved", { chat, removedUserId: userId });
    });
    socket.in(userId).emit("userRemoved", { chat, removedUserId: userId });
  });

  
  socket.on('updateGroup', (groupChat) => { 
    groupChat.users.forEach((user) => {
      socket.in(user._id).emit("UpdateGroup-name",groupChat);
    });
});

socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  }); 
  
  socket.on('deleteMessage', (messageId) => {
    socket.broadcast.emit('messageDeleted', messageId);
  });
  
  socket.on('last message', (lastMsgData) => {
    const chatId = lastMsgData.chatId;
    io.to(chatId).emit('last message', lastMsgData); 
  });
  socket.on('startVideoCall', ({ to, roomID, from }) => {
    console.log(`Video call started from ${from.id} to ${to}`);
    io.to(to).emit('incomingVideoCall', { roomID, from });
});
socket.on('endCall', ({ roomID }) => {
  console.log(`Video call ended `);
  socket.to(roomID).emit('endCall');
});

  socket.on("disconnect", () => {
    console.log("user disconnnted!");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });

});

require("./db/connect");
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "images")));

const routes = new Routes(app);
routes.routesConfig();




