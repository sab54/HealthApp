//Client/src/store/selectors/chatSelectors.js
/**
 * chatSelectors.js
 *
 * This file defines selectors for accessing specific pieces of the chat-related state in the Redux store.
 * It uses the `reselect` library to create memoized selectors for retrieving typing users and messages by chat ID.
 *
 * Features:
 * - `selectTypingUsersByChatId`: Retrieves the list of typing users for a specific chat by its ID.
 * - `selectMessagesByChatId`: Retrieves the list of messages for a specific chat by its ID.
 * - Both selectors use `createSelector` from the `reselect` library to optimize performance by memoizing the results.
 *
 * This file uses the following libraries:
 * - Reselect for creating optimized, memoized selectors.
 *
 * Dependencies:
 * - reselect
 *
 * Author: Sunidhi Abhange
 */

import { createSelector } from 'reselect';

export const selectTypingUsersByChatId = (chatId) =>
    createSelector(
        (state) => state.chat.typingUsersByChatId,
        (typingUsersByChatId) => typingUsersByChatId?.[chatId] || []
    );

export const selectMessagesByChatId = (chatId) =>
    createSelector(
        (state) => state.chat.messagesByChatId,
        (messagesByChatId) => messagesByChatId?.[chatId] || []
    );
