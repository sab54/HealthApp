/**
 * healthlogReducer.js
 *
 * This file defines the Redux slice for managing the health log state in the application, including mood, sleep,
 * energy, symptoms, and health plans. It handles actions related to fetching and submitting mood data, marking symptoms
 * as recovered, and fetching or updating the daily health plan. The slice also tracks loading and error states for
 * various operations, ensuring the UI remains responsive and up-to-date.
 *
 * Features:
 * - Manages state for today's mood, sleep, energy, symptoms, and health plan.
 * - Supports actions for fetching, submitting, and marking symptoms as recovered.
 * - Provides actions to reset mood data or add/update symptoms in the health log.
 * - Handles loading and error flags to reflect the current status of API operations.
 * - Updates the daily health plan and tracks task completion.
 *
 * This file uses the following libraries:
 * - Redux Toolkit for managing state and async actions with `createSlice`.
 * - Async actions for interacting with the backend and fetching/updating health log data.
 *
 * Dependencies:
 * - @reduxjs/toolkit
 *
 * Author: Sunidhi Abhange
 */

import { createSlice } from '@reduxjs/toolkit';
import { fetchTodayMood, submitMood, markSymptomRecovered, fetchPlan, updatePlanTask } from '../actions/healthlogActions';

const initialState = {
  moodToday: null,
  sleepToday: null,
  energyToday: null,
  todaySymptoms: [],
  planToday: [],

  // Loading flags
  loadingFetchTodayMood: false,
  loadingSubmitMood: false,
  loadingMarkRecovered: false,
  loadingPlan: false,

  // Error flags
  errorFetchTodayMood: null,
  errorSubmitMood: null,
  errorMarkRecovered: null,
  errorPlan: null,
};

const healthlogSlice = createSlice({
  name: 'healthlog',
  initialState,
  reducers: {
    clearError: (state) => {
      state.errorFetchTodayMood = null;
      state.errorSubmitMood = null;
      state.errorMarkRecovered = null;
      state.errorPlan = null;
    },
    resetMood: (state) => {
      state.moodToday = null;
      state.sleepToday = null;
      state.energyToday = null;
      state.todaySymptoms = [];
      state.planToday = [];
      state.errorFetchTodayMood = null;
      state.errorSubmitMood = null;
      state.errorMarkRecovered = null;
      state.errorPlan = null;
      state.loadingFetchTodayMood = false;
      state.loadingSubmitMood = false;
      state.loadingMarkRecovered = false;
      state.loadingPlan = false;
    },
    addSymptom: (state, action) => {
      const exists = state.todaySymptoms.find(s => s.symptom === action.payload.symptom);
      if (!exists) {
        state.todaySymptoms.unshift(action.payload);
      }
    },
    setTodaySymptoms: (state, action) => {
      state.todaySymptoms = action.payload;
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
      })

      // fetchPlan
      .addCase(fetchPlan.pending, (state) => {
        state.loadingPlan = true;
        state.errorPlan = null;
      })
      .addCase(fetchPlan.fulfilled, (state, action) => {
        state.loadingPlan = false;
        state.errorPlan = null;
        state.planToday = (action.payload.plan || []).map(task => ({
          ...task,
          severity_level: task.severity
        }));
      })

      .addCase(fetchPlan.rejected, (state, action) => {
        state.loadingPlan = false;
        state.errorPlan = action.payload || 'Failed to fetch plan';
      })

      // updatePlanTask
      .addCase(updatePlanTask.fulfilled, (state, action) => {
        const { category, task, done } = action.payload;
        state.planToday = state.planToday.map((item) =>
          item.category === category && item.task === task
            ? { ...item, done }
            : item
        );
      });
  },
});

export const { clearError, resetMood, addSymptom, setTodaySymptoms } = healthlogSlice.actions;
export default healthlogSlice.reducer;
