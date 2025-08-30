// Client/src/store/actions/stepsActions.js
/**
 * stepsActions.js
 *
 * This file defines actions related to managing and tracking the user's steps, including saving new step entries,
 * fetching daily step totals, and retrieving the user's step history. The actions are implemented using Redux Toolkit's 
 * `createAsyncThunk` to handle asynchronous operations such as making API requests and updating the Redux store.
 *
 * Features:
 * - Saves a new step entry (steps, distance, speed, calories, and duration) to the backend.
 * - Fetches daily step totals for a user (00:00 - 23:59).
 * - Fetches a user's entire step history (every recorded entry).
 *
 * This file uses the following libraries:
 * - Redux Toolkit for managing state and async actions.
 * - Axios-based API utility for making GET and POST requests to the steps API.
 *
 * Dependencies:
 * - @reduxjs/toolkit
 *
 * Author: Sunidhi Abhange
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { get, post } from '../../utils/api';
import { API_URL_STEPS } from '../../utils/apiPaths';

// Save a new step entry
export const saveStepEntry = createAsyncThunk(
  'steps/saveStepEntry',
  async ({ user_id, steps, distance, speed, calories, duration }, { rejectWithValue }) => {
    try {
      const response = await post(`${API_URL_STEPS}`, {
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
  'steps/fetchDaily',
  async (userId, { rejectWithValue }) => {
    try {
      const res = await get(`${API_URL_STEPS}/daily/${userId}`);
      return res;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || err.message || 'Failed to fetch daily steps'
      );
    }
  }
);

// (Optional) Fetch raw history (every entry)
export const fetchStepsHistory = createAsyncThunk(
  'steps/fetchStepsHistory',
  async (user_id, { rejectWithValue }) => {
    try {
      const response = await get(`${API_URL_STEPS}/${user_id}`);
      return response; // array of entries
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch steps history');
    }
  }
);
