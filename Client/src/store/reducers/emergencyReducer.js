/**
 * emergencyReducer.js
 *
 * This file defines the Redux slice for managing emergency contact settings in the application.
 * It includes actions for setting and updating the country code, custom name, and custom number
 * related to emergency contacts. The state is managed with Redux Toolkit's `createSlice` and is used
 * to store the emergency settings in the Redux store.
 *
 * Features:
 * - Manages emergency contact settings including country code, custom name, and custom number.
 * - Provides actions to update individual settings or set all settings at once.
 * - Ensures the state remains up-to-date with any changes to emergency contact information.
 *
 * This file uses the following libraries:
 * - Redux Toolkit for managing state and actions.
 *
 * Dependencies:
 * - @reduxjs/toolkit
 *
 * Author: Sunidhi Abhange
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    countryCode: 'US',
    customName: '',
    customNumber: '',
};

const emergencySlice = createSlice({
    name: 'emergency',
    initialState,
    reducers: {
        setCountryCode: (state, action) => {
            state.countryCode = action.payload;
        },
        setCustomName: (state, action) => {
            state.customName = action.payload;
        },
        setCustomNumber: (state, action) => {
            state.customNumber = action.payload;
        },
        setEmergencySettings: (state, action) => {
            const { countryCode, customName, customNumber } = action.payload;
            state.countryCode = countryCode;
            state.customName = customName;
            state.customNumber = customNumber;
        },
    },
});

export const {
    setCountryCode,
    setCustomName,
    setCustomNumber,
    setEmergencySettings,
} = emergencySlice.actions;
export default emergencySlice.reducer;
