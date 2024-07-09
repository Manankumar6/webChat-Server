const express = require("express");
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8000;

const corsOptions = {
    origin: 'https://web-chat-client-eosin.vercel.app', // Allow only your frontend origin
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

app.get("/", (req, res) => {
    res.send("welcome to our chat application");
});

let users = {};
console.log(users, "all users")
// Create a new instance of socket.io and enable CORS
const io = new Server(server, {
    cors: corsOptions
});

io.on("connection", (socket) => {
    console.log("New Connection", socket.id);

    socket.on('joined', (user) => {
        users[socket.id] = user;
        socket.emit("welcome", { message: "Welcome to webChat" })
        console.log(users, "all users")
        // Notify all users except the one who just joined
        socket.broadcast.emit("userJoined", { message: `${users[socket.id]} has joined` });
    });
    socket.on("message",({message,id})=>{
        io.emit("sendMessage",{message,user:users[id],id})
    })
    socket.on('disconnect', () => {
        if (users[socket.id]) {
            socket.broadcast.emit("leave", { user: "Admin", message: `${users[socket.id]} has left` });
            delete users[socket.id];
        }
    });
});
server.listen(PORT, () => {
    console.log(`app is listening on the port http://localhost:${PORT}`);
});
