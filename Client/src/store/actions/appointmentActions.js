import { createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL_APPOINTMENT } from '../../utils/apiPaths';
import { get, post } from '../../utils/api';


export const bookAppointmentAI = createAsyncThunk(
    'appointment/bookAppointmentAI',
    async ({ date, time, reason, createdBy, chatId }, { rejectWithValue }) => {
        try {
            const response = await post(`${API_URL_APPOINTMENT}/ai-book`, {
                date,
                time,
                reason,
                createdBy,
                chatId,
            });

            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to book appointment');
        }
    }
);
