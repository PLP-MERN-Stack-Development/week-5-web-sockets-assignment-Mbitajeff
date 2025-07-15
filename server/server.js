// server.js - Main server file for Socket.io chat application

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store connected users, messages, and rooms
const users = {};
const messages = [];
const typingUsers = {};
const rooms = { 'General': { name: 'General', users: [] } }; // Default room

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user joining (default to General room)
  socket.on('user_join', (username) => {
    users[socket.id] = { username, id: socket.id, room: 'General' };
    socket.join('General');
    rooms['General'].users.push(socket.id);
    io.emit('user_list', Object.values(users));
    io.emit('user_joined', { username, id: socket.id });
    io.emit('room_list', Object.keys(rooms));
    console.log(`${username} joined the chat (General)`);
  });

  // Handle room creation
  socket.on('create_room', (roomName) => {
    if (!rooms[roomName]) {
      rooms[roomName] = { name: roomName, users: [] };
      io.emit('room_list', Object.keys(rooms));
    }
  });

  // Handle joining a room
  socket.on('join_room', (roomName) => {
    const user = users[socket.id];
    if (user && rooms[roomName]) {
      // Leave previous room
      socket.leave(user.room);
      if (rooms[user.room]) {
        rooms[user.room].users = rooms[user.room].users.filter(id => id !== socket.id);
      }
      // Join new room
      socket.join(roomName);
      user.room = roomName;
      rooms[roomName].users.push(socket.id);
      io.emit('user_list', Object.values(users));
      io.emit('room_list', Object.keys(rooms));
      io.to(roomName).emit('system_message', `${user.username} joined ${roomName}`);
    }
  });

  // Handle leaving a room
  socket.on('leave_room', (roomName) => {
    const user = users[socket.id];
    if (user && rooms[roomName]) {
      socket.leave(roomName);
      rooms[roomName].users = rooms[roomName].users.filter(id => id !== socket.id);
      io.to(roomName).emit('system_message', `${user.username} left ${roomName}`);
      // Optionally, join General room
      socket.join('General');
      user.room = 'General';
      rooms['General'].users.push(socket.id);
      io.emit('user_list', Object.values(users));
      io.emit('room_list', Object.keys(rooms));
    }
  });

  // Handle chat messages (room-based)
  socket.on('send_message', (messageData) => {
    const user = users[socket.id];
    const room = user?.room || 'General';
    const message = {
      ...messageData,
      id: Date.now(),
      sender: user?.username || 'Anonymous',
      senderId: socket.id,
      room,
      timestamp: new Date().toISOString(),
    };
    messages.push(message);
    if (messages.length > 100) messages.shift();
    io.to(room).emit('receive_message', message);
    // Notification event for new message
    io.to(room).emit('notify_message', message);
  });

  // Handle typing indicator (room-based)
  socket.on('typing', (isTyping) => {
    const user = users[socket.id];
    if (user) {
      const username = user.username;
      if (isTyping) {
        typingUsers[socket.id] = username;
      } else {
        delete typingUsers[socket.id];
      }
      io.to(user.room).emit('typing_users', Object.values(typingUsers));
    }
  });

  // Handle private messages
  socket.on('private_message', ({ to, message }) => {
    const messageData = {
      id: Date.now(),
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      message,
      timestamp: new Date().toISOString(),
      isPrivate: true,
    };
    socket.to(to).emit('private_message', messageData);
    socket.emit('private_message', messageData);
    // Notification event for private message
    socket.to(to).emit('notify_private', messageData);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user) {
      const { username, room } = user;
      io.emit('user_left', { username, id: socket.id });
      if (rooms[room]) {
        rooms[room].users = rooms[room].users.filter(id => id !== socket.id);
      }
      console.log(`${username} left the chat`);
    }
    delete users[socket.id];
    delete typingUsers[socket.id];
    io.emit('user_list', Object.values(users));
    io.emit('typing_users', Object.values(typingUsers));
    io.emit('room_list', Object.keys(rooms));
  });
});

// API routes
app.get('/api/messages', (req, res) => {
  res.json(messages);
});

app.get('/api/users', (req, res) => {
  res.json(Object.values(users));
});

app.get('/api/rooms', (req, res) => {
  res.json(Object.keys(rooms));
});

// Root route
app.get('/', (req, res) => {
  res.send('Socket.io Chat Server is running');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io }; 