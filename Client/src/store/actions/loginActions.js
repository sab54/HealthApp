import { createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { post, patch } from '../../utils/api';
import { API_URL_USERS } from '../../utils/apiPaths';

// Request OTP
export const requestOtp = createAsyncThunk(
    'auth/requestOtp',
    async ({ phone_number, country_code }, { rejectWithValue }) => {
        try {
            const data = await post(`${API_URL_USERS}/request-otp`, {
                phone_number,
                country_code,
            });

            await AsyncStorage.setItem('countryCode', country_code);
            await AsyncStorage.setItem('lastPhone', phone_number);

            return data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to request OTP');
        }
    }
);

// Verify OTP
export const verifyOtp = createAsyncThunk(
    'auth/verifyOtp',
    async ({ user_id, otp_code }, { rejectWithValue }) => {
        try {
            const data = await post(`${API_URL_USERS}/verify-otp`, {
                user_id,
                otp_code,
            });

            return data;
        } catch (error) {
            return rejectWithValue(error.message || 'OTP verification failed');
        }
    }
);

// Logout
export const logout = createAsyncThunk('auth/logout', async () => {
    return true; // You can clear AsyncStorage here if needed
});

// Update user location
export const updateUserLocation = createAsyncThunk(
    'auth/updateUserLocation',
    async ({ userId, latitude, longitude }, { rejectWithValue }) => {
        try {
            const data = await patch(`${API_URL_USERS}/${userId}/location`, {
                latitude,
                longitude,
            });
            return data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update location');
        }
    }
);
