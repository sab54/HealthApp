// server.js
const express = require('express');
const db = require('./config/db');
const usersRoute = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 3000;

// Allow CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    );
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

// Mount routes
app.use('/api/users', usersRoute(db));

// Health check
app.get('/', (req, res) => {
    res.send('✅ Server running');
});

app.listen(PORT, () => {
    console.log(`🚀 Server started at http://localhost:${PORT}`);
});
