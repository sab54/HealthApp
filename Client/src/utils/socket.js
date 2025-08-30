// Client/src/utils/socket.js
/**
 * socket.js
 *
 * This file defines utilities for managing a Socket.IO connection within the application. It includes functions for 
 * initializing a connection to the server, emitting and listening to events, and joining or leaving chat rooms. The 
 * functions help facilitate real-time communication, such as user connection, chat events, and typing indicators.
 *
 * Features:
 * - `initSocket`: Initializes a Socket.IO connection with the server using the provided user ID and token.
 *   - Connects the socket, joins the user room, and listens for connection and disconnection events.
 * - `getSocket`: Returns the current socket instance.
 * - `disconnectSocket`: Disconnects the socket and clears connection state.
 * - `emitEvent`: Emits a custom event with data to the server if the socket is connected.
 * - `onEvent`: Listens for a specific event from the server and triggers a callback when the event is received.
 * - `offEvent`: Removes the event listener for a specified event.
 * - `joinChat`: Joins a specific chat room by emitting the `join_chat` event with the provided chat ID.
 * - `leaveChat`: Leaves a specific chat room by emitting the `leave_chat` event with the provided chat ID.
 * - Typing Indicator Emitters: Emits `chat:typing_start` and `chat:typing_stop` events when a user starts or stops typing in a chat.
 *
 * This file uses the following libraries:
 * - `socket.io-client`: Provides real-time, bidirectional communication between the client and the server.
 * 
 * Dependencies:
 * - socket.io-client
 *
 * Author: Sunidhi Abhange
 */

import { io } from 'socket.io-client';
import { BASE_URL } from './config';

let socket = null;
let isConnected = false;
let currentUserId = null;

/**
 * Initialize Socket.IO connection
 */
export const initSocket = ({ userId, token, query = {} } = {}) => {
    if (socket) return socket;

    currentUserId = userId;

    socket = io(BASE_URL, {
        transports: ['websocket'],
        forceNew: true,
        query: {
            userId,
            token,
            ...query,
        },
    });

    socket.on('connect', () => {
        isConnected = true;
        console.log('Socket connected:', socket.id);

        if (currentUserId) {
            socket.emit('join_user_room', currentUserId);
            console.log(`Joined user room: user_${currentUserId}`);
        }
    });

    socket.on('disconnect', (reason) => {
        isConnected = false;
        console.log('Socket disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
        console.error('Connection error:', err.message);
    });

    return socket;
};

/**
 * Get socket instance
 */
export const getSocket = () => socket;

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        isConnected = false;
        currentUserId = null;
        console.log('Socket disconnected');
    }
};

/**
 * Emit socket event
 */
export const emitEvent = (event, data) => {
    if (socket && isConnected) {
        socket.emit(event, data);
    }
};

/**
 * Listen for socket event
 */
export const onEvent = (event, callback) => {
    if (socket) {
        socket.on(event, callback);
    }
};

/**
 * Remove socket event listener
 */
export const offEvent = (event) => {
    if (socket) {
        socket.off(event);
    }
};

/**
 * Join chat room
 */
export const joinChat = (chatId) => {
    if (socket && chatId) {
        socket.emit('join_chat', chatId);
        console.log(`Joined chat_${chatId}`);
    }
};

/**
 * Leave chat room
 */
export const leaveChat = (chatId) => {
    if (socket && chatId) {
        socket.emit('leave_chat', chatId);
        console.log(`Left chat_${chatId}`);
    }
};

// NEW: Typing Indicator Emitters
export const sendTypingStart = (chatId, userId) => {
    if (socket && isConnected && chatId && userId) {
        socket.emit('chat:typing_start', { chatId, userId });
    }
};

export const sendTypingStop = (chatId, userId) => {
    if (socket && isConnected && chatId && userId) {
        socket.emit('chat:typing_stop', { chatId, userId });
    }
};
