// Client/src/reducers/appointmentReducer.js
import { createSlice } from '@reduxjs/toolkit';
import { bookAppointment } from '../actions/appointmentActions';

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
        state.appointments.push(action.payload);
      })
      .addCase(bookAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to book appointment';
      });
  },
});

export const { clearError, addAppointment } = appointmentSlice.actions;
export default appointmentSlice.reducer;
