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
             time,
             recovered_at
           FROM user_symptoms
           WHERE user_id = ? AND (date = ? OR recovered_at IS NULL)`,
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

  // Submit mood & symptoms
  router.post('/submit', async (req, res) => {
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

    // Fetch existing row first
    db.get(
      `SELECT sleep, energy FROM user_daily_mood WHERE user_id = ? AND date = ?`,
      [user_id, today],
      async (err, existingRow) => {
        if (err) {
          console.error('DB error fetching existing mood:', err);
          return res.status(500).json({ success: false, message: 'DB error' });
        }

        const finalSleep = sleep != null ? sleep : existingRow?.sleep ?? 8;
        const finalEnergy = energy != null ? energy : existingRow?.energy ?? 5;

        db.run(
          `INSERT OR REPLACE INTO user_daily_mood (user_id, date, mood, sleep, energy)
           VALUES (?, ?, ?, ?, ?)`,
          [user_id, today, mood, finalSleep, finalEnergy],
          async function (err2) {
            if (err2) {
              console.error('DB error saving mood:', err2);
              return res.status(500).json({ success: false, message: 'DB error saving mood' });
            }

            if (!Array.isArray(symptoms) || symptoms.length === 0) {
              return res.json({ success: true, message: 'Mood saved without symptoms' });
            }

            try {
              // Loop through symptoms and insert only if not already present
              const insertPromises = symptoms.map((s) => {
                return new Promise((resolve, reject) => {
                  db.get(
                    `SELECT id FROM user_symptoms
                     WHERE user_id = ? AND symptom = ? AND recovered_at IS NULL AND date = ?`,
                    [user_id, s.symptom, today],
                    (err, existingSymptom) => {
                      if (err) {
                        console.error('DB error checking existing symptom:', err);
                        return reject(err);
                      }

                      if (!existingSymptom) {
                        // Only insert if symptom is not present and unresolved
                        let severityLabel = 'mild';
                        const severityNum = parseInt(s.severity);
                        if (!isNaN(severityNum)) {
                          if (severityNum >= 1 && severityNum <= 3) severityLabel = 'mild';
                          else if (severityNum >= 4 && severityNum <= 6) severityLabel = 'moderate';
                          else if (severityNum >= 7 && severityNum <= 10) severityLabel = 'severe';
                        } else if (typeof s.severity === 'string') {
                          severityLabel = ['mild', 'moderate', 'severe'].includes(s.severity) ? s.severity : 'mild';
                        }

                        db.run(
                          `INSERT INTO user_symptoms (user_id, symptom, severity, onset_time, duration, notes, date, time)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                          [
                            user_id,
                            s.symptom || null,
                            severityLabel,
                            s.onsetTime || null,
                            s.duration || null,
                            s.notes || null,
                            today,
                            currentTime
                          ],
                          (err) => {
                            if (err) reject(err);
                            else resolve();
                          }
                        );
                      } else {
                        resolve(); // skip existing symptom
                      }
                    }
                  );
                });
              });

              await Promise.all(insertPromises);
              return res.json({ success: true, message: 'Mood and symptoms saved' });
            } catch (error) {
              console.error('Error saving symptoms:', error);
              return res.status(500).json({ success: false, message: 'DB error saving symptoms' });
            }
          }
        );
      }
    );
  });

  // Generate Daily Plan Endpoint
  // Server/src/routes/healthlog.js

