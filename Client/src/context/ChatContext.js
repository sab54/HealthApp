// Client/src/context/ChatContext.js
/**
 * ChatContext.js
 * 
 * This file defines the `ChatContext` and `ChatProvider`, which manage the state and 
 * actions related to chat functionality in the app. It provides a context for managing 
 * multiple chats, sending messages, adding reactions, and handling replies. The `ChatProvider` 
 * encapsulates the app’s chat state and provides functions for creating new chats, 
 * sending messages, and handling user interactions like replies and reactions.
 * 
 * Features:
 * - Manages a list of chats, each with messages, members, and typing status.
 * - Provides functions to start new chats and send messages.
 * - Simulates bot responses for each new message sent in a chat.
 * - Allows adding replies and reactions to specific messages.
 * - Uses `uuid` for generating unique IDs for chats, messages, and replies.
 * - Wraps the app in a `ChatContext` that provides access to the chat data and actions.
 * 
 * Context:
 * - `ChatContext`: Provides access to the `chats` state, and functions like `startNewChat`, `sendMessage`, `addReply`, and `addReaction`.
 * 
 * Functions:
 * - `startNewChat`: Creates a new chat with default members and an empty message list.
 * - `sendMessage`: Sends a new message to a specific chat and triggers a simulated typing event.
 * - `simulateTyping`: Simulates a typing status and a bot response after a delay.
 * - `addReply`: Adds a reply to a specific message within a chat.
 * - `addReaction`: Adds a reaction (emoji) to a specific message within a chat.
 * 
 * Props:
 * - `children`: The children components wrapped by the `ChatProvider` to access chat state.
 * 
 * Dependencies:
 * - `react`
 * - `react-native`
 * - `react-native-uuid`
 * 
 * Author: Sunidhi Abhange
 */

import React, { createContext, useState } from 'react';
import uuid from 'react-native-uuid';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [chats, setChats] = useState([]);

    const startNewChat = () => {
        const newChat = {
            id: uuid.v4(),
            name: `Group ${chats.length + 1}`,
            members: [
                { id: uuid.v4(), name: 'Alice' },
                { id: uuid.v4(), name: 'Bob' },
            ],
            messages: [],
            typing: false,
        };
        setChats((prev) => [newChat, ...prev]);
    };

    const sendMessage = (chatId, text) => {
        if (!text.trim()) return;

        setChats((prev) =>
            prev.map((chat) =>
                chat.id === chatId
                    ? {
                          ...chat,
                          messages: [
                              {
                                  id: uuid.v4(),
                                  text,
                                  sender: { id: 'me', name: 'You' },
                                  timestamp: new Date(),
                                  reactions: [],
                                  replies: [],
                              },
                              ...chat.messages,
                          ],
                      }
                    : chat
            )
        );

        simulateTyping(chatId);
    };

    const simulateTyping = (chatId) => {
        setChats((prev) =>
            prev.map((chat) =>
                chat.id === chatId ? { ...chat, typing: true } : chat
            )
        );

        setTimeout(() => {
            const botReply = {
                id: uuid.v4(),
                text: 'Got it!',
                sender: { id: uuid.v4(), name: 'Bot' },
                timestamp: new Date(),
                reactions: [],
                replies: [],
            };

            setChats((prev) =>
                prev.map((chat) =>
                    chat.id === chatId
                        ? {
                              ...chat,
                              messages: [botReply, ...chat.messages],
                              typing: false,
                          }
                        : chat
                )
            );
        }, 2000);
    };

    const addReply = (chatId, messageId, text) => {
        if (!text.trim()) return;

        setChats((prev) =>
            prev.map((chat) =>
                chat.id === chatId
                    ? {
                          ...chat,
                          messages: chat.messages.map((msg) =>
                              msg.id === messageId
                                  ? {
                                        ...msg,
                                        replies: [
                                            ...msg.replies,
                                            {
                                                id: uuid.v4(),
                                                text,
                                                timestamp: new Date(),
                                            },
                                        ],
                                    }
                                  : msg
                          ),
                      }
                    : chat
            )
        );
    };

    const addReaction = (chatId, messageId, emoji) => {
        setChats((prev) =>
            prev.map((chat) =>
                chat.id === chatId
                    ? {
                          ...chat,
                          messages: chat.messages.map((msg) =>
                              msg.id === messageId
                                  ? {
                                        ...msg,
                                        reactions: [
                                            ...msg.reactions,
                                            { emoji },
                                        ],
                                    }
                                  : msg
                          ),
                      }
                    : chat
            )
        );
    };

    return (
        <ChatContext.Provider
            value={{ chats, startNewChat, sendMessage, addReply, addReaction }}
        >
            {children}
        </ChatContext.Provider>
    );
};
