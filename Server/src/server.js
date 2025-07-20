const express = require('express');
const db = require('./config/db');
const initSchema = require('./migrations/initSchema');
const usersRoute = require('./routes/user');
const authRoute = require('./routes/auth');
const licenseRoute = require('./routes/license');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

initSchema();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.use('/api/users', usersRoute(db));
app.use('/api/auth', authRoute(db));
app.use('/api/license', licenseRoute(db));

app.get('/', (req, res) => {
  res.send('✅ Server running');
});

app.listen(PORT, () => {
  console.log(`🚀 Server started at http://localhost:${PORT}`);
});
