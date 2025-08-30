// Client/src/store/reducers/stepsReducer.js
/**
 * stepsReducer.js
 *
 * This file defines the Redux slice for managing the steps tracking functionality within the application. It handles
 * actions related to saving step entries, fetching daily steps, and retrieving the full history of steps. The slice
 * manages state for current steps, distance, and historical data, as well as the paused state of the step tracking.
 *
 * Features:
 * - Manages state for current steps and distance, including the daily total and full history.
 * - Supports actions for saving new step entries and updating the current step count and distance.
 * - Tracks the paused state of the step tracking (e.g., if the user is currently active or paused).
 * - Fetches daily step totals and full step history.
 *
 * This file uses the following libraries:
 * - Redux Toolkit for managing steps-related state and async actions.
 * - Actions for interacting with the backend and updating the steps state.
 *
 * Dependencies:
 * - @reduxjs/toolkit
 *
 * Author: Sunidhi Abhange
 */

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
