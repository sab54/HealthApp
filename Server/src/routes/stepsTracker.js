const express = require('express');
const router = express.Router();

module.exports = (db) => {
  router.post('/', (req, res) => {
    const { user_id, steps, distance, speed, calories, duration } = req.body;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    db.get(
      `SELECT * FROM user_steps WHERE user_id = ? AND date = ?`,
      [user_id, today],
      (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        if (row) {
          // ✅ Only update if steps increased
          if (steps > row.steps) {
            db.run(
              `UPDATE user_steps
                 SET steps = ?,
                     distance = ?,
                     speed = ?,
                     calories = ?,
                     duration = ?,
                     updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
               WHERE id = ?`,
              [steps, distance, speed, calories, duration, row.id],
              function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ id: row.id, user_id, steps, distance, speed, calories, duration });
              }
            );
          } else {
            // ⚠️ No changes → return existing row
            res.json(row);
          }
        } else {
          // Insert new record if today doesn’t exist
          db.run(
            `INSERT INTO user_steps (user_id, date, steps, distance, speed, calories, duration)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [user_id, today, steps, distance, speed, calories, duration],
            function (err) {
              if (err) return res.status(500).json({ error: err.message });

              db.get(`SELECT * FROM user_steps WHERE id = ?`, [this.lastID], (err, row) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json(row);
              });
            }
          );
        }
      }
    );
  });

  // Fetch daily totals
  router.get('/daily/:user_id', (req, res) => {
    db.all(
      `SELECT date as day,
              steps as total_steps,
              distance as total_distance,
              calories as total_calories,
              duration as total_duration
       FROM user_steps
       WHERE user_id = ?
       ORDER BY day DESC`,
      [req.params.user_id],
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
      }
    );
  });

  return router;
};
