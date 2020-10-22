const express = require('express');
const path = require("path");
require("dotenv").config();
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const { format } = require('path');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const botName = "Chat Cord Bot";

// Run when client connects
io.on("connection", socket => {
    // Emit to the current user when he connects
    socket.emit("message", formatMessage(botName, "Welcome to chatcord"));
     
    //Broadcast emit when a user connects to all the clients except the current user
    socket.broadcast.emit("message", formatMessage(botName, "A User has joined the chat..."));

    // Runs when client disconnects
    socket.on("disconnect", () => {

        // Emits to the current user and all the other users, when he disconnects
        io.emit("message", formatMessage(botName, "user has left the chat"))
    })

      // Listen for chatMessage from clent
  socket.on('chatMessage', msg => {
      console.log(`Server just received the message: ${msg}`); // console.log the chatMessage just received from the client on the server
      io.emit("message",formatMessage("User",  msg));
      console.log("message has been sent back to the client...\n")
  });
});


// app.get("/", (req, res) => {
//     res.send("Hi! Iam ready!");
// });

app.post("/", (req, res) => {
    res.send("Hi! Post okay...!");
});


const port = process.env.port || 5000
server.listen(port, () => console.log("server started...."));
