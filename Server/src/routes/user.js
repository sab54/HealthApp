const express = require('express');
const bodyParser = require('body-parser');
const geoip = require('geoip-lite');

module.exports = (db) => {
    const router = express.Router();

    router.use(bodyParser.json());
    router.use(bodyParser.urlencoded({ extended: true }));

    // 📌 Register route
    router.post('/register', (req, res) => {
    const {
        first_name, last_name, email, phone_number, country_code = '+91',
        city, state, country, latitude, longitude
    } = req.body;

    console.log('📥 Received register request with body:', req.body);

    if (!first_name || !phone_number) {
        console.log('⚠️ Missing required fields');
        return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    console.log('📞 Checking if user already exists:', phone_number, country_code);

    db.get(`SELECT id FROM users WHERE phone_number = ? AND country_code = ?`, [phone_number, country_code], (err, row) => {
        if (err) {
            console.error('❌ Error querying users table:', err);
            return res.status(500).json({ success: false, message: 'DB Error' });
        }

        if (row) {
            console.log('🔁 User already exists:', row);
            return res.status(409).json({ success: false, message: 'User already exists' });
        }

        const ip = req.ip;
        const geo = require('geoip-lite').lookup(ip);
        console.log('🌍 GeoIP Lookup:', geo);

        db.run(`
            INSERT INTO users (first_name, last_name, email, phone_number, country_code, city, state, country, latitude, longitude)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            first_name, last_name || null, email?.toLowerCase() || null, phone_number, country_code,
            city || geo?.city, state || geo?.region, country || geo?.country,
            latitude || geo?.ll?.[0], longitude || geo?.ll?.[1]
        ], function (err) {
            if (err) {
                console.error('❌ Error inserting user:', err);
                return res.status(500).json({ success: false, message: 'Insert failed' });
            }

            const user_id = this.lastID;
            const otp_code = Math.floor(100000 + Math.random() * 900000).toString();
            const expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString();

            console.log(`📨 OTP generated for user ${user_id}: ${otp_code}`);

            db.run(`
                INSERT INTO otp_logins (user_id, otp_code, expires_at, ip_address, user_agent)
                VALUES (?, ?, ?, ?, ?)
            `, [user_id, otp_code, expires_at, ip, req.headers['user-agent']], (err) => {
                if (err) {
                    console.error('❌ OTP log insertion failed:', err);
                    return res.status(500).json({ success: false, message: 'OTP log failed' });
                }

                return res.json({ success: true, user_id });
            });
        });
    });
});


    // 📌 Request OTP
    router.post('/request-otp', (req, res) => {
        const { phone_number, country_code = '+91' } = req.body;
        if (!phone_number) return res.status(400).json({ success: false, message: 'Phone required' });

        db.get(`SELECT id FROM users WHERE phone_number = ? AND country_code = ?`, [phone_number, country_code], (err, user) => {
            if (err || !user) return res.status(404).json({ success: false, message: 'User not found' });

            const otp_code = Math.floor(100000 + Math.random() * 900000).toString();
            const expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString();

            db.run(`UPDATE otp_logins SET is_used = 1 WHERE user_id = ? AND is_used = 0`, [user.id]);
            db.run(`
                INSERT INTO otp_logins (user_id, otp_code, expires_at, ip_address, user_agent)
                VALUES (?, ?, ?, ?, ?)
            `, [user.id, otp_code, expires_at, req.ip, req.headers['user-agent']], (err) => {
                if (err) return res.status(500).json({ success: false, message: 'OTP gen failed' });

                console.log(`📩 OTP for user ${user.id}:`, otp_code);
                return res.json({ success: true, user_id: user.id });
            });
        });
    });

    // 📌 Verify OTP
    router.post('/verify-otp', (req, res) => {
        const { user_id, otp_code } = req.body;
        if (!user_id || !otp_code) return res.status(400).json({ success: false, message: 'Missing fields' });

        db.get(`
            SELECT * FROM otp_logins
            WHERE user_id = ? AND otp_code = ? AND is_used = 0 AND expires_at > datetime('now')
            ORDER BY created_at DESC LIMIT 1
        `, [user_id, otp_code], (err, otp) => {
            if (err || !otp) return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });

            if (otp.attempts >= otp.max_attempts) {
                return res.status(429).json({ success: false, message: 'Too many attempts' });
            }

            db.run(`UPDATE otp_logins SET is_used = 1, attempts = attempts + 1 WHERE id = ?`, [otp.id]);
            db.run(`UPDATE users SET is_phone_verified = 1 WHERE id = ?`, [user_id]);

            db.get(`SELECT * FROM users WHERE id = ?`, [user_id], (err, user) => {
                if (err || !user) return res.status(500).json({ success: false, message: 'User fetch failed' });

                return res.json({ success: true, user });
            });
        });
    });

    // ✅ 📌 PATCH /user/:userId/location - Update user's location
    router.patch('/:userId/location', (req, res) => {
        const userId = parseInt(req.params.userId);
        const { latitude, longitude } = req.body;

        if (isNaN(userId) || latitude == null || longitude == null) {
            return res.status(400).json({ success: false, message: 'Invalid input' });
        }

        db.run(
            `UPDATE users SET latitude = ?, longitude = ? WHERE id = ?`,
            [latitude, longitude, userId],
            function (err) {
                if (err) {
                    console.error('PATCH /user/:id/location error:', err);
                    return res.status(500).json({ success: false, message: 'Failed to update location' });
                }

                if (this.changes === 0) {
                    return res.status(404).json({ success: false, message: 'User not found' });
                }

                res.json({ success: true, message: 'User location updated' });
            }
        );
    });

    return router;
};
