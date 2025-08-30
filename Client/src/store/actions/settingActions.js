// src/actions/settingsActions.js
/**
 * settingsActions.js
 *
 * This file contains actions for managing user settings, including updating the user's profile information.
 * The `updateUserProfile` action sends a request to update the user's first and last name, dispatches relevant
 * actions to update the Redux store, and saves the updated user data in AsyncStorage for persistence.
 *
 * Features:
 * - Sends a POST request to update the user's profile with new first and last names.
 * - Dispatches actions to update the user profile and authentication state in the Redux store.
 * - Saves updated user information to AsyncStorage for persistence across app sessions.
 *
 * This file uses the following libraries:
 * - Redux for managing state updates in the store.
 * - Fetch API for sending HTTP requests to update user data.
 * - AsyncStorage for persisting user data locally on the device.
 *
 * Dependencies:
 * - @react-native-async-storage/async-storage
 *
 * Author: Sunidhi Abhange
 */

import { API_URL_USERS } from '../../utils/apiPaths';
import { BASE_URL } from '../../utils/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Update user profile action
export const updateUserProfile = (userId, firstName, lastName) => async dispatch => {
    try {
        // Dispatch correct action type for reducer
        dispatch({ type: 'UPDATE_PROFILE_REQUEST' });

        const response = await fetch(`${BASE_URL}${API_URL_USERS}/update-profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, first_name: firstName, last_name: lastName })
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Update failed');
        }

        // Dispatch success for settings reducer
        dispatch({ type: 'UPDATE_PROFILE_SUCCESS', payload: data.user });

        // Update auth.user for instant UI update
        dispatch({ type: 'AUTH_UPDATE_USER', payload: data.user });

        // Save updated user to AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(data.user));

    } catch (error) {
        dispatch({ type: 'UPDATE_PROFILE_FAIL', payload: error.message });
    }
};
