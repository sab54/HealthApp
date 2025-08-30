// Server/src/server.js
/**
 * Server Setup (server.js)
 *
 * This file sets up the Express server, configures WebSocket support using Socket.IO, 
 * and mounts the various API routes for user authentication, health tracking, chat, 
 * appointments, and other functionalities. It also sets up the server for serving static files.
 * 
 * Features:
 * - Express Server: Configures the server to handle HTTP requests and APIs.
 * - WebSocket Support: Integrates Socket.IO to provide real-time functionality (e.g., chat updates, notifications).
 * - Route Handling: Mounts various API routes such as `/api/users`, `/api/auth`, and `/api/healthlog`.
 * - Static File Handling: Serves static files (e.g., uploaded certificates) through the `/uploads` endpoint.
 * - CORS: Configures Cross-Origin Resource Sharing (CORS) headers for API access from different origins.
 * 
 * Key Functionality:
 * - `socketHandler(io)`: Initializes the WebSocket event handlers for user and chat room interactions.
 * - `initSchema()`: Initializes the database schema using migration files.
 * - API Routes: The server is configured to handle various routes including user management, chat, health logs, and appointments.
 * - CORS: Ensures that the API is accessible from different origins with appropriate headers.
 * 
 * Dependencies:
 * - express: Web framework for handling HTTP requests and API routes.
 * - socket.io: Library for WebSocket-based communication to enable real-time features.
 * - http: Core Node.js module for creating the HTTP server.
 * - path: Module for handling file and directory paths, particularly for serving static files.
 * 
 * Author: Sunidhi Abhange
 */

const express = require('express');
const db = require('./config/db');
const initSchema = require('./migrations/initSchema');
const usersRoute = require('./routes/user');
const authRoute = require('./routes/auth');
const licenseRoute = require('./routes/license');
const chatRoute = require('./routes/chat');
const healthlogRoute = require('./routes/healthlog');
const appointmentRoute = require('./routes/appointment');
const stepsTrackerRoute = require('./routes/stepsTracker');
const path = require('path');

const http = require('http');
const { Server } = require('socket.io');
const socketHandler = require('./sockets'); // Assumes you already have Server/src/sockets/index.js

const app = express();
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

// Create WebSocket server instance
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Initialize socket event handlers
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
app.use('/api/steps', stepsTrackerRoute(db));

// Root route
app.get('/', (req, res) => {
  res.send('Server running');
});

// Replace app.listen with server.listen to include WebSockets
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
