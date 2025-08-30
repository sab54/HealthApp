/**
 * themeReducer.js
 *
 * This file defines the Redux slice for managing the theme-related state in the application. It includes actions for
 * setting the theme mode (light, dark, or system) and applying the effective dark mode based on user preferences or
 * system settings. The slice also manages the theme colors, which are updated according to the selected mode.
 *
 * Features:
 * - Manages the theme mode (light, dark, system) and the effective dark mode state.
 * - Dynamically updates theme colors based on the selected mode.
 * - Integrates with `getThemeColors` to fetch and apply appropriate theme colors for light and dark modes.
 *
 * This file uses the following libraries:
 * - Redux Toolkit for managing theme-related state and actions.
 * - A custom `getThemeColors` function to retrieve theme colors based on the mode.
 *
 * Dependencies:
 * - @reduxjs/toolkit
 *
 * Author: Sunidhi Abhange
 */

import { createSlice } from '@reduxjs/toolkit';
import { getThemeColors } from '../../theme/themeTokens';

const initialState = {
    mode: 'system', // 'light' | 'dark' | 'system'
    isDarkMode: false,
    themeColors: getThemeColors(false),
};

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        setThemeMode: (state, action) => {
            state.mode = action.payload;
        },
        setEffectiveDarkMode: (state, action) => {
            state.isDarkMode = action.payload;
            state.themeColors = getThemeColors(action.payload);
        },
    },
});

export const { setThemeMode, setEffectiveDarkMode } = themeSlice.actions;
export default themeSlice.reducer;
