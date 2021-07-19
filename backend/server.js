// import the module
const express = require("express");
const http = require("http");
const socket = require("socket.io");
const helper = require("./helper");

// create an instance of the express server
const app = express();

app.use("/", express.static(__dirname + "./../public"));
console.log(__dirname + "/../public/");
// port number to listen to
const port = process.env.PORT||4444;
console.log(port)

// create a http server
const server = http.createServer(app);

users = new Map();
/* 
// bind the socket with the http server just you created
Takes the http server and some options will be delt later 
 */
const io = socket(server, {
  cors: {
    origin: "http://localhost:4444",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("invalid username"));
  }
  socket.username = username;
  next();
});

function Populate_List() {}
// main code start from here
io.on("connection", (socket) => {
  // username add to users varible
  let id = socket.id;
  console.log(socket.id + socket.username)
  users.set(socket.username,id);
  // greet the user
  let time = helper.getTime();
  let res = {};
  res.type = "info";
  res.message = `${socket.username} joined `;
  res.time = `[ ${time} ]`;
  res.username = `${socket.username}`;
  // console.log("User Joind id: ", users.get(id));
  socket.broadcast.emit("greeting", res);
  res.message = `you joined `;
  socket.emit("greeting", res);
  console.log(res);
  // active user
  io.emit("active_users", users.size);

  // sample code for testing
  const users_list = [];
  for (let [id, socket] of io.of("/").sockets) {
    users_list.push({
      userID: id,
      username: socket.username,
    });
  }

  io.emit("users_list", users_list);

  // message from the user
  socket.on("message", (data) => {
    let time = helper.getTime();
    let res = {};
    res.type = "new_message";
    res.message = data.message;
    res.time = `[ ${time} ]`;
    res.username = `${socket.username}`;
    console.log("message from  " + socket.username + " :" + data.message);
    // emit to the same client
    res.type = "self";
    socket.emit("message", res);
    // broadcast to others
    res.type = "new_message";
    socket.broadcast.emit("message", res);
  });

  // disconnection
  socket.on("disconnect", (reason) => {
    let time = helper.getTime();
    console.log(reason);
    let res = {};
    res.type = "info";
    res.message = `${socket.username} Left `;
    res.time = `[ ${time} ]`;
    res.username = `${socket.username}`;
    socket.broadcast.emit("user_disconnected", res);
    // remove the user from the users list
    users.delete(socket.username);
    // active user
    io.emit("active_users", users.size);
    // user list:
    const users_list = [];
    for (let [id, socket] of io.of("/").sockets) {
      users_list.push({
        userID: id,
        username: socket.username,
      });
    }

    io.emit("users_list", users_list);
  });

  // who is typing
  socket.on("typing", () => {
    let res = {};
    res.username = socket.username;
    console.log(res.username + "Is typing...");
    socket.broadcast.emit("typing", res);
  });

  // socket stopped typing typing event
  socket.on("stopped_typing",()=>{
    console.log(socket.username +'stopped typing');
    socket.broadcast.emit("stopped_typing");
  })

  // leave the chat
  socket.on("want_to_disconnect", () => {
    socket.disconnect();
  });

  // socket private
  socket.on("private_message", (data) => {
    console.log("message from the client:"+data);
    console.log("send to:" + data.to +"message: "+data.message);
    let time = helper.getTime();
    let res = {};
    res.type = "new_message";
    res.message = data.message;
    res.time = `[ ${time} ]`;
    res.username = `${socket.username}`;
    io.to(users.get(data.to)).emit("message",res);
    console.log("message from  " + socket.username + " :" + data.message);
    // emit to the same client
    res.type = "self";
    socket.emit("message", res);
  });
});

// start the server and listen on the port
server.listen(port, () => {
  console.log("server started on the url:" + "http://localhost:4444");
});
