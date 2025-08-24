// Client/src/store/reducers/healthlogReducers.js
import { createSlice } from '@reduxjs/toolkit';
import { fetchTodayMood, submitMood, markSymptomRecovered } from '../actions/healthlogActions';

const initialState = {
  moodToday: null,
  sleepToday: null,
  energyToday: null,
  todaySymptoms: [],

  // Separate loading flags
  loadingFetchTodayMood: false,
  loadingSubmitMood: false,
  loadingMarkRecovered: false,

  errorFetchTodayMood: null,
  errorSubmitMood: null,
  errorMarkRecovered: null,
};

const healthlogSlice = createSlice({
  name: 'healthlog',
  initialState,
  reducers: {
    clearError: (state) => {
      state.errorFetchTodayMood = null;
      state.errorSubmitMood = null;
      state.errorMarkRecovered = null;
    },
    resetMood: (state) => {
      state.moodToday = null;
      state.sleepToday = null;
      state.energyToday = null;
      state.todaySymptoms = [];
      state.errorFetchTodayMood = null;
      state.errorSubmitMood = null;
      state.errorMarkRecovered = null;
      state.loadingFetchTodayMood = false;
      state.loadingSubmitMood = false;
      state.loadingMarkRecovered = false;
    },
    addSymptom: (state, action) => {
      const exists = state.todaySymptoms.find(s => s.symptom === action.payload.symptom);
      if (!exists) {
        state.todaySymptoms.unshift(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchTodayMood
      .addCase(fetchTodayMood.pending, (state) => {
        state.loadingFetchTodayMood = true;
        state.errorFetchTodayMood = null;
      })
      .addCase(fetchTodayMood.fulfilled, (state, action) => {
        state.loadingFetchTodayMood = false;
        state.errorFetchTodayMood = null;
        state.moodToday = action.payload.mood;
        state.sleepToday = action.payload.sleep;
        state.energyToday = action.payload.energy;
        state.todaySymptoms = (action.payload.symptoms || []).map(s => ({
          ...s,
          recovered_at: s.recovered_at || null,
        }));
      })
      .addCase(fetchTodayMood.rejected, (state, action) => {
        state.loadingFetchTodayMood = false;
        state.errorFetchTodayMood = action.payload || 'Failed to fetch today\'s mood';
      })

      // submitMood
      .addCase(submitMood.pending, (state) => {
        state.loadingSubmitMood = true;
        state.errorSubmitMood = null;
      })
      .addCase(submitMood.fulfilled, (state, action) => {
        state.loadingSubmitMood = false;
        state.errorSubmitMood = null;
        state.moodToday = action.payload.mood;
        state.sleepToday = action.payload.sleep;
        state.energyToday = action.payload.energy;
        state.todaySymptoms = (action.payload.symptoms || []).map(s => ({
          ...s,
          recovered_at: s.recovered_at || null,
        }));
      })
      .addCase(submitMood.rejected, (state, action) => {
        state.loadingSubmitMood = false;
        state.errorSubmitMood = action.payload || 'Failed to submit mood';
      })

      // markSymptomRecovered
      .addCase(markSymptomRecovered.pending, (state) => {
        state.loadingMarkRecovered = true;
        state.errorMarkRecovered = null;
      })
      .addCase(markSymptomRecovered.fulfilled, (state, action) => {
        state.loadingMarkRecovered = false;
        state.errorMarkRecovered = null;
        const { symptom, recovered_at } = action.payload;
        state.todaySymptoms = state.todaySymptoms.map(s =>
          s.symptom === symptom ? { ...s, recovered_at } : s
        );
      })
      .addCase(markSymptomRecovered.rejected, (state, action) => {
        state.loadingMarkRecovered = false;
        state.errorMarkRecovered = action.payload || 'Failed to mark symptom recovered';
      });
  },
});

export const { clearError, resetMood, addSymptom } = healthlogSlice.actions;
export default healthlogSlice.reducer;
