// Client/src/store/reducers/stepsReducer.js
import { createSlice } from '@reduxjs/toolkit';
import { saveStepEntry, fetchDailySteps, fetchStepsHistory } from '../actions/stepsActions.js';

const initialState = {
  daily: [],
  history: [],
  currentSteps: 0,
  currentDistance: 0,
  loading: false,
  error: null,
  isPaused: true, // <-- persisted state
};

const stepsSlice = createSlice({
  name: 'steps',
  initialState,
  reducers: {
    clearStepsError: (state) => {
      state.error = null;
    },
    updateCurrentSteps: (state, action) => {
      const { steps, distance } = action.payload;
      state.currentSteps = steps;
      state.currentDistance = distance;
    },
    resetCurrentSteps: (state) => {
      state.currentSteps = 0;
      state.currentDistance = 0;
    },
    setPaused: (state, action) => {
      state.isPaused = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Save entry
      .addCase(saveStepEntry.fulfilled, (state, action) => {
        state.history.unshift(action.payload);
      })
      // Daily totals
      .addCase(fetchDailySteps.fulfilled, (state, action) => {
        state.daily = action.payload;
      })
      // Full history
      .addCase(fetchStepsHistory.fulfilled, (state, action) => {
        state.history = action.payload;
      });
  },
});

export const { clearStepsError, updateCurrentSteps, resetCurrentSteps, setPaused } =
  stepsSlice.actions;

export default stepsSlice.reducer;
