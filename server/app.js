const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
    pingTimeout: 60000,
  },
});

const dotenv = require("dotenv");
const path = require("path");
const port = 5000;

dotenv.config({ path: "./.env" });

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT'],
  credentials: true
}));

server.listen(port, () => {
  console.log(`Server started at port: ${port}`);
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
  console.log("A user connected (socket.io)", socket.id);

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    console.log(`User with ID ${userData._id} setup`);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log(`User joined room ${room}`);
  });
  socket.on("new message", (newMessageReceived) => {
    var chat = newMessageReceived.chat;
    if (!chat || !chat.users) {
      return console.log("chat or chat.users not defined");
    }
    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) return;
      socket.in(user._id).emit("message received", newMessageReceived);
    });
    console.log(newMessageReceived.content, 'qwertyui');
  });
  socket.on('create group', (groupId, groupUsers) => {
    console.log('GROUP UPDATE:-', groupId,groupUsers);
    groupUsers.forEach((user) => {
      // if (user._id == newMessageReceived.sender._id) return;
      socket.in(user._id).emit("group created");
    });
    // io.emit('group created', { groupId, groupUsers });

  });
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    console.log(userId, socket.id);
    io.emit("getUsers", users);
  });
  socket.on('deleteMessage', (messageId) => {
    console.log(messageId,"messageDeleted");
    socket.broadcast.emit('messageDeleted', messageId);
  });
  
  

  socket.on('last message', (lastMsgData) => {
    const chatId = lastMsgData.chatId;
    console.log('Received last message update:', lastMsgData);
    io.to(chatId).emit('last message', lastMsgData); // Broadcast to all clients in the chat room
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
app.use(require("./router/auth"));
app.use(require("./router/postAuth"));
app.use(require("./router/message"));

app.get("/login", (req, res) => {
  res.send(`Login page`);
});

app.get("/logout", (req, res) => {
  res.send(`Logout page`);
});

app.get("/register", (req, res) => {
  res.send(`Register page`);
});
app.get("/forgetpassword", (req, res) => {
  res.send(`forgetpassword page`);
});

app.get("/user/update/:userId", (req, res) => {
  res.send("Update user details");
});

app.get("/contact", (req, res) => {
  res.cookie("test", "formtoken");
  res.send(`Contact page`);
});

app.get("/user/createpost/:userId", (req, res) => {
  res.send(`Post page`);
});

app.get("/user/posts/:userId", (req, res) => {
  res.send(`User posts page`);
});

app.get("/user/deletepost/:postId", (req, res) => {
  res.send("Delete post");
});

app.get("/user/updatepost/:postId", (req, res) => {
  res.send("Update post");
});

app.get("/user/editpost/:postId", (req, res) => {
  res.send("Edit post");
});

app.get("/user/allposts", (req, res) => {
  res.send("All posts");
});

app.get("/user/likepost/:postId/:userId", (req, res) => {
  res.send("Like post");
});

app.get("/user/send/:id", (req, res) => {
  res.send("Message page");
});

app.get("/user/receive/:id", (req, res) => {
  res.send("Receive message page");
});