// Generate Daily Plan Endpoint
router.post("/generatePlan", (req, res) => {
  const { user_id, symptom, severity = 'moderate', recurring } = req.body;
  if (!user_id || !symptom) {
    return res.status(400).json({ success: false, message: "Missing user_id or symptom" });
  }

  const today = new Date().toISOString().split("T")[0];

  // Fetch the plan from symptomHealth
  const plan = symptomHealth.find((s) => s.symptom === symptom);

  if (!plan) {
    return res.status(404).json({ success: false, message: "No plan found for this symptom" });
  }

  // Map symptomHealth keys to DB categories
  const CATEGORY_MAP = {
    precautions: "Care",
    medicines: "Medicine",
    what_to_eat: "Diet",
    exercises: "Exercise",
    what_not_to_take: "Avoid",
    treatment: "Care",
  };

  // Function to insert tasks for a given date
  const insertPlan = (date) => {
    db.get(
      `SELECT recovered_at FROM user_symptoms WHERE user_id = ? AND symptom = ? ORDER BY date DESC LIMIT 1`,
      [user_id, symptom],
      (err, row) => {
        if (err) return console.error(err);

        if (row && row.recovered_at) {
          console.log(`Symptom "${symptom}" already recovered. Skipping plan generation.`);
          return; // skip if recovered
        }

        const stmt = db.prepare(
          "INSERT OR IGNORE INTO user_daily_plan (user_id, date, symptom, severity, category, task, done) VALUES (?, ?, ?, ?, ?, ?, ?)"
        );

        Object.entries(plan).forEach(([key, items]) => {
          const dbCategory = CATEGORY_MAP[key];
          if (!dbCategory) return;

          if (Array.isArray(items)) {
            items.forEach((item) => {
              console.log('Inserting task:', { user_id, date, symptom, severity, dbCategory, task: item });
              stmt.run([user_id, date, symptom, severity, dbCategory, item, 0]);
            });
          } else if (typeof items === "string") {
            console.log('Inserting task:', { user_id, date, symptom, severity, dbCategory, task: items });
            stmt.run([user_id, date, symptom, severity, dbCategory, items, 0]);
          }
        });

        stmt.finalize();
      }
    );
  };

  if (recurring) {
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      insertPlan(date.toISOString().split("T")[0]);
    }
  } else {
    insertPlan(today);
  }

  return res.json({ success: true, plan });
});


  router.get("/plan", (req, res) => {
  const userId = parseInt(req.query.userId);
  const symptom = req.query.symptom;
  const severity = req.query.severity; // <-- add this

  if (isNaN(userId))
    return res.status(400).json({ success: false, message: "Invalid user ID" });

  const today = new Date().toISOString().split("T")[0];

  let query = `SELECT category, task, severity, done, symptom
               FROM user_daily_plan
               WHERE user_id = ? AND date = ?`;
  const params = [userId, today];

  if (symptom) {
    query += " AND symptom = ?";
    params.push(symptom);
  }

  if (severity) {
    query += " AND severity = ?"; // <-- add severity filter
    params.push(severity);
  }

  query += " ORDER BY category ASC, done ASC";

  console.log("🔹 /plan DB query:", query, "Params:", params);

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error("DB error fetching daily plan:", err);
      return res.status(500).json({ success: false, message: "DB error fetching plan" });
    }
    console.log("🔹 Rows fetched from DB:", rows);
    return res.json({ success: true, plan: rows });
  });
});


  // Update a plan task
  router.post('/updatePlanTask', (req, res) => {
    const { user_id, date, category, task, done } = req.body;

    db.run(
      'UPDATE user_daily_plan SET done = ? WHERE user_id = ? AND date = ? AND category = ? AND task = ?',
      [done, user_id, date, category, task],
      function (err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to update plan task' });
        }
        console.log(`✅ Updated task in DB: user ${user_id}, task "${task}", category "${category}", date ${date}, done=${done}`);
        console.log(`Affected rows: ${this.changes}`);
        res.json({ success: true });
      }
    );
  });

  // Fetch trends
  router.get('/trends/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) return res.status(400).json({ success: false, message: 'Invalid user ID' });

    const { days } = req.query;
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

  // Recover a symptom
  router.post('/recoverSymptom', (req, res) => {
    const { user_id, symptom, date } = req.body;
    if (!user_id || !symptom || !date) return res.status(400).json({ success: false, message: 'Missing fields' });

    const recoveredAt = new Date().toISOString();
    db.run(
      `UPDATE user_symptoms
       SET recovered_at = ?
       WHERE user_id = ? AND symptom = ? AND date = ?`,
      [recoveredAt, user_id, symptom, date],
      function (err) {
        if (err) {
          console.error('DB error marking symptom as recovered:', err);
          return res.status(500).json({ success: false, message: 'DB error' });
        }
        return res.json({ success: true, message: 'Symptom marked as recovered', recovered_at: recoveredAt });
      }
    );
  });


  return router;
};
