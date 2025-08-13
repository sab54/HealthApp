// Client/src/store/actions/registrationActions.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL_USERS } from '../../utils/apiPaths.js';
import { post, patch } from '../../utils/api'; // Ensure patch is defined for PATCH requests

export const registerUser = createAsyncThunk(
  'registration/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const url = `${API_URL_USERS}/register`;
      console.log('Registering user at:', url);
      console.log('User data:', userData);
      console.log('Post function is:', post);

      // Optional headers can be passed here
      const headers = {}; // e.g., { Authorization: `Bearer ${token}` }

      const data = await post(
        url,
        {
          ...userData,
          latitude: userData.latitude || null,
          longitude: userData.longitude || null,
        },
        headers
      );

      await AsyncStorage.setItem('countryCode', userData.country_code);
      await AsyncStorage.setItem('lastPhone', userData.phone_number);

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

