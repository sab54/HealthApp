// Client/src/store/actions/stepsActions.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import { get, post } from '../../utils/api';

// Save a new step entry
export const saveStepEntry = createAsyncThunk(
  'steps/saveStepEntry',
  async ({ user_id, steps, distance, speed, calories, duration }, { rejectWithValue }) => {
    try {
      const response = await post('/steps', {
        user_id,
        steps,
        distance,
        speed,
        calories,
        duration,
      });
      return response; // API returns inserted row
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to save steps');
    }
  }
);

// Fetch daily totals (00:00 - 23:59)
export const fetchDailySteps = createAsyncThunk(
  'steps/fetchDailySteps',
  async (user_id, { rejectWithValue }) => {
    try {
      const response = await get(`/steps/daily/${user_id}`);
      return response; // [{ day, total_steps, total_distance, total_calories, total_duration }]
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch daily steps');
    }
  }
);

// (Optional) Fetch raw history (every entry)
export const fetchStepsHistory = createAsyncThunk(
  'steps/fetchStepsHistory',
  async (user_id, { rejectWithValue }) => {
    try {
      const response = await get(`/steps/${user_id}`);
      return response; // array of entries
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch steps history');
    }
  }
);
