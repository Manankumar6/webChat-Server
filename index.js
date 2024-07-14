const express = require("express");
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8000;

const corsOptions = {
    origin: '*', // Allow only your frontend origin
    // origin: 'https://web-chat-client-eosin.vercel.app', // Allow only your frontend origin
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

app.get("/", (req, res) => {
    res.send("welcome to our chat application");
});

let users = {};
const messages = [];
let connectedUsers = [];

// Create a new instance of socket.io and enable CORS
const io = new Server(server, {
    cors: corsOptions
});

io.on("connection", (socket) => {
    socket.on('joined', (user) => {
        users[socket.id] = user;
        if (user) {

            connectedUsers.push({ id: socket.id, name: user });
        }
        socket.emit("welcome", { message:user });
        // Send existing messages to the newly joined user
        socket.emit("previousMessages", messages);
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        socket.broadcast.emit("userJoined", {date:now, user: "Admin", message: `${users[socket.id]} has joined` });
        io.emit("connectedUsers", connectedUsers);

    });

    socket.on("message", ({ message, id }) => {
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const chatMessage = {
            message,
            user: users[id],
            id,
            date:now
        };
        messages.push(chatMessage); // Store the new message
        io.emit("sendMessage", chatMessage);
    });

    socket.on('disconnect', () => {
        const user = users[socket.id];
        if (user && user.trim()) {
            connectedUsers = connectedUsers.filter(u => u.id !== socket.id);
            const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            socket.broadcast.emit("leave", {date:now, user: "Admin", message: `${user} has left` });
            delete users[socket.id];

            if (connectedUsers.length === 0) {
                messages.length = 0;

            }

            io.emit("connectedUsers", connectedUsers); // Broadcast the updated list
        }
    });
});
server.listen(PORT, () => {
    console.log(`app is listening on the port http://localhost:${PORT}`);
});
