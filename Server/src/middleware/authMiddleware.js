// Server/src/middleware/authMiddleware.js
/**
 * authMiddleware.js
 *
 * This middleware is used to verify the authentication of users based on their JWT (JSON Web Token). 
 * It checks the provided token from the Authorization header and ensures that the user is properly authenticated before allowing 
 * them to proceed with the request. Additionally, it supports role-based authorization, ensuring users can only access specific resources 
 * based on their role.
 *
 * Key functionalities:
 * - **JWT Verification**: The middleware checks the `Authorization` header for a Bearer token and verifies the token using `jwt.verify()`.
 * - **User Authentication**: If the token is valid, the user's data (decoded from the token) is added to the `req.user` object.
 * - **Role Checking**: Optionally, the middleware can enforce role-based access control by ensuring the user has the required role 
 *   (e.g., "admin").
 * - **Error Handling**: If the token is missing or invalid, or if the user does not have the necessary role, an appropriate 
 *   error response is returned (401 for missing or invalid tokens, 403 for forbidden access).
 *
 * Middleware Flow:
 * 1. Check if the token is provided in the `Authorization` header.
 * 2. If not, return a 401 error.
 * 3. If the token is present, validate it using `jwt.verify()`.
 * 4. If validation passes, proceed with the request (via `next()`).
 * 5. If the token is invalid or if the user does not have the required role, return appropriate error responses (401 or 403).
 *
 * Author: [Your Name]
 */

const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'supersecret';

function authMiddleware(requiredRole = null) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, SECRET);
      req.user = decoded;
      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
      next();
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
  };
}

module.exports = authMiddleware;
