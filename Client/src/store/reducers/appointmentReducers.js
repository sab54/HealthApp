// Client/src/reducers/appointmentReducer.js
/**
 * appointmentReducer.js
 *
 * This file defines the Redux slice for managing the appointment-related state in the application.
 * It includes actions and reducers for booking appointments, fetching existing appointments, and handling loading
 * and error states. The slice integrates with asynchronous actions (such as `bookAppointment` and `fetchAppointments`)
 * using Redux Toolkit's `createSlice` and `createAsyncThunk` to manage state transitions.
 *
 * Features:
 * - Handles appointment state, including a list of appointments, loading status, and any errors.
 * - Allows adding new appointments and clearing errors through reducer actions.
 * - Handles the `bookAppointment` and `fetchAppointments` actions, updating state based on their success or failure.
 * - Uses `extraReducers` to handle pending, fulfilled, and rejected states for async actions.
 *
 * This file uses the following libraries:
 * - Redux Toolkit to simplify Redux state management, including asynchronous action handling.
 * - `createSlice` to define the reducer logic for appointments.
 * - `createAsyncThunk` for handling async actions related to appointments (such as booking and fetching).
 *
 * Dependencies:
 * - @reduxjs/toolkit
 *
 * Author: Sunidhi Abhange
 */

import { createSlice } from '@reduxjs/toolkit';
import { bookAppointment, fetchAppointments } from '../actions/appointmentActions';

const initialState = {
  appointments: [],
  loading: false,
  error: null,
};

const appointmentSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {
    // Optional: add more reducers if needed
    clearError: (state) => {
      state.error = null;
    },
    addAppointment: (state, action) => {
      state.appointments.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bookAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bookAppointment.fulfilled, (state, action) => {
        state.loading = false;
        const newAppointments = Array.isArray(action.payload)
          ? action.payload
          : [action.payload];
        state.appointments = [...state.appointments, ...newAppointments];

      })
      .addCase(bookAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to book appointment';
      })
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload; // server sends rows
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, addAppointment } = appointmentSlice.actions;
export default appointmentSlice.reducer;
