// 📁 server/src/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'supersecret';

module.exports = (db) => {
  const router = express.Router();

  router.post('/login', (req, res) => {
    const { phone_number, country_code = '+91' } = req.body;

    if (!phone_number) return res.status(400).json({ success: false, message: 'Phone required' });

    db.get(
      `SELECT * FROM users WHERE phone_number = ? AND country_code = ?`,
      [phone_number, country_code],
      (err, user) => {
        if (err || !user) return res.status(401).json({ success: false, message: 'User not found' });

        const payload = {
          id: user.id,
          role: user.role,
          is_phone_verified: user.is_phone_verified,
          is_approved: user.is_approved,
        };
        const token = jwt.sign(payload, SECRET, { expiresIn: '7d' });
        res.json({ success: true, token });
      }
    );
  });

  return router;
};
