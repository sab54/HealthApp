// Client/src/actions/appointmentActions.js
/**
 * appointmentActions.js
 *
 * This file contains actions related to appointments, using Redux Toolkit's `createAsyncThunk` for async actions.
 *
 * Key Features:
 * - `bookAppointment`: This action handles the booking of appointments via an AI system. It takes the appointment's details (e.g., date, time, reason, user IDs) and sends a request to the server. Upon success, it normalizes the response into a flat array and returns it. If an error occurs, it rejects with an error message.
 *
 * - `fetchAppointments`: This action fetches all appointments for a user from the backend. It sends a request with the user's ID and returns the list of appointments. If the request fails, it rejects with an error message.
 *
 * Dependencies:
 * - `@reduxjs/toolkit`: For Redux Toolkit's `createAsyncThunk`.
 * - `utils/api`: For making GET, POST, and PATCH requests to the backend.
 * - `utils/apiPaths`: For the API path constants used in requests.
 *
 * Author: [Your Name]
 */

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
  async ({ userId, chatId }, { rejectWithValue }) => {
    try {
      let url;

      if (chatId) {
        // Chat-specific (for ChatRoomScreen)
        url = `${API_URL_APPOINTMENT}/${userId}/${chatId}`;
      } else {
        // User-wide (for HomeScreen)
        url = `${API_URL_APPOINTMENT}/${userId}`;
      }

      const data = await get(url);
      return data.appointments || [];
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch appointments');
    }
  }
);


