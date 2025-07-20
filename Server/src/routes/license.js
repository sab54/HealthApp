// 📁 server/src/routes/license.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware'); // Keep only this
const requireApprovedDoctor = require('../middleware/requireApprovedDoctor');

const upload = multer({
  dest: path.join(__dirname, '../../uploads'),
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = (db) => {
  const router = express.Router();

  // ✅ Allow all logged-in doctors (even if pending) to upload
  router.post('/upload', authMiddleware(), upload.single('license'), (req, res) => {
    const userId = req.user.id;
    const file = req.file;

    // ✅ Check role manually
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Only doctors can upload licenses' });
    }

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const filePath = `/uploads/${file.filename}`;

    db.run(
      `INSERT INTO doctor_licenses (user_id, file_path) VALUES (?, ?)`,
      [userId, filePath],
      (err) => {
        if (err) {
          console.error('❌ DB insert error:', err);
          return res.status(500).json({ success: false, message: 'Failed to save license' });
        }

        return res.json({
          success: true,
          message: 'License uploaded successfully. Awaiting admin approval.',
        });
      }
    );
  });

  // ✅ Approved doctor-only route
  router.get('/protected', authMiddleware('doctor'), requireApprovedDoctor, (req, res) => {
    res.json({ message: 'Approved doctor access granted' });
  });

  return router;
};
