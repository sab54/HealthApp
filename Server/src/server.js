// Server/src/server.js
const express = require('express');
const db = require('./config/db');
const initSchema = require('./migrations/initSchema');
const usersRoute = require('./routes/user');
const authRoute = require('./routes/auth');
const licenseRoute = require('./routes/license');
const chatRoute = require('./routes/chat');
const healthlogRoute = require('./routes/healthlog');
const appointmentRoute = require('./routes/appointment');
const path = require('path');




// NEW: Add these for socket support
const http = require('http');
const { Server } = require('socket.io');
const socketHandler = require('./sockets'); // Assumes you already have Server/src/sockets/index.js

const app = express();
const PORT = process.env.PORT || 3000;

// NEW: Create HTTP server manually (needed for socket.io)
const server = http.createServer(app);

// NEW: Create WebSocket server instance
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// NEW: Initialize socket event handlers
socketHandler(io);

initSchema();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (certificates)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// CORS headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

// Mount routes
app.use('/api/users', usersRoute(db));
app.use('/api/auth', authRoute(db));
app.use('/api/license', licenseRoute(db));
app.use('/api/chat', chatRoute(db,io));
app.use('/api/healthlog', healthlogRoute(db));
app.use('/api/appointment', appointmentRoute(db));

// Root route
app.get('/', (req, res) => {
  res.send('Server running');
});

// 🔁 Replace app.listen with server.listen to include WebSockets
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
