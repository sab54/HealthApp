//client/store/actions/loginActions.js

import { createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { post, patch } from '../../utils/api';
import { API_URL_USERS, API_URL_STEPS } from '../../utils/apiPaths';
import { saveToken } from '../../utils/tokenHelper';
import { fetchDailySteps } from '../actions/stepsActions';
import * as SensorTracker from '../../utils/sensorTracker';
import { updateCurrentSteps,resetCurrentSteps, setPaused } from '../reducers/stepsReducer';


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

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ user_id, otp_code }, { dispatch, rejectWithValue }) => {
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
        await AsyncStorage.setItem('user', JSON.stringify(user));
      }

      // ⚠️ Only try to fetch steps if user exists
      if (user?.id) {
        try {
          const daily = await dispatch(fetchDailySteps(user.id)).unwrap();
          const today = daily.find(
            r => r.day === new Date().toISOString().split('T')[0]
          );
          if (today) {
            dispatch(updateCurrentSteps({
              steps: today.total_steps,
              distance: today.total_distance,
            }));
          }
        } catch (err) {
          console.warn('Step fetch failed after login:', err.message);
        }
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'OTP verification failed');
    }
  }
);


// Logout
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { getState, dispatch }) => {
    const state = getState();
    const user = state.auth.user;
    const speed = state.steps?.speed || 0;
    const calories = state.steps?.calories || 0;
    const duration = state.steps?.duration || 0;
    const steps = state.steps?.currentSteps || 0;
    const distance = state.steps?.currentDistance || 0;

    // Save current totals before clearing storage
    if (user?.id) {
      try {
        await post(API_URL_STEPS, {
          user_id: user.id,
          steps,
          distance,
          speed,
          calories,
          duration,
        });
      } catch (err) {
        console.warn('Failed to save steps on logout:', err.message);
      }
    }

    // Stop accelerometer
    SensorTracker.stopStepTracking?.();

    // Reset Redux steps slice
    dispatch(setPaused(true));

    // Then clear local storage
    await AsyncStorage.clear();
    return true;
  }
);


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

export const initAuth = createAsyncThunk(
  'auth/initAuth',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return null;

      const userJson = await AsyncStorage.getItem('user');
      if (!userJson) return null;

      const user = JSON.parse(userJson);

      if (user?.id) {
        try {
          const daily = await dispatch(fetchDailySteps(user.id)).unwrap();
          const today = daily.find(r => r.day === new Date().toISOString().split('T')[0]);

          if (today) {
            dispatch(updateCurrentSteps({
              steps: today.total_steps,
              distance: today.total_distance,
            }));
          }
        } catch (err) {
          console.warn('Step fetch failed on init:', err.message);
        }
      }

      return { token, user };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to initialize auth');
    }
  }
);


