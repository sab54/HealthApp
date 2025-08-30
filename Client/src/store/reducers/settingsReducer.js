// Client/src/store/reducers/settingsReducer.js
/**
 * settingsReducer.js
 *
 * This file defines the Redux slice for managing the user's settings, including profile updates. It handles actions 
 * related to updating the user profile, including managing loading, error, and success states. The slice also defines a 
 * reset action to clear any success or error messages after an operation.
 *
 * Features:
 * - Manages state for user profile updates, including loading, error, and success flags.
 * - Tracks the success or failure of profile update requests.
 * - Resets the state related to profile updates after an operation.
 *
 * This file uses the following libraries:
 * - Redux Toolkit for managing settings-related state and async actions.
 * - Custom actions for handling profile update requests.
 *
 * Dependencies:
 * - @reduxjs/toolkit
 *
 * Author: Sunidhi Abhange
 */

import { createSlice } from '@reduxjs/toolkit';
import { updateUserProfile } from '../actions/settingActions';


const initialState = {
    user: null,
    loading: false,
    error: null,
    success: false,
};

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        SETTINGS_RESET: (state) => {
            state.success = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase('UPDATE_PROFILE_REQUEST', (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase('UPDATE_PROFILE_SUCCESS', (state, action) => {
                state.user = action.payload;
                state.loading = false;
                state.success = true;
                state.error = null;
            })
            .addCase('UPDATE_PROFILE_FAIL', (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            });
    },
});

export const { SETTINGS_RESET } = settingsSlice.actions;
export default settingsSlice.reducer;
