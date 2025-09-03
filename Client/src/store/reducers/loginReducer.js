// Client/src/store/reducers/loginReducer.js
/**
 * loginReducer.js
 *
 * This file defines the Redux slice for managing the authentication state in the application, including user verification,
 * user location updates, and handling login/logout operations. It integrates with asynchronous actions such as verifying OTP,
 * updating user location, and initializing authentication. The slice also manages loading and error states, as well as user
 * details within the Redux store.
 *
 * Features:
 * - Manages state for the authentication process, including user verification, loading, and error handling.
 * - Handles user logout, resetting the state and clearing user data from the store.
 * - Supports updating the user's location and storing latitude/longitude in the state.
 * - Initializes the authentication state by checking the user's status and loading user data.
 *
 * This file uses the following libraries:
 * - Redux Toolkit for managing authentication-related state and async actions.
 * - Async actions to interact with the backend for OTP verification, location updates, and authentication initialization.
 *
 * Dependencies:
 * - @reduxjs/toolkit
 *
 * Author: Sunidhi Abhange
 */

import { createSlice } from '@reduxjs/toolkit';
import { verifyOtp, logout, updateUserLocation, initAuth } from '../actions/loginActions';

const initialState = {
    loading: false,
    error: null,
    user: null,
    isVerified: false,
};

const loginSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        resetAuthState: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(verifyOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.isVerified = false;
            })
            .addCase(verifyOtp.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user || null;
                state.isVerified = true;
            })
            .addCase(verifyOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.isVerified = false;
            })
            .addCase(updateUserLocation.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUserLocation.fulfilled, (state, action) => {
                state.loading = false;
                if (state.user) {
                    state.user.latitude = action.meta.arg.latitude;
                    state.user.longitude = action.meta.arg.longitude;
                }
            })
            .addCase(initAuth.fulfilled, (state, action) => {
                if (action.payload?.user) {
                    state.user = action.payload.user;
                    state.isVerified = true;
                }
            })

            .addCase(updateUserLocation.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(logout.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
                state.user = null;
                state.isVerified = false;
            })
    },
});

export const { resetAuthState } = loginSlice.actions;
export default loginSlice.reducer;
