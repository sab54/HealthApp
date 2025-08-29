// Client/src/reducers/appointmentReducer.js
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
