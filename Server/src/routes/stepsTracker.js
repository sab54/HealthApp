const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // Save steps entry
  router.post('/', (req, res) => {
    const { user_id, steps, distance, speed, calories, duration } = req.body;

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Check if today's record exists
    db.get(
      `SELECT id FROM user_steps WHERE user_id = ? AND DATE(created_at) = ?`,
      [user_id, today],
      (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        if (row) {
          // Update today’s totals
          db.run(
            `UPDATE user_steps
   SET steps = steps + ?,
       distance = distance + ?,
       speed = ?,
       calories = calories + ?,
       duration = duration + ?
   WHERE id = ?`,
            [steps, distance, speed, calories, duration, row.id],

            function (err) {
              if (err) return res.status(500).json({ error: err.message });
              res.json({ id: row.id, user_id, steps, distance, speed, calories, duration });
            }
          );
        } else {
          // Insert new record if today doesn’t exist
          db.run(
            `INSERT INTO user_steps (user_id, steps, distance, speed, calories, duration)
           VALUES (?, ?, ?, ?, ?, ?)`,
            [user_id, steps, distance, speed, calories, duration],
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



  // Fetch steps history
  // Fetch daily totals (grouped by date)
  router.get('/daily/:user_id', (req, res) => {
    db.all(
      `SELECT DATE(created_at) as day,
            SUM(steps) as total_steps,
            SUM(distance) as total_distance,
            SUM(calories) as total_calories,
            SUM(duration) as total_duration
     FROM user_steps
     WHERE user_id = ?
     GROUP BY DATE(created_at)
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
