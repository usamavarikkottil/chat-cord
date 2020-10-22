const express = require('express');
const path = require("path");
require("dotenv").config();
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const { format } = require('path');
const { userJoin, getCurrentUser, userLeave, getRoomUsers} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const botName = "Chat Cord Bot";

// Run when client connects
io.on("connection", socket => {

    socket.on("joinRoom", ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        // Emit to the current user when he connects
        socket.emit("message", formatMessage(botName, "Welcome to chatcord"));

        //Broadcast emit when a user connects to all the clients except the current user
        socket.broadcast
        .to(user.room)
        .emit("message", formatMessage(botName, `${user.username} has joined the chat...`));

    });


    // Listen for chatMessage from client
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);

        console.log(`Server just received the message: ${msg}`); // console.log the chatMessage just received from the client on the server
        
        io.to(user.room).emit("message", formatMessage(user.username, msg));
        console.log("message has been sent back to the client...\n")
    });

    // Runs when client disconnects
    socket.on("disconnect", () => {
        const user = userLeave(socket.id);
        if(user) {
            // Emits to the current user and all the other users, when he disconnects
            io.to(user.room).emit("message", formatMessage(botName, `${user.username} has left the chat`))

        }
    })
});


// app.get("/", (req, res) => {
//     res.send("Hi! Iam ready!");
// });

app.post("/", (req, res) => {
    res.send("Hi! Post okay...!");
});


const port = process.env.port || 5000
server.listen(port, () => console.log("server started...."));
