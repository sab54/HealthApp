/**
 * weatherActions.js
 *
 * This file defines actions for fetching and managing weather data, including current weather and forecast data,
 * for a user's location. The actions interact with the OpenWeather API and manage state using Redux. It also checks
 * if enough time has passed since the last fetch (one hour) and uses cached data if available.
 * Additionally, the actions support a development mode (`DEV_MODE`) where mock data can be used for testing purposes.
 *
 * Features:
 * - Fetches current weather data using the OpenWeather API based on the user's location.
 * - Fetches the 5-day forecast data (midday) from the OpenWeather API.
 * - Uses cached weather data if the last fetch was recent or if in `DEV_MODE`.
 * - Stores timestamps for the last fetch to ensure data is refreshed after one hour.
 * - Handles loading and error states for fetching data.
 *
 * This file uses the following libraries:
 * - Redux for managing weather-related state (loading, error, data).
 * - `fetch` for making HTTP requests to the OpenWeather API.
 * - Utility functions like `getUserLocation` to retrieve the user's current location.
 * - A mock data option in `DEV_MODE` for testing purposes.
 *
 * Dependencies:
 * - @reduxjs/toolkit
 * - react-native
 *
 * Author: Sunidhi Abhange
 */

import { DEV_MODE, OPENWEATHER_API_KEY } from '../../utils/config';
import {
    setWeatherData,
    setForecastData,
    setWeatherLoading,
    setWeatherError,
    setLastWeatherFetch,
    setLastForecastFetch,
} from '../reducers/weatherReducer';
// import { mockWeatherData, mockForecastData } from '../../data/mockData';
import { getUserLocation } from '../../utils/utils';

// Helper to check if an hour has passed since the last fetch
const isOneHourPassed = (lastFetch) => {
    if (!lastFetch) return true;

    const lastTime = new Date(lastFetch);
    const now = new Date();
    const diffInMs = now - lastTime;
    return diffInMs > 3600000;
};

export const fetchWeatherData = () => async (dispatch, getState) => {
    try {
        dispatch(setWeatherLoading(true));
        dispatch(setWeatherError(null));

        const state = getState();
        const lastFetch = state.weather.lastWeatherFetch;

        // If DEV_MODE is true, use mock data
        if (DEV_MODE) {
            dispatch(setWeatherData(mockWeatherData));
            dispatch(setWeatherLoading(false));
            return;
        }

        const shouldFetch = isOneHourPassed(lastFetch);

        if (!shouldFetch) {
            const cached = state.weather.current;
            if (cached) {
                dispatch(setWeatherData(cached));
                dispatch(setWeatherLoading(false));
                return;
            }
        }

        const { latitude, longitude } = await getUserLocation();
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`
        );
        const data = await res.json();

        dispatch(setWeatherData(data));
        dispatch(setLastWeatherFetch(new Date().toISOString())); // Store last fetch timestamp
    } catch (err) {
        dispatch(setWeatherError(err.message));
    } finally {
        dispatch(setWeatherLoading(false));
    }
};

export const fetchForecastData = () => async (dispatch, getState) => {
    try {
        const state = getState();
        const lastFetch = state.weather.lastForecastFetch;

        // If DEV_MODE is true, use mock data
        if (DEV_MODE) {
            const daily = mockForecastData.list
                .filter((item) => item.dt_txt.includes('12:00:00'))
                .slice(0, 5);
            dispatch(setForecastData(daily));
            return;
        }

        const shouldFetch = isOneHourPassed(lastFetch);

        if (!shouldFetch) {
            const cached = state.weather.forecast;
            if (cached) {
                dispatch(setForecastData(cached));
                return;
            }
        }

        const { latitude, longitude } = await getUserLocation();
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`
        );
        const data = await res.json();

        const daily = data.list
            .filter((item) => item.dt_txt.includes('12:00:00'))
            .slice(0, 5);

        dispatch(setForecastData(daily));
        dispatch(setLastForecastFetch(new Date().toISOString())); // Store last fetch timestamp
    } catch (err) {
        dispatch(setWeatherError(err.message));
    }
};
