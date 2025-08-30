/**
 * emergencySettingsActions.js
 *
 * This file defines actions for loading and saving emergency contact settings in the application. The actions
 * use AsyncStorage to persist the emergency contact details locally on the device, including the contact's name,
 * phone number, and country code. It supports both development and production modes, with mock data used in
 * development for testing purposes.
 *
 * Features:
 * - Loads emergency settings (name, number, and country code) from AsyncStorage.
 * - Saves updated emergency settings to AsyncStorage.
 * - Supports fallback to mock data when in development mode.
 *
 * This file uses the following libraries:
 * - AsyncStorage for persisting settings locally.
 * - Redux for managing state via `setEmergencySettings` reducer.
 * - DEV_MODE flag for conditionally using mock data.
 *
 * Dependencies:
 * - @react-native-async-storage/async-storage
 * - redux
 *
 * Author: Sunidhi Abhange
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { setEmergencySettings } from '../reducers/emergencyReducer';
import { DEV_MODE } from '../../utils/config';
// import { mockEmergencySettings } from '../../data/mockData';

export const loadEmergencySettings = () => async (dispatch) => {
    if (DEV_MODE) {
        dispatch(setEmergencySettings(mockEmergencySettings));
        return;
    }

    const name = await AsyncStorage.getItem('emergencyContactName');
    const number = await AsyncStorage.getItem('emergencyContactNumber');
    const country = await AsyncStorage.getItem('emergencyCountry');

    dispatch(
        setEmergencySettings({
            customName: name || '',
            customNumber: number || '',
            countryCode: country || 'US',
        })
    );
};

export const saveEmergencySettings = (settings) => async (dispatch) => {
    if (DEV_MODE) {
        dispatch(setEmergencySettings(settings));
        return;
    }

    const { customName, customNumber, countryCode } = settings;
    await AsyncStorage.setItem('emergencyContactName', customName);
    await AsyncStorage.setItem('emergencyContactNumber', customNumber);
    await AsyncStorage.setItem('emergencyCountry', countryCode);
    dispatch(setEmergencySettings(settings));
};
