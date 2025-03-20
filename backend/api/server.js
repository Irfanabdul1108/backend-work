const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
require('dotenv').config();
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Create HTTP server and attach Socket.io
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, { 
  cors: { origin: "*" } // Adjust for production
});
app.set('io', io);

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Listen for an event to join a user's personal room
  socket.on('joinUser', (userId) => {
    socket.join(userId);
    console.log(`Socket ${socket.id} joined user room ${userId}`);
  });

  // Also, clients can join a conversation room
  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined conversation room ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Connect to MongoDB (use a DB name without spaces)
mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// Import routes
const connectionRoutes = require('../routes/connection');
app.use('/api', connectionRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
