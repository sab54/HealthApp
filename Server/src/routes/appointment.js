const express = require('express');
const bodyParser = require('body-parser');

module.exports = (db) => {
  const router = express.Router();
  router.use(bodyParser.json());
  router.use(bodyParser.urlencoded({ extended: false }));

  // Helper: wrap db.run in a Promise
  const runQuery = (sql, params = []) =>
    new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve(this);
      });
    });

  // Helper: wrap db.all in a Promise
  const allQuery = (sql, params = []) =>
    new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });

//  POST /appointment/ai-book
router.post('/ai-book', async (req, res) => {
  const { date, time, reason, userId, senderId, createdBy, chatId } = req.body;

  if (!date || !time || !createdBy || !chatId || !userId || !senderId) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const stmt = `
      INSERT INTO appointment (user_id, sender_id, chat_id, created_by, date, time, reason, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `;
    const result = await runQuery(stmt, [userId, senderId, chatId, createdBy, date, time, reason]);
    const appointmentId = result.lastID;

    // Fetch the inserted row
    const rows = await allQuery(`SELECT * FROM appointment WHERE id = ?`, [appointmentId]);
    const appointment = rows[0];

    res.json({
      success: true,
      appointments: [appointment], // 🔑 normalized response
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message || 'Failed to book appointment' });
  }
});


// GET /appointment/:userId
router.get('/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);
  console.log("📥 GET /appointment/:userId =", userId);

  if (isNaN(userId)) {
    return res.status(400).json({ success: false, message: 'Invalid userId in params' });
  }

  try {
    const rows = await allQuery(
      `SELECT a.*,
              u1.first_name AS user_first_name, u1.last_name AS user_last_name,
              u2.first_name AS sender_first_name, u2.last_name AS sender_last_name
       FROM appointment a
       LEFT JOIN users u1 ON a.user_id = u1.id
       LEFT JOIN users u2 ON a.sender_id = u2.id
       WHERE a.user_id = ? OR a.sender_id = ?
       ORDER BY a.date, a.time`,
      [userId, userId]
    );

    console.log("📤 DB returned rows:", rows);
    res.json({ success: true, appointments: rows });
  } catch (err) {
    console.error("❌ DB error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

  //  PATCH /appointment/:id
  router.patch('/:id', async (req, res) => {
    const appointmentId = parseInt(req.params.id);
    if (isNaN(appointmentId)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment ID' });
    }

    const { status, date, time, reason } = req.body;
    const updates = [];
    const params = [];

    if (status) { updates.push('status = ?'); params.push(status); }
    if (date) { updates.push('date = ?'); params.push(date); }
    if (time) { updates.push('time = ?'); params.push(time); }
    if (reason) { updates.push('reason = ?'); params.push(reason); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    params.push(appointmentId);

    try {
      const result = await runQuery(
        `UPDATE appointment SET ${updates.join(', ')}, updated_at = datetime('now') WHERE id = ?`,
        params
      );
      res.json({ success: true, updatedRows: result.changes });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: err.message || 'Failed to update appointment' });
    }
  });

  return router;
};
