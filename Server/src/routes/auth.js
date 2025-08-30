// server/src/routes/auth.js
/**
 * Authentication Routes (auth.js)
 *
 * This file defines the authentication route for user login using phone number and country code.
 * Upon successful login, a JSON Web Token (JWT) is issued for user authentication in subsequent requests.
 * 
 * Features:
 * - POST /login: Allows users to log in using their phone number and country code. If successful,
 *   a JWT token is generated and sent to the user for subsequent use in authentication.
 * 
 * Key Components:
 * - JWT Authentication: Uses the jsonwebtoken package to sign a JWT token with the user's ID, role,
 *   phone verification status, and approval status.
 * - Database: Queries the users table to check if the provided phone number and country code match an existing user.
 * 
 * This file uses the following libraries:
 * - express: Web framework for building API routes.
 * - jsonwebtoken: Package used to generate JWT tokens for user authentication.
 * 
 * Author: Sunidhi Abhange
 */

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
