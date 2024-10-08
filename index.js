require('dotenv').config();

const express = require("express");
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");
const connectDB = require('./config/db');
const authRoutes = require('./routes/Auth');
const friendRoutes = require("./routes/Friends")
const cookieParser = require('cookie-parser');
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT;

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '3mb' }));

const corsOptions = {
    origin: true, // Replace with your frontend URL during production
    methods: ['GET', 'POST', 'DELETE'], // Add other HTTP methods if needed
    // allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
    credentials: true // Allow credentials (cookies, authorization headers)
};
connectDB();
app.use(cors(corsOptions));
app.use('/api/auth', authRoutes);
app.use('/api/auth', friendRoutes);
app.get("/", (req, res) => {
    res.send("welcome to our chat application");
});
let users = {};

let loginUser = {};
let connectedLoginUser = []
const messages = [];
const loginUserMsg = [];
let connectedUsers = [];
// Create a new instance of socket.io and enable CORS

const io = new Server(server, {
    cors: corsOptions
});

io.on("connection", (socket) => {
    // for guest user 

    socket.on('guestJoined', ({ user, bg }) => {
        users[socket.id] = user;
        if (user) {

            connectedUsers.push({ id: socket.id, name: user, bg });
        }
        socket.emit("welcome", { message: user });
        // Send existing messages to the newly joined user
        socket.emit("previousMessages", messages);

        socket.broadcast.emit("guestUserJoined", { user: "Admin", message: `${users[socket.id]} has joined` });
        io.emit("connectedUsers", connectedUsers);

    });

    // for login users 
    socket.on("login", ({ username, bg }) => {
        loginUser[socket.id] = username;
        if (username) {
            connectedLoginUser.push({ id: socket.id, name: username, bg });
        }

        socket.broadcast.emit("userjoin", { user: "Admin", message: `${loginUser[socket.id]} has joined` })

        io.emit('connectedUser', connectedLoginUser)
        

    })




    socket.on("message", ({ message, id, replyTo }) => {

        const chatMessage = {
            message,
            user: users[id],
            id,
            replyTo

        };
        messages.push(chatMessage); // Store the new message

        io.emit('sendMessage', chatMessage);

    });

    socket.on("login_user_msg", ({roomName, message, id }) => {
        console.log(message, id)
        const chatMessage = {
            message,
            loginUser: loginUser[id],
            id,
        };
        loginUserMsg.push(chatMessage)
        io.emit("receiveMsg", chatMessage)
        io.to(roomName).emit("receiveMessage", { message, id });
    })
    socket.on("joinRoom", ({ userId, selectedUserId }) => {
        const roomName = [userId, selectedUserId].sort().join("-"); // Generate a unique room name
        socket.join(roomName); // Join the room
        socket.emit("joinedRoom", roomName); // Notify the user they have joined the room
        console.log(`User ${userId} joined room: ${roomName}`);
    });

    socket.on('disconnect', () => {
        const user = users[socket.id];
        if (user) {
            connectedUsers = connectedUsers.filter(u => u.id !== socket.id);

            socket.broadcast.emit("leave", { user: "Admin", message: `${user} has left` });
            delete users[socket.id];

            if (connectedUsers.length === 0) {
                messages.length = 0;

            }

            io.emit("connectedUsers", connectedUsers); // Broadcast the updated list
        }
        // Handle login user disconnect
        if (loginUser[socket.id]) {
            const user = loginUser[socket.id];
            connectedLoginUser = connectedLoginUser.filter(u => u.id !== socket.id);
            socket.broadcast.emit("leave", { user: "Admin", message: `${user.username} has left` });
            delete loginUser[socket.id];

            io.emit('connectedUser', connectedLoginUser);  // Broadcast updated connected login users list
        }
    });
});
server.listen(PORT, () => {
    console.log(`app is listening on the port http://localhost:${PORT}`);
});
