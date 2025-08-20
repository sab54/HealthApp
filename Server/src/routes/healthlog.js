// Server/src/routes/healthlog.js
const express = require('express');
const router = express.Router();
const symptomHealth = require("../data/symptomHealth");

module.exports = (db) => {
  // Basic healthcheck
  router.get('/', (req, res) => {
    res.json({ success: true, message: 'Healthlog API is working' });
  });

  // Get today's health log
  router.get(['/today', '/today/:userId'], (req, res) => {
    const userId = parseInt(req.params.userId || req.query.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const today = new Date().toISOString().split('T')[0];

    db.get(
      `SELECT mood, sleep, energy FROM user_daily_mood WHERE user_id = ? AND date = ?`,
      [userId, today],
      (err, moodRow) => {
        if (err) {
          console.error('DB error (mood):', err);
          return res.status(500).json({ success: false, message: 'DB error fetching mood' });
        }

        db.all(
          `SELECT
             symptom,
             severity,
             onset_time AS onsetTime,
             duration,
             notes,
             time
           FROM user_symptoms
           WHERE user_id = ? AND date = ?`,
          [userId, today],
          (err2, symptomRows) => {
            if (err2) {
              console.error('DB error (symptoms):', err2);
              return res.status(500).json({ success: false, message: 'DB error fetching symptoms' });
            }

            return res.json({
              success: true,
              mood: moodRow ? moodRow.mood : null,
              sleep: moodRow ? moodRow.sleep : null,
              energy: moodRow ? moodRow.energy : null,
              symptoms: symptomRows || []
            });
          }
        );
      }
    );
  });

  router.post('/submit', (req, res) => {
    console.log('Incoming payload:', req.body);

    const { user_id, mood, symptoms, sleep, energy } = req.body;

    if (!user_id || !mood) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    if (!['Feeling great!', 'Not feeling good!'].includes(mood)) {
      return res.status(400).json({ success: false, message: 'Invalid mood value' });
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toISOString().split('T')[1];

    // Fetch existing row first to preserve previous sleep/energy if needed
    db.get(
      `SELECT sleep, energy FROM user_daily_mood WHERE user_id = ? AND date = ?`,
      [user_id, today],
      (err, existingRow) => {
        if (err) {
          console.error('DB error fetching existing mood:', err);
          return res.status(500).json({ success: false, message: 'DB error' });
        }

        const finalSleep = sleep != null ? sleep : existingRow?.sleep ?? 8; // default 8
        const finalEnergy = energy != null ? energy : existingRow?.energy ?? 5; // default 5

        db.run(
          `INSERT OR REPLACE INTO user_daily_mood (user_id, date, mood, sleep, energy)
         VALUES (?, ?, ?, ?, ?)`,
          [user_id, today, mood, finalSleep, finalEnergy],
          function (err2) {
            if (err2) {
              console.error('DB error saving mood:', err2);
              return res.status(500).json({ success: false, message: 'DB error saving mood' });
            }

            if (!Array.isArray(symptoms) || symptoms.length === 0) {
              return res.json({ success: true, message: 'Mood saved without symptoms' });
            }

            const stmt = db.prepare(`
            INSERT INTO user_symptoms (user_id, symptom, severity, onset_time, duration, notes, date, time)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);

            symptoms.forEach((s) => {
              let severityLabel = 'mild';
              const severityNum = parseInt(s.severity);
              if (!isNaN(severityNum)) {
                if (severityNum >= 1 && severityNum <= 3) severityLabel = 'mild';
                else if (severityNum >= 4 && severityNum <= 6) severityLabel = 'moderate';
                else if (severityNum >= 7 && severityNum <= 10) severityLabel = 'severe';
              } else if (typeof s.severity === 'string') {
                severityLabel = ['mild', 'moderate', 'severe'].includes(s.severity) ? s.severity : 'mild';
              }

              stmt.run([
                user_id,
                s.symptom || null,
                severityLabel,
                s.onsetTime || null,
                s.duration || null,
                s.notes || null,
                today,
                currentTime
              ]);
            });

            stmt.finalize((err3) => {
              if (err3) {
                console.error('DB error saving symptoms:', err3);
                return res.status(500).json({ success: false, message: 'DB error saving symptoms' });
              }

              return res.json({ success: true, message: 'Mood and symptoms saved' });
            });
          }
        );
      }
    );
  });

  // Generate Daily Plan Endpoint
  router.post("/generatePlan", (req, res) => {
    const { user_id, symptom, recurring } = req.body;
    const today = new Date().toISOString().split("T")[0];
    const plan = symptomHealth.find((s) => s.symptom === symptom);

    if (!plan) return res.status(404).json({ error: "No plan found for this symptom" });

    const insertPlan = (date) => {
      const stmt = db.prepare(
        "INSERT INTO user_daily_plan (user_id, date, symptom, category, task, done) VALUES (?, ?, ?, ?, ?, ?)"
      );

      Object.entries(plan).forEach(([category, items]) => {
        if (Array.isArray(items)) {
          items.forEach((item) => stmt.run([user_id, date, symptom, category, item, 0]));
        } else if (typeof items === "string") {
          stmt.run([user_id, date, symptom, category, items, 0]);
        }
      });
      stmt.finalize();
    };

    // If recurring, insert plan for today and next 30 days (until recovery)
    if (recurring) {
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        insertPlan(date.toISOString().split("T")[0]);
      }
    } else {
      insertPlan(today);
    }

    res.json({ success: true, plan });
  });


  // Fetch today's daily plan (GET route)
  router.get("/plan", (req, res) => {
    const userId = parseInt(req.query.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const today = new Date().toISOString().split("T")[0];

    db.all(
      `SELECT category, task, done FROM user_daily_plan WHERE user_id = ? AND date = ?`,
      [userId, today],
      (err, rows) => {
        if (err) {
          console.error("DB error fetching daily plan:", err);
          return res.status(500).json({ success: false, message: "DB error fetching plan" });
        }
        return res.json({ success: true, plan: rows });
      }
    );
  });

  // Update a plan task (toggle done/undone)
  router.post('/updatePlanTask', async (req, res) => {
    const { user_id, date, category, task, done } = req.body;
    try {
      await db.run(
        'UPDATE user_daily_plan SET done = ? WHERE user_id = ? AND date = ? AND category = ? AND task = ?',
        [done, user_id, date, category, task]
      );
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update plan task' });
    }
  });

  router.get('/trends/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) return res.status(400).json({ success: false, message: 'Invalid user ID' });

    const { days } = req.query; // ?days=3 or ?days=15
    const limitDays = parseInt(days) || 15;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - limitDays + 1);
    const startStr = startDate.toISOString().split('T')[0];

    db.all(
      `SELECT date, mood, energy, sleep FROM user_daily_mood
     WHERE user_id = ? AND date >= ? ORDER BY date ASC`,
      [userId, startStr],
      (err, rows) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ success: false, message: 'DB error fetching trends' });
        }
        res.json({ success: true, trends: rows });
      }
    );
  });


  return router;
};
