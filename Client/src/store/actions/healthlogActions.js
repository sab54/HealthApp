// Client/src/store/actions/healthlogActions.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL_HEALTHLOG } from '../../utils/apiPaths';
import { post, get } from '../../utils/api';

export const submitMood = createAsyncThunk(
  'healthlog/submitMood',
  async ({ user_id, mood, symptoms, sleep, energy }, { getState, rejectWithValue }) => {
    const state = getState();
    const fallbackId =
      user_id ||
      state.auth?.user?.id ||
      state.auth?.user?.user_id ||
      state.auth?.user?._id;

    if (!fallbackId || !mood) return rejectWithValue('Missing user_id or mood');

    try {
      const payload = { user_id: fallbackId, mood };

      // ✅ Add sleep and energy directly from payload
      if (sleep !== undefined) payload.sleep = sleep;
      if (energy !== undefined) payload.energy = energy;

      if (symptoms) payload.symptoms = symptoms;

      const response = await post(`${API_URL_HEALTHLOG}/submit`, payload);

      return {
        mood,
        symptoms: symptoms || [],
        sleep: payload.sleep || null,
        energy: payload.energy || null,
        message: response.message || null
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Error submitting mood');
    }
  }
);


// Fetch today's mood for user
export const fetchTodayMood = createAsyncThunk(
  'healthlog/fetchTodayMood',
  async (user_id, { rejectWithValue }) => {
    if (!user_id) return rejectWithValue('Missing user_id');

    try {
      const response = await get(`${API_URL_HEALTHLOG}/today?userId=${user_id}`);

      // ✅ Return full response object
      return {
        mood: response.mood || null,
        sleep: response.sleep || null,
        energy: response.energy || null,
        symptoms: response.symptoms || [],

      };
    } catch (error) {
      return rejectWithValue(error.message || 'Error fetching mood');
    }
  }
);
