//client/store/actions/loginActions.js

import { createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { post, patch } from '../../utils/api';
import { API_URL_USERS } from '../../utils/apiPaths';
import { saveToken } from '../../utils/tokenHelper';

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

// Verify OTP and store token + user info
export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ user_id, otp_code }, { rejectWithValue }) => {
    try {
      const data = await post(`${API_URL_USERS}/verify-otp`, {
        user_id,
        otp_code,
      });

      const token = data?.token;
      const user = data?.user;

      if (token) await saveToken(token);
      if (user) {
        await AsyncStorage.setItem('userRole', user.role || '');
        await AsyncStorage.setItem('isApproved', String(user.is_approved || 0));
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'OTP verification failed');
    }
  }
);

// Logout
export const logout = createAsyncThunk('auth/logout', async () => {
  await AsyncStorage.clear();
  return true;
});

// Update user location (optional)
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
