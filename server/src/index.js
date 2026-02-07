import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import { connectDB } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

import User from "./models/User.js";
import Message from "./models/Message.js";

dotenv.config();

const app = express();

// ✅ CORS for production
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  }),
);

app.use(express.json());

// Connect MongoDB
connectDB();

// Routes
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Socket.io server
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
  },
});

// Store online users
const onlineUsers = new Map();

// 🔐 Socket Auth Middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("No token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.user = user;
    next();
  } catch (error) {
    console.log("Socket auth error:", error.message);
    next(new Error("Authentication failed"));
  }
});

io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);
  console.log("User:", socket.user.name);

  // Add user to online list
  onlineUsers.set(socket.user._id.toString(), socket.id);

  // Broadcast online users list
  io.emit("onlineUsers", Array.from(onlineUsers.keys()));

  // Listen for sending message
  socket.on("sendMessage", async ({ receiverId, text }) => {
    try {
      if (!receiverId || !text) return;

      // Save message in DB
      const message = await Message.create({
        sender: socket.user._id,
        receiver: receiverId,
        text,
      });

      // Send message back to sender
      socket.emit("newMessage", message);

      // Send message to receiver if online
      const receiverSocketId = onlineUsers.get(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", message);
      }
    } catch (error) {
      console.log("sendMessage socket error:", error.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);

    onlineUsers.delete(socket.user._id.toString());

    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });
});

server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
