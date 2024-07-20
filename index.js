require('dotenv').config();

const express = require("express");
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");
const connectDB = require('./config/db');
const authRoutes = require('./routes/Auth');
const cookieParser = require('cookie-parser');
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT ;

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '3mb' }));

const corsOptions = {
    origin: '*', // Replace with your frontend URL during production
    methods: ['GET', 'POST'], // Add other HTTP methods if needed
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
    credentials: true // Allow credentials (cookies, authorization headers)
};
connectDB();
app.use(cors(corsOptions));
app.use('/api/auth', authRoutes);
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
    socket.on('joined', ({user,bg}) => {
        users[socket.id] = user;
        if (user) {

            connectedUsers.push({ id: socket.id, name: user, bg });
        }
        socket.emit("welcome", { message:user });
        // Send existing messages to the newly joined user
        socket.emit("previousMessages", messages);
       
        socket.broadcast.emit("userJoined", { user: "Admin", message: `${users[socket.id]} has joined` });
        io.emit("connectedUsers", connectedUsers);

    });

    socket.on("message", ({ message, id,replyTo }) => {
      
        const chatMessage = {
            message,
            user: users[id],
            id,
            replyTo
           
        };
        messages.push(chatMessage); // Store the new message
        io.emit("sendMessage", chatMessage);
    });

    socket.on('disconnect', () => {
        const user = users[socket.id];
        if (user && user.trim()) {
            connectedUsers = connectedUsers.filter(u => u.id !== socket.id);
           
            socket.broadcast.emit("leave", { user: "Admin", message: `${user} has left` });
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
