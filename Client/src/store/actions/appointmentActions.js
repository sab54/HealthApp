// Client/src/store/actions/appointmentActions.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL_APPOINTMENT } from '../../utils/apiPaths';
import { post } from '../../utils/api';

export const bookAppointment = createAsyncThunk(
  'appointment/bookAppointment',
  async ({ date, time, reason, createdBy, chatId }, { rejectWithValue }) => {
    try {
      const response = await post(`${API_URL_APPOINTMENT}/ai-book`, {
        date,
        time,
        reason,
        createdBy,
        chatId,
      });
      return response; // will land in action.payload
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to book appointment');
    }
  }
);
