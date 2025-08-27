const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

module.exports = (db, io) => {
    const router = express.Router({ caseSensitive: true });

    router.use(bodyParser.json());
    router.use(bodyParser.urlencoded({ extended: false }));

    const dbAll = (sql, params = []) =>
        new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

    const dbGet = (sql, params = []) =>
        new Promise((resolve, reject) => {
            db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

    const dbRun = (sql, params = []) =>
        new Promise((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve({ lastID: this.lastID, changes: this.changes });
            });
        });

    // GET /chat/list/:user_id
    router.get('/list/:user_id', async (req, res) => {
        const userId = parseInt(req.params.user_id);
        if (isNaN(userId)) {
            return res.status(400).json({ success: false, error: 'Invalid user_id' });
        }

        try {
            const currentUser = await dbGet(
                `SELECT postal_code FROM users WHERE id = ? LIMIT 1`,
                [userId]
            );

            if (!currentUser) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }

            const userPostal = currentUser.postal_code || '';

            const chats = await dbAll(
                `
                SELECT
                    c.id AS chat_id,
                    c.is_group,
                    c.name AS group_name,
                    c.created_by,
                    c.latitude,
                    c.longitude,
                    c.radius_km,
                    COALESCE(MAX(m.created_at), c.created_at) AS updated_at,
                    (
                        SELECT message FROM chat_messages
                        WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1
                    ) AS last_message,
                    (
                        SELECT sender_id FROM chat_messages
                        WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1
                    ) AS last_sender_id,
                    (
                        SELECT created_at FROM chat_messages
                        WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1
                    ) AS last_message_at
                FROM chats c
                JOIN chat_members cm ON cm.chat_id = c.id
                LEFT JOIN chat_messages m ON m.chat_id = c.id
                WHERE cm.user_id = ?
                GROUP BY c.id
                `,
                [userId]
            );

            const chatIds = chats.map((c) => c.chat_id);
            if (!chatIds.length) return res.json({ success: true, data: [] });

            const placeholders = chatIds.map(() => '?').join(',');
            const members = await dbAll(
                `
                SELECT
                    cm.chat_id,
                    u.id,
                    u.first_name,
                    u.last_name,
                    u.profile_picture_url,
                    u.email,
                    u.postal_code,
                    cm.role
                FROM chat_members cm
                JOIN users u ON u.id = cm.user_id
                WHERE cm.chat_id IN (${placeholders})
                `,
                chatIds
            );

            const membersMap = {};
            for (const m of members) {
                if (!membersMap[m.chat_id]) membersMap[m.chat_id] = [];
                membersMap[m.chat_id].push({
                    id: m.id,
                    name: `${m.first_name} ${m.last_name || ''}`.trim(),
                    avatar: m.profile_picture_url,
                    email: m.email,
                    postal_code: m.postal_code,
                    role: m.role,
                });
            }

            const enriched = chats.map((chat) => {
                const isGroup = !!chat.is_group;
                const chatMembers = membersMap[chat.chat_id] || [];
                const otherUser = !isGroup ? chatMembers.find((u) => u.id !== userId) : null;
                const lastSender = chatMembers.find((u) => u.id === chat.last_sender_id);
                const isNearby = !isGroup && otherUser?.postal_code === userPostal;

                return {
                    id: chat.chat_id,
                    name: isGroup ? chat.group_name || 'Unnamed Group' : otherUser?.name || 'Direct Chat',
                    is_group: isGroup,
                    created_by: chat.created_by,
                    lastMessage: chat.last_message || '',
                    lastMessageAt: chat.last_message_at,
                    lastSender: lastSender
                        ? {
                            id: lastSender.id,
                            name: lastSender.name,
                            avatar: lastSender.avatar,
                        }
                        : null,
                    latitude: chat.latitude,
                    longitude: chat.longitude,
                    radius_km: chat.radius_km,
                    members: chatMembers,
                    is_nearby: isNearby,
                    updated_at: chat.updated_at,
                };
            });

            if (io) {
                io.to(`user_${userId}`).emit('chat:list_update', enriched);
            }

            res.json({ success: true, data: enriched });
        } catch (error) {
            console.error(`GET /chat/list/${userId} failed:`, error);
            res.status(500).json({ success: false, error: 'Failed to fetch chats' });
        }
    });

    //  POST /chat/create
    router.post('/create', async (req, res) => {
        const {
            user_id,
            participant_ids,
            is_group = false,
            group_name = null,
        } = req.body;

        if (!user_id || !Array.isArray(participant_ids) || participant_ids.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'user_id and participant_ids are required',
            });
        }

        try {
            if (!is_group && participant_ids.length === 1) {
                const otherId = participant_ids[0];
                const existing = await dbAll(
                    `SELECT c.id FROM chats c
                     JOIN chat_members cm1 ON cm1.chat_id = c.id AND cm1.user_id = ?
                     JOIN chat_members cm2 ON cm2.chat_id = c.id AND cm2.user_id = ?
                     WHERE c.is_group = 0
                     GROUP BY c.id`,
                    [user_id, otherId]
                );

                if (existing.length > 0) {
                    return res.status(200).json({
                        success: true,
                        message: 'Chat already exists',
                        chat_id: existing[0].id,
                    });
                }
            }

            const result = await dbRun(
                `INSERT INTO chats (is_group, name, created_by) VALUES (?, ?, ?)`,
                [is_group ? 1 : 0, is_group ? group_name : null, user_id]
            );
            const chatId = result.lastID;

            const allUserIds = [...new Set([user_id, ...participant_ids])];
            for (const id of allUserIds) {
                await dbRun(
                    `INSERT INTO chat_members (chat_id, user_id, role) VALUES (?, ?, ?)`,
                    [chatId, id, id === user_id ? 'owner' : 'member']
                );
            }

            for (const id of participant_ids) {
                const title = is_group
                    ? `New group chat: ${group_name || 'Unnamed Group'}`
                    : 'New direct chat';
                const message = is_group
                    ? `You were added to group "${group_name || 'Unnamed Group'}".`
                    : `You have a new direct chat with user ${user_id}.`;

                await dbRun(
                    `INSERT INTO user_alerts (user_id, type, related_id, title, message)
                     VALUES (?, 'chat', ?, ?, ?)`,
                    [id, chatId, title, message]
                );
            }

            // fetch the new chat row
            const newChat = await dbGet(
                `SELECT * FROM chats WHERE id = ? LIMIT 1`,
                [chatId]
            );

            // fetch members of that chat
            const members = await dbAll(
                `SELECT u.id, u.first_name, u.last_name, u.email, u.profile_picture_url, cm.role
   FROM chat_members cm
   JOIN users u ON u.id = cm.user_id
   WHERE cm.chat_id = ?`,
                [chatId]
            );

            const memberList = members.map((m) => ({
                id: m.id,
                name: `${m.first_name} ${m.last_name || ''}`.trim(),
                avatar: m.profile_picture_url,
                email: m.email,
                role: m.role,
            }));

            let chatName;
            if (is_group) {
                chatName = group_name || 'Unnamed Group';
            } else {
                const otherUser = memberList.find(m => m.id !== parseInt(user_id));
                chatName = otherUser ? otherUser.name : 'Direct Chat';
            }

            res.status(201).json({
                success: true,
                message: 'Chat created successfully',
                chat_id: chatId,
                chat: {
                    id: chatId,
                    is_group,
                    name: chatName,
                    created_by: user_id,
                    members: memberList
                }
            });
        } catch (error) {
            console.error('POST /chat/create failed:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create chat',
            });
        }
    });

    //  POST /chat/:chat_id/add-members
    router.post('/:chat_id/add-members', async (req, res) => {
        const chatId = parseInt(req.params.chat_id);
        const { user_id, user_ids } = req.body;

        if (!chatId || !user_id || !Array.isArray(user_ids) || user_ids.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'chat_id, user_id, and user_ids are required',
            });
        }

        try {
            for (const uid of user_ids) {
                await dbRun(
                    `INSERT OR IGNORE INTO chat_members (chat_id, user_id, role) VALUES (?, ?, 'member')`,
                    [chatId, uid]
                );

                await dbRun(
                    `INSERT INTO user_alerts (user_id, type, related_id, title, message, urgency, source)
                     VALUES (?, 'chat', ?, 'Added to Group', 'You were added to a group chat.', 'advisory', 'system')`,
                    [uid, chatId]
                );

                if (io) {
                    io.to(`user_${uid}`).emit('chat:list_update:trigger');
                }
            }

            res.status(200).json({
                success: true,
                message: 'Members added to chat successfully',
                added_user_ids: user_ids,
            });
        } catch (error) {
            console.error(`POST /chat/${chatId}/add-members failed:`, error);
            res.status(500).json({
                success: false,
                error: 'Failed to add members to chat',
            });
        }
    });

    //  DELETE /chat/:chat_id/remove-member
    router.delete('/:chat_id/remove-member', async (req, res) => {
        const chatId = parseInt(req.params.chat_id);
        const { user_id, requested_by } = req.query;

        if (!chatId || !user_id || !requested_by) {
            return res.status(400).json({
                success: false,
                error: 'chat_id, user_id, and requested_by are required',
            });
        }

        try {
            const userId = parseInt(user_id);
            const requestedBy = parseInt(requested_by);

            const roleRow = await dbGet(
                `SELECT role FROM chat_members WHERE chat_id = ? AND user_id = ? LIMIT 1`,
                [chatId, requestedBy]
            );

            if (!roleRow || roleRow.role !== 'owner') {
                return res.status(403).json({
                    success: false,
                    error: 'Only the group owner can remove members',
                });
            }

            if (userId === requestedBy) {
                return res.status(400).json({
                    success: false,
                    error: 'Group owner cannot remove themselves',
                });
            }

            await dbRun(
                `DELETE FROM chat_members WHERE chat_id = ? AND user_id = ?`,
                [chatId, userId]
            );

            const remaining = await dbGet(
                `SELECT COUNT(*) AS count FROM chat_members WHERE chat_id = ?`,
                [chatId]
            );

            if (remaining.count === 0) {
                await dbRun(`DELETE FROM chat_messages WHERE chat_id = ?`, [chatId]);
                await dbRun(`DELETE FROM chat_read_receipts WHERE chat_id = ?`, [chatId]);
                await dbRun(`DELETE FROM chats WHERE id = ?`, [chatId]);

                return res.status(200).json({
                    success: true,
                    message: `User ${userId} removed and empty group deleted (chat ${chatId})`,
                });
            }

            if (io) {
                io.to(`user_${userId}`).emit('chat:list_update:trigger');
            }

            return res.status(200).json({
                success: true,
                message: `User ${userId} removed from chat ${chatId}`,
            });
        } catch (error) {
            console.error(`DELETE /chat/${chatId}/remove-member failed:`, error);
            return res.status(500).json({
                success: false,
                error: 'Failed to remove user from chat',
            });
        }
    });

    //  POST /chat/local-groups/join
    const RADIUS_KM = 0.2;
    router.post('/local-groups/join', async (req, res) => {
        const { userId, latitude, longitude } = req.body;

        if (!userId || !latitude || !longitude) {
            return res.status(400).json({
                success: false,
                error: 'userId, latitude, and longitude are required',
            });
        }

        try {
            const lat = parseFloat(latitude);
            const lon = parseFloat(longitude);

            const nearbyGroup = await dbGet(
                `SELECT id, name, latitude, longitude, radius_km,
                        (6371 * acos(
                            cos(radians(?)) * cos(radians(latitude)) *
                            cos(radians(longitude) - radians(?)) +
                            sin(radians(?)) * sin(radians(latitude))
                        )) AS distance_km
                 FROM chats
                 WHERE is_group = 1
                   AND latitude IS NOT NULL
                   AND longitude IS NOT NULL
                   AND radius_km IS NOT NULL
                 HAVING distance_km <= radius_km
                 ORDER BY distance_km ASC
                 LIMIT 1`,
                [lat, lon, lat]
            );

            let chatId;
            let isNew = false;

            if (nearbyGroup) {
                chatId = nearbyGroup.id;
                await dbRun(
                    `INSERT OR IGNORE INTO chat_members (chat_id, user_id, role) VALUES (?, ?, 'member')`,
                    [chatId, userId]
                );
            } else {
                const groupName = `Local Group (${lat.toFixed(5)}, ${lon.toFixed(5)})`;
                const result = await dbRun(
                    `INSERT INTO chats (is_group, name, latitude, longitude, radius_km, created_by)
                     VALUES (1, ?, ?, ?, ?, ?)`,
                    [groupName, lat, lon, RADIUS_KM, userId]
                );
                chatId = result.lastID;
                isNew = true;

                await dbRun(
                    `INSERT INTO chat_members (chat_id, user_id, role) VALUES (?, ?, 'owner')`,
                    [chatId, userId]
                );
            }

            const alertTitle = isNew
                ? 'New Local Group Created'
                : 'Joined Nearby Local Group';
            const alertMessage = isNew
                ? `You've created a new local group at your location.`
                : `You've joined a local group near your location.`;

            await dbRun(
                `INSERT INTO user_alerts (user_id, type, related_id, title, message, urgency, source)
                 VALUES (?, 'chat', ?, ?, ?, 'moderate', 'system')`,
                [userId, chatId, alertTitle, alertMessage]
            );

            if (io) {
                io.to(`user_${userId}`).emit('chat:list_update:trigger');
            }

            return res.status(isNew ? 201 : 200).json({
                success: true,
                message: isNew
                    ? 'Local group created and joined'
                    : 'Joined existing nearby local group',
                chat_id: chatId,
            });
        } catch (error) {
            console.error('/local-groups/join failed:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to join local group',
            });
        }
    });

    //  DELETE /chat/:chat_id
    router.delete('/:chat_id', async (req, res) => {
        const chatId = parseInt(req.params.chat_id);
        if (isNaN(chatId)) {
            return res.status(400).json({ error: 'Invalid chat ID' });
        }

        try {
            await dbRun(`DELETE FROM chat_messages WHERE chat_id = ?`, [chatId]);
            await dbRun(`DELETE FROM chat_members WHERE chat_id = ?`, [chatId]);
            await dbRun(`DELETE FROM chats WHERE id = ?`, [chatId]);

            res.status(200).json({
                success: true,
                message: 'Chat deleted successfully',
            });
        } catch (error) {
            console.error(`DELETE /chat/${chatId} failed:`, error);
            res.status(500).json({ error: 'Failed to delete chat' });
        }
    });

    //  GET /chat/:chat_id/members
    router.get('/:chat_id/members', async (req, res) => {
        const chatId = parseInt(req.params.chat_id);
        if (isNaN(chatId)) {
            return res.status(400).json({ success: false, error: 'Invalid chat_id' });
        }

        try {
            const rows = await dbAll(
                `SELECT u.id, u.first_name, u.last_name, u.email, u.profile_picture_url, cm.role
                 FROM chat_members cm
                 JOIN users u ON cm.user_id = u.id
                 WHERE cm.chat_id = ?`,
                [chatId]
            );

            const members = rows.map((user) => ({
                id: user.id,
                name: `${user.first_name} ${user.last_name || ''}`.trim(),
                email: user.email,
                avatar: user.profile_picture_url,
                role: user.role,
            }));

            res.json({ success: true, data: members });
        } catch (error) {
            console.error(`GET /chat/${chatId}/members failed:`, error);
            res.status(500).json({ success: false, error: 'Failed to fetch members' });
        }
    });

    //  GET /chat/:chat_id/messages
    router.get('/:chat_id/messages', async (req, res) => {
        const chatId = parseInt(req.params.chat_id);
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;

        if (isNaN(chatId)) {
            return res.status(400).json({ success: false, error: 'Invalid chat_id' });
        }

        try {
            const rows = await dbAll(
                `SELECT m.id, m.chat_id, m.sender_id, u.first_name, u.last_name,
                        m.message AS content, m.message_type, m.created_at
                 FROM chat_messages m
                 LEFT JOIN users u ON m.sender_id = u.id
                 WHERE m.chat_id = ?
                 ORDER BY m.created_at ASC
                 LIMIT ? OFFSET ?`,
                [chatId, limit, offset]
            );

            const messages = rows.map((msg) => ({
                id: msg.id,
                chat_id: msg.chat_id,
                sender: {
                    id: msg.sender_id,
                    name: `${msg.first_name || ''} ${msg.last_name || ''}`.trim(),
                },
                content: msg.content,
                message_type: msg.message_type,
                timestamp: msg.created_at,
            }));

            res.json({ success: true, data: messages });
        } catch (error) {
            console.error(`GET /chat/${chatId}/messages failed:`, error);
            res.status(500).json({ success: false, error: 'Failed to fetch messages' });
        }
    });

    //  POST /chat/:chat_id/messages
    router.post('/:chat_id/messages', async (req, res) => {
        const chatId = parseInt(req.params.chat_id);
        const { sender_id, message, message_type = 'text' } = req.body;

        if (!sender_id || !message) {
            return res.status(400).json({
                success: false,
                error: 'sender_id and message are required',
            });
        }

        try {
            let messageContent = message;
            if (message_type === 'location' && message.location) {
                const { latitude, longitude } = message.location;
                if (latitude && longitude) {
                    messageContent = `{latitude:${latitude},longitude:${longitude}}`;
                } else {
                    return res.status(400).json({
                        success: false,
                        error: 'Location data is incomplete',
                    });
                }
            }

            const result = await dbRun(
                `INSERT INTO chat_messages (chat_id, sender_id, message, message_type)
                 VALUES (?, ?, ?, ?)`,
                [chatId, sender_id, messageContent, message_type]
            );

            const senderRow = await dbGet(
                `SELECT first_name, last_name FROM users WHERE id = ?`,
                [sender_id]
            );

            const senderName = senderRow
                ? `${senderRow.first_name} ${senderRow.last_name || ''}`.trim()
                : 'Unknown';

            const newMessage = {
                id: result.lastID,
                chat_id: chatId,
                sender: { id: sender_id, name: senderName },
                content: messageContent,
                message_type,
                timestamp: new Date().toISOString(),
            };

            if (io) {
                io.to(`chat_${chatId}`).emit('chat:new_message', newMessage);
                io.to(`user_${sender_id}`).emit('chat:list_update:trigger');
            }

            res.status(201).json({
                success: true,
                message: 'Message sent',
                message_id: result.lastID,
            });
        } catch (error) {
            console.error(`POST /chat/${chatId}/messages failed:`, error);
            res.status(500).json({ success: false, error: 'Failed to send message' });
        }
    });

    //  POST /chat/read
    router.post('/read', async (req, res) => {
        const { chat_id, user_id, message_id } = req.body;
        const chatId = parseInt(chat_id);

        if (!chatId || !user_id || !message_id) {
            return res.status(400).json({
                success: false,
                error: 'chat_id, user_id, and message_id are required',
            });
        }

        try {
            await dbRun(
                `INSERT INTO chat_read_receipts (chat_id, user_id, message_id, read_at)
                 VALUES (?, ?, ?, datetime('now'))
                 ON CONFLICT(chat_id, user_id)
                 DO UPDATE SET message_id = excluded.message_id, read_at = excluded.read_at`,
                [chatId, user_id, message_id]
            );

            if (io) {
                io.to(`chat_${chatId}`).emit('chat:read_receipt', {
                    chat_id: chatId,
                    user_id,
                    message_id,
                    read_at: new Date().toISOString(),
                });
            }

            res.status(200).json({ success: true, message: 'Read receipt updated' });
        } catch (error) {
            console.error(`POST /chat/read failed:`, error);
            res.status(500).json({ success: false, error: 'Failed to update read receipt' });
        }
    });

    //  GET /chat/:chat_id/read-receipts
    router.get('/:chat_id/read-receipts', async (req, res) => {
        const chatId = parseInt(req.params.chat_id);
        if (isNaN(chatId)) {
            return res.status(400).json({ success: false, error: 'Invalid chat_id' });
        }

        try {
            const rows = await dbAll(
                `SELECT rr.user_id, rr.message_id, rr.read_at,
                        u.first_name, u.last_name, u.profile_picture_url
                 FROM chat_read_receipts rr
                 JOIN users u ON u.id = rr.user_id
                 WHERE rr.chat_id = ?`,
                [chatId]
            );

            const receipts = rows.map((r) => ({
                user_id: r.user_id,
                message_id: r.message_id,
                read_at: r.read_at,
                name: `${r.first_name} ${r.last_name || ''}`.trim(),
                avatar: r.profile_picture_url,
            }));

            res.json({ success: true, data: receipts });
        } catch (error) {
            console.error(`GET /chat/${chatId}/read-receipts failed:`, error);
            res.status(500).json({ success: false, error: 'Failed to fetch read receipts' });
        }
    });

    return router;
};
