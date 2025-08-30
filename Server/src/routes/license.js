
/**
 * License Upload and Verification Routes (license.js)
 *
 * This file defines the route for uploading and processing user licenses. The route uses 
 * OCR (Optical Character Recognition) to extract text from the uploaded image and 
 * verify whether the license corresponds to a doctor. If valid, the license is approved 
 * and saved into the database. If not, the file is discarded.
 * 
 * Features:
 * - POST /upload-license: Handles the uploading of a user's license image, performs OCR 
 *   to extract text, and verifies whether the license is valid (i.e., associated with a doctor).
 *   If valid, the license is saved, and the user is approved. If not, an error message is returned.
 * 
 * Dependencies:
 * - express: Web framework for building API routes.
 * - multer: Middleware for handling file uploads.
 * - fs: File system module for handling file operations (e.g., deleting uploaded files).
 * - path: Path module for handling file and directory paths.
 * - tesseract.js: Library for performing Optical Character Recognition (OCR) on image files.
 * 
 * Key Functionality:
 * - File Upload: The uploaded image is processed and stored in the `uploads` directory.
 * - OCR Processing: Tesseract.js is used to extract text from the uploaded license image.
 * - License Validation: The extracted text is analyzed to determine if the license is valid (e.g., by checking for doctor-related keywords).
 * - Database Operations: If the license is valid, the corresponding data is saved in the database, and the user's status is updated.
 * 
 * Author: Sunidhi Abhange
 */
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');

module.exports = (db) => {
  const router = express.Router();

  const upload = multer({
    dest: path.join(__dirname, '../../uploads'),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  });

  router.post('/upload-license', upload.single('image'), async (req, res) => {
    const file = req.file;
    const { user_id } = req.body;

    if (!user_id) {
      if (file?.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(400).json({ success: false, message: 'Missing user_id' });
    }

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const imagePath = file.path;

    try {
      const result = await Tesseract.recognize(imagePath, 'eng');
      const text = result?.data?.text || '';
      console.log('OCR Extracted Text:\n', text);

      const normalizedText = text.toLowerCase().replace(/\s+/g, ' ');
      const isDoctor = /dr[\s\.:\-]|doctor/i.test(text) || /DOC-\d{4}-[A-Z]{3}/.test(text);

      const relativePath = `/uploads/${file.filename}`;

      if (isDoctor) {
        // Save the license and approve doctor
        await new Promise((resolve, reject) => {
          db.run(
            'INSERT INTO doctor_licenses (user_id, file_path, status) VALUES (?, ?, ?)',
            [user_id, relativePath, 'approved'],
            err => (err ? reject(err) : resolve())
          );
        });

        await new Promise((resolve, reject) => {
          db.run('UPDATE users SET is_approved = 1 WHERE id = ?', [user_id], err =>
            err ? reject(err) : resolve()
          );
        });

        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

        return res.json({
          success: true,
          approved: true,
          ocrText: text,
          message: 'License approved and saved successfully.',
        });
      } else {
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        return res.status(400).json({
          success: false,
          approved: false,
          ocrText: text,
          message: 'License does not appear to be valid.',
        });
      }
    } catch (err) {
      console.error('OCR processing error:', err);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      return res.status(500).json({ success: false, message: 'OCR processing failed' });
    }
  });

  return router;
};
