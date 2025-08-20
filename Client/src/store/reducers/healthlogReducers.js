// Client/src/store/reducers/healthlogReducers.js
import { createSlice } from '@reduxjs/toolkit';
import { fetchTodayMood, submitMood } from '../actions/healthlogActions';

const initialState = {
  moodToday: null,
  sleepToday: null,
  energyToday: null,
  todaySymptoms: [],
  loading: false,
  error: null,
};

const healthlogSlice = createSlice({
  name: 'healthlog',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetMood: (state) => {
      state.moodToday = null;
      state.todaySymptoms = [];
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchTodayMood
      .addCase(fetchTodayMood.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodayMood.fulfilled, (state, action) => {
        state.loading = false;
        state.moodToday = action.payload.mood;
        state.sleepToday = action.payload.sleep;
        state.energyToday = action.payload.energy;
        state.todaySymptoms = action.payload.symptoms || [];
      })
      .addCase(fetchTodayMood.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // submitMood
      .addCase(submitMood.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitMood.fulfilled, (state, action) => {
        state.loading = false;
        state.moodToday = action.payload.mood;
         state.sleepToday = action.payload.sleep;    // ✅ new
        state.energyToday = action.payload.energy;  // ✅ new
        state.todaySymptoms = action.payload.symptoms || [];
      })
      .addCase(submitMood.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, resetMood } = healthlogSlice.actions;
export default healthlogSlice.reducer;
