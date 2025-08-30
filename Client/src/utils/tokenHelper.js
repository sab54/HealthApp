// client/utils/tokenHelper.js
/**
 * tokenHelper.js
 *
 * This file defines utility functions for saving and retrieving authentication tokens in the application. 
 * It uses `AsyncStorage` to persist the token locally on the device. These functions are essential for managing
 * user authentication and maintaining session state across app restarts.
 *
 * Features:
 * - `saveToken`: Saves the provided authentication token to AsyncStorage for persistence.
 * - `getToken`: Retrieves the authentication token from AsyncStorage. If no token exists, it returns `null`.
 *
 * Error Handling:
 * - Logs any errors that occur during token saving or retrieval.
 *
 * This file uses the following libraries:
 * - `@react-native-async-storage/async-storage`: For storing and retrieving tokens locally.
 *
 * Dependencies:
 * - @react-native-async-storage/async-storage
 *
 * Author: Sunidhi Abhange
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveToken = async (token) => {
  try {
    await AsyncStorage.setItem('token', token);
  } catch (e) {
    console.error('Failed to save token', e);
  }
};

export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    console.log('Retrieved token:', token);
    return token;
  } catch (e) {
    console.error('Failed to get token', e);
    return null;
  }
};
