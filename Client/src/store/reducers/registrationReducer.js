// Client/src/store/reducers/registrationReducer.js
/**
 * registrationReducer.js
 *
 * This file defines the Redux slice for managing the state related to user registration. It includes actions for handling
 * the registration process, such as submitting registration data and managing loading and error states. The slice
 * integrates with the `registerUser` async action to manage user registration and store the resulting user data in the Redux store.
 *
 * Features:
 * - Manages state for the registration process, including loading and error handling.
 * - Stores the registered user's data upon successful registration.
 * - Tracks the registration process status (pending, fulfilled, rejected).
 *
 * This file uses the following libraries:
 * - Redux Toolkit for managing registration-related state and async actions.
 * - Async actions for interacting with the backend during the registration process.
 *
 * Dependencies:
 * - @reduxjs/toolkit
 *
 * Author: Sunidhi Abhange
 */

import { createSlice } from '@reduxjs/toolkit';
import { registerUser } from '../actions/registrationActions';

const initialState = {
    loading: false,
    user: null,
    error: null,
};

const registrationSlice = createSlice({
    name: 'registration',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default registrationSlice.reducer;
