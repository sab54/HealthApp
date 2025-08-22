// Server/src/routes/user.js
const express = require('express');
const bodyParser = require('body-parser');
const geoip = require('geoip-lite');

module.exports = (db) => {
    const router = express.Router();

    router.use(bodyParser.json());
    router.use(bodyParser.urlencoded({ extended: true }));

    /**
     *  GET /user - Get user by token or IP info
     */
    router.get('/', async (req, res) => {
        const getToken = req.query.token;
        const ip =
            (req.headers['x-forwarded-for'] || '').split(',').pop().trim() ||
            req.connection.remoteAddress ||
            req.socket?.remoteAddress;
        const geodata = geoip.lookup(ip);
        const info = { ip, geoData: geodata };

        try {
            if (getToken) {
                const [rows] = await db.query(
                    'SELECT first_name, last_name, email, phone_number, profile_picture_url, country_code, role, city, state, country, latitude, longitude FROM users WHERE token = ? LIMIT 1',
                    [getToken]
                );
                if (rows.length === 0) {
                    return res
                        .status(401)
                        .json({ error: 'Token is incorrect' });
                }
                return res.json({ user: rows[0], location: info });
            } else {
                return res.json(info);
            }
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to process request' });
        }
    });

    // Register route
    router.post('/register', (req, res) => {
        const {
            first_name,
            last_name,
            email,
            phone_number,
            country_code = '+91',
            city,
            state,
            country,
            latitude,
            longitude,
            role
        } = req.body;

        console.log('Received register request with body:', req.body);

        if (!role || !['doctor', 'user'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid or missing role' });
        }

        if (!first_name || !phone_number) {
            console.log('Missing required fields');
            return res.status(400).json({ success: false, message: 'Missing fields' });
        }

        console.log('Checking if user already exists:', phone_number, country_code);

        db.get(`SELECT id FROM users WHERE phone_number = ? AND country_code = ?`, [phone_number, country_code], (err, row) => {
            if (err) {
                console.error('Error querying users table:', err);
                return res.status(500).json({ success: false, message: 'DB Error' });
            }

            if (row) {
                console.log('User already exists:', row);
                return res.status(409).json({ success: false, message: 'User already exists' });
            }

            const ip = req.ip;
            const geo = require('geoip-lite').lookup(ip);
            console.log('GeoIP Lookup:', geo);

            db.run(`
            INSERT INTO users (first_name, last_name, email, phone_number, country_code, city, state, country, latitude, longitude, role)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
                first_name,
                last_name || null,
                email?.toLowerCase() || null,
                phone_number,
                country_code,
                city || geo?.city,
                state || geo?.region,
                country || geo?.country,
                latitude || geo?.ll?.[0],
                longitude || geo?.ll?.[1],
                role
            ], function (err) {
                if (err) {
                    console.error('Error inserting user:', err);
                    return res.status(500).json({ success: false, message: 'Insert failed' });
                }

                const user_id = this.lastID;
                const otp_code = Math.floor(100000 + Math.random() * 900000).toString();
                const expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString();

                console.log(`OTP generated for user ${user_id}: ${otp_code}`);

                db.run(`
                INSERT INTO otp_logins (user_id, otp_code, expires_at, ip_address, user_agent)
                VALUES (?, ?, ?, ?, ?)
            `, [user_id, otp_code, expires_at, ip, req.headers['user-agent']], (err) => {
                    if (err) {
                        console.error('OTP log insertion failed:', err);
                        return res.status(500).json({ success: false, message: 'OTP log failed' });
                    }

                    return res.json({ success: true, user_id, otp_code });
                });
            });
        });
    });


    // Request OTP

    router.post('/request-otp', (req, res) => {
        const { phone_number, country_code = '+91' } = req.body;

        if (!phone_number) {
            return res.status(400).json({ success: false, message: 'Phone number required' });
        }

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

                console.log(`OTP for user ${user.id}:`, otp_code);
                return res.json({ success: true, user_id: user.id, otp_code: otp_code });
            });
        });
    });

    //  Verify OTP
    router.post('/verify-otp', (req, res) => {
        console.log('Received OTP request:', req.body);
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

    // PATCH /user/:userId/location - Update user's location
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


    /**
 *  GET /user/suggestions?q=search_term — Search active users by name, email, phone, location
 */
    router.get('/suggestions', (req, res) => {
        const searchRaw = req.query.q || '';
        const search = searchRaw.trim().toLowerCase();

        if (!search) {
            return res.status(400).json({ success: false, message: 'Missing search query' });
        }

        const like = `%${search}%`;
        const params = [like, like, like, like, like, like, like, like, like];

        const sql = `
        SELECT * FROM users
        WHERE is_active = 1 AND (
            LOWER(first_name) LIKE ? OR
            LOWER(last_name) LIKE ? OR
            LOWER(first_name || ' ' || last_name) LIKE ? OR
            LOWER(email) LIKE ? OR
            phone_number LIKE ? OR
            LOWER(city) LIKE ? OR
            LOWER(state) LIKE ? OR
            LOWER(postal_code) LIKE ? OR
            LOWER(country) LIKE ?
        )
        ORDER BY created_at DESC
        LIMIT 5
    `;

        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error('GET /user/suggestions error:', err);
                return res.status(500).json({ success: false, error: 'Query failed' });
            }

            const users = rows.map((user) => ({
                id: user.id,
                name: `${user.first_name} ${user.last_name || ''}`.trim(),
                email: user.email,
                phone_number: user.phone_number,
                profile_picture_url: user.profile_picture_url,
                date_of_birth: user.date_of_birth,
                gender: user.gender,
                address_line1: user.address_line1,
                address_line2: user.address_line2,
                city: user.city,
                state: user.state,
                postal_code: user.postal_code,
                country: user.country,
                latitude: user.latitude,
                longitude: user.longitude,
                role: user.role,
                is_phone_verified: !!user.is_phone_verified,
                created_at: user.created_at,
                updated_at: user.updated_at,
            }));

            res.json({ success: true, data: users });
        });
    });

    // =============================
    // 📌 POST /update-profile - Update user's first and last name
    // =============================
    router.post('/update-profile', (req, res) => {
        const { user_id, first_name, last_name } = req.body;

        console.log('Received update profile request with body:', req.body);

        // Validate required fields
        if (!user_id || !first_name) {
            console.log('Missing required fields');
            return res.status(400).json({ success: false, message: 'Missing fields' });
        }

        console.log(`Checking if user with ID ${user_id} exists...`);

        // Check if user exists
        db.get(`SELECT id FROM users WHERE id = ?`, [user_id], (err, row) => {
            if (err) {
                console.error('Error querying users table:', err);
                return res.status(500).json({ success: false, message: 'DB Error' });
            }

            if (!row) {
                console.log('User not found:', user_id);
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            // Update user details
            db.run(`
            UPDATE users
            SET first_name = ?, last_name = ?
            WHERE id = ?
        `, [
                first_name,
                last_name || null,
                user_id
            ], function (err) {
                if (err) {
                    console.error('Error updating user:', err);
                    return res.status(500).json({ success: false, message: 'Update failed' });
                }

                console.log(`User ${user_id} updated successfully`);
                // After updating the user
                db.get(`SELECT * FROM users WHERE id = ?`, [user_id], (err, updatedUser) => {
                    if (err || !updatedUser) {
                        console.error('Error fetching updated user:', err);
                        return res.status(500).json({ success: false, message: 'Fetch failed' });
                    }

                    return res.json({ success: true, user: updatedUser });
                });

            });
        });
    });



    return router;
};
