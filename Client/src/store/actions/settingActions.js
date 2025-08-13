// src/actions/settingsActions.js
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
