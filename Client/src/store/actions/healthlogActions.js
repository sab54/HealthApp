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

// Fetch today's symptoms
export const fetchTodaySymptoms = createAsyncThunk(
  'healthlog/fetchTodaySymptoms',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await get(`${API_URL_HEALTHLOG}/today?userId=${userId}`);
      const today = new Date().toISOString().split('T')[0];

      // Only include today's symptoms
      const mappedSymptoms = (response.symptoms || [])
        .map(s => ({ ...s, recovered_at: s.recovered_at || null, date: s.date || today }))
        .filter(s => s.date === today);

      return mappedSymptoms;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Mark symptom as recovered
export const markSymptomRecovered = createAsyncThunk(
  'healthlog/markSymptomRecovered',
  async ({ userId, symptom }, { rejectWithValue }) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await post(`${API_URL_HEALTHLOG}/recoverSymptom`, {
        user_id: userId,
        symptom: symptom.symptom,
        date: today
      });

      // Return updated symptom for Redux
      return { ...symptom, recovered_at: today };
    } catch (err) {
      return rejectWithValue(err.message || 'Error marking symptom recovered');
    }
  }
);

// Fetch daily plan (checklist)
export const fetchPlan = createAsyncThunk(
  'healthlog/fetchPlan',
  async ({ user_id, symptom, severity }, { rejectWithValue }) => {
    try {
      if (!user_id) return rejectWithValue('Missing user_id');

      // Build query params correctly
      const params = `?userId=${user_id}` +
        (symptom ? `&symptom=${encodeURIComponent(symptom)}` : '') +
        (severity ? `&severity=${encodeURIComponent(severity)}` : '');

      const response = await get(`${API_URL_HEALTHLOG}/plan${params}`);
      return { plan: response.plan || [] };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch plan');
    }
  }
);
export const updatePlanTask = createAsyncThunk(
  'healthlog/updatePlanTask',
  async ({ user_id, date, category, task, done }, { rejectWithValue }) => {
    try {
      const response = await post(`${API_URL_HEALTHLOG}/updatePlanTask`, {
        user_id,
        date,
        category,
        task,
        done
      });

      console.log('updatePlanTask response from backend:', response); // ✅ log response
      return { category, task, done };
    } catch (err) {
      console.error('updatePlanTask error:', err);
      return rejectWithValue(err.message || 'Failed to update plan task');
    }
  }
);
