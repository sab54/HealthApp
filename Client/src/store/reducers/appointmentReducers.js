// Client/src/redux/appointmentReducer.js
import { createSlice } from '@reduxjs/toolkit';
import { bookAppointmentAI } from './appointmentActions';

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
      .addCase(bookAppointmentAI.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bookAppointmentAI.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments.push(action.payload);
      })
      .addCase(bookAppointmentAI.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to book appointment';
      });
  },
});

export const { clearError, addAppointment } = appointmentSlice.actions;
export default appointmentSlice.reducer;
