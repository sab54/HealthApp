// Client/src/actions/appointmentActions.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL_APPOINTMENT } from '../../utils/apiPaths';
import { get, post, patch } from '../../utils/api';


export const bookAppointment = createAsyncThunk(
  'appointment/bookAppointment',
  async ({ date, time, reason, createdBy, chatId, userId, senderId }, { rejectWithValue }) => {
    try {
      const response = await post(`${API_URL_APPOINTMENT}/ai-book`, {
        date,
        time,
        reason,
        createdBy,
        chatId,
        userId,
        senderId,
      });

      // Normalize to flat array
      const data = response.appointments || response.appointment || [];
      return Array.isArray(data) ? data : [data];
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to book appointment');
    }
  }
);

export const fetchAppointments = createAsyncThunk(
  'appointment/fetchAppointments',
  async (userId, { rejectWithValue }) => {
    try {
      const data = await get(`${API_URL_APPOINTMENT}/${userId}`);
      return data.appointments || [];
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch appointments');
    }
  }
);

