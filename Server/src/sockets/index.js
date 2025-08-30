// Server/src/sockets/index.js
/**
 * Socket Event Handlers (index.js)
 *
 * This file defines socket event handlers for managing user and chat room connections, as well as
 * providing real-time features such as typing indicators and room management. It uses Socket.IO to handle
 * socket connections and interactions between users and chat rooms.
 *
 * Features:
 * - User-Specific Room: Allows users to join and leave their respective user-specific rooms.
 * - Chat Room Management: Enables users to join and leave chat rooms based on the provided chat IDs.
 * - Typing Indicators: Handles real-time typing indicators for chat rooms, notifying users when others are typing.
 * - Disconnect: Handles socket disconnections and logs the event.
 * 
 * Key Functionality:
 * - `join_user_room`: Allows the socket to join a user-specific room based on the user's ID.
 * - `join_chat`: Enables users to join a specific chat room.
 * - `leave_chat`: Allows users to leave a chat room.
 * - `chat:typing_start` and `chat:typing_stop`: Emit typing status updates to the respective chat room for real-time notifications.
 * 
 * Dependencies:
 * - socket.io: Provides real-time communication capabilities.
 *
 * Author: Sunidhi Abhange
 */

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        // Join user-specific room
        socket.on('join_user_room', (userId) => {
            if (typeof userId !== 'number') {
                console.warn(`Invalid userId for join_user_room:`, userId);
                return;
            }

            const room = `user_${userId}`;
            socket.join(room);
            console.log(`Socket ${socket.id} joined user room ${room}`);
        });

        // Join a chat room
        socket.on('join_chat', (chatId) => {
            if (typeof chatId !== 'number') {
                console.warn(`Invalid chatId for join_chat:`, chatId);
                return;
            }

            const room = `chat_${chatId}`;
            socket.join(room);
            console.log(`Socket ${socket.id} joined room ${room}`);
        });

        // Leave a chat room
        socket.on('leave_chat', (chatId) => {
            if (typeof chatId !== 'number') {
                console.warn(` Invalid chatId for leave_chat:`, chatId);
                return;
            }

            const room = `chat_${chatId}`;
            socket.leave(room);
            console.log(` Socket ${socket.id} left room ${room}`);
        });

        // Typing indicator (Enhanced)
        socket.on('chat:typing_start', ({ chatId, userId }) => {
            if (!chatId || !userId) return;
            io.to(`chat_${chatId}`).emit('chat:typing_start', {
                chatId,
                userId,
            });
        });

        socket.on('chat:typing_stop', ({ chatId, userId }) => {
            if (!chatId || !userId) return;
            io.to(`chat_${chatId}`).emit('chat:typing_stop', {
                chatId,
                userId,
            });
        });

        // Disconnect
        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });
};
