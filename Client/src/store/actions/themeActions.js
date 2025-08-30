// themeActions.js
/**
 * themeActions.js
 *
 * This file defines actions for managing the theme settings of the application, including loading the theme from 
 * AsyncStorage, toggling between light and dark modes, and applying the selected theme. It also determines the 
 * effective dark mode based on the user's preference or system settings.
 *
 * Features:
 * - Loads the theme mode (light, dark, or system) from AsyncStorage and applies it to the app.
 * - Toggles between light, dark, and system theme modes.
 * - Applies the selected theme and updates the Redux store to reflect the effective dark mode.
 *
 * This file uses the following libraries:
 * - AsyncStorage for persisting theme preferences locally.
 * - React Native's `Appearance` API to determine the system's color scheme.
 * - Redux for managing theme state and applying the mode to the app.
 *
 * Dependencies:
 * - @react-native-async-storage/async-storage
 * - react-native
 *
 * Author: Sunidhi Abhange
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { setThemeMode, setEffectiveDarkMode } from '../reducers/themeReducer';

export const loadThemeFromStorage = () => async (dispatch) => {
    const storedMode = await AsyncStorage.getItem('themeMode');
    const mode = storedMode || 'system';
    dispatch(applyThemeMode(mode));
};

export const toggleTheme = () => (dispatch, getState) => {
    const { mode } = getState().theme;
    const nextMode =
        mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light';

    dispatch(applyThemeMode(nextMode));
};

export const applyThemeMode = (mode) => async (dispatch) => {
    await AsyncStorage.setItem('themeMode', mode);
    dispatch(setThemeMode(mode));

    const systemScheme = Appearance.getColorScheme();
    const isDark =
        mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
    dispatch(setEffectiveDarkMode(isDark));
};
