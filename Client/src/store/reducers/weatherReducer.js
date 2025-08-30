/**
 * weatherReducer.js
 *
 * This file defines the Redux slice for managing the weather-related state in the application. It includes actions
 * for setting the current weather data, forecast data, loading state, and error handling. The slice also manages
 * the timestamps of the last weather data fetch and forecast data fetch to ensure data is updated at appropriate intervals.
 *
 * Features:
 * - Manages state for current weather data and weather forecast data.
 * - Tracks loading and error states for fetching weather data.
 * - Stores timestamps for the last weather data and forecast data fetches.
 * - Supports actions for updating weather data, handling loading, and managing error states.
 *
 * This file uses the following libraries:
 * - Redux Toolkit for managing weather-related state and actions.
 *
 * Dependencies:
 * - @reduxjs/toolkit
 *
 * Author: Sunidhi Abhange
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    current: null,
    forecast: [],
    loading: false,
    error: null,
    lastWeatherFetch: null,
    lastForecastFetch: null,
};

const weatherSlice = createSlice({
    name: 'weather',
    initialState,
    reducers: {
        setWeatherData: (state, action) => {
            state.current = action.payload;
        },
        setForecastData: (state, action) => {
            state.forecast = action.payload;
        },
        setWeatherLoading: (state, action) => {
            state.loading = action.payload;
        },
        setWeatherError: (state, action) => {
            state.error = action.payload;
        },
        setLastWeatherFetch: (state, action) => {
            state.lastWeatherFetch = action.payload;
        },
        setLastForecastFetch: (state, action) => {
            state.lastForecastFetch = action.payload;
        },
    },
});

export const {
    setWeatherData,
    setForecastData,
    setWeatherLoading,
    setWeatherError,
    setLastWeatherFetch,
    setLastForecastFetch,
} = weatherSlice.actions;

export default weatherSlice.reducer;
