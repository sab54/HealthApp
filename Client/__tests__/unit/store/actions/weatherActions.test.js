/**
 * src/store/actions/__tests__/weatherActions.test.js
 *
 * What This Test File Covers:
 *
 * 1. fetchWeatherData – Fetches from OpenWeather, dispatches loading -> data + last fetch -> loading false.
 * 2. fetchWeatherData (cached & fresh) – Uses cached state when an hour has NOT passed; avoids network call.
 * 3. fetchForecastData – Fetches forecast, reduces to 5 midday entries, and sets last fetch time.
 * 4. Error handling – Dispatches setWeatherError when network fails.
 */

import { fetchWeatherData, fetchForecastData } from 'src/store/actions/weatherActions';

// Force network paths (not DEV mocks)
jest.mock('src/utils/config', () => ({
  DEV_MODE: false,
  OPENWEATHER_API_KEY: 'TEST_KEY',
}));

// Make action creators real jest mocks that still return FSA-like actions
jest.mock('src/store/reducers/weatherReducer', () => ({
  setWeatherData: jest.fn((payload) => ({ type: 'SET_WEATHER_DATA', payload })),
  setForecastData: jest.fn((payload) => ({ type: 'SET_FORECAST_DATA', payload })),
  setWeatherLoading: jest.fn((payload) => ({ type: 'SET_WEATHER_LOADING', payload })),
  setWeatherError: jest.fn((payload) => ({ type: 'SET_WEATHER_ERROR', payload })),
  setLastWeatherFetch: jest.fn((payload) => ({ type: 'SET_LAST_WEATHER_FETCH', payload })),
  setLastForecastFetch: jest.fn((payload) => ({ type: 'SET_LAST_FORECAST_FETCH', payload })),
}));

// Mock user location util
const mockGetUserLocation = jest.fn();
jest.mock('src/utils/utils', () => ({
  getUserLocation: () => mockGetUserLocation(),
}));

const {
  setWeatherData,
  setForecastData,
  setWeatherLoading,
  setWeatherError,
  setLastWeatherFetch,
  setLastForecastFetch,
} = require('src/store/reducers/weatherReducer');

describe('weather actions', () => {
  let dispatch;
  let getState;

  beforeEach(() => {
    jest.clearAllMocks();
    dispatch = jest.fn((action) =>
      typeof action === 'function' ? action(dispatch, getState) : action
    );
    getState = jest.fn(() => ({
      weather: {
        lastWeatherFetch: null,
        lastForecastFetch: null,
        current: null,
        forecast: null,
      },
    }));
    mockGetUserLocation.mockResolvedValue({ latitude: 51.5, longitude: -0.12 });
  });

  it('fetchWeatherData: loading -> fetch -> data & timestamp -> loading false', async () => {
    const sample = { weather: [{ main: 'Clouds' }], main: { temp: 18 } };
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(sample),
      })
    );

    await fetchWeatherData()(dispatch, getState);

    // Loading toggled
    expect(setWeatherLoading).toHaveBeenNthCalledWith(1, true);
    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_WEATHER_LOADING', payload: true });

    // Correct URL (lat/lon, api key, units)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        'https://api.openweathermap.org/data/2.5/weather?lat=51.5&lon=-0.12&appid=TEST_KEY&units=metric'
      )
    );

    // Data & last-fetch
    expect(setWeatherData).toHaveBeenCalledWith(sample);
    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_WEATHER_DATA', payload: sample });
    expect(setLastWeatherFetch).toHaveBeenCalledTimes(1);
    const ts = setLastWeatherFetch.mock.calls[0][0];
    expect(typeof ts).toBe('string');

    // Loading false at end
    expect(setWeatherLoading).toHaveBeenLastCalledWith(false);
    expect(dispatch).toHaveBeenLastCalledWith({ type: 'SET_WEATHER_LOADING', payload: false });
  });

  it('fetchWeatherData: uses cached current when < 1 hour since last fetch', async () => {
    const cached = { weather: [{ main: 'Clear' }], main: { temp: 25 } };
    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    getState = jest.fn(() => ({
      weather: {
        lastWeatherFetch: tenMinsAgo,
        lastForecastFetch: null,
        current: cached,
        forecast: null,
      },
    }));

    global.fetch = jest.fn(); // should not be called

    await fetchWeatherData()(dispatch, getState);

    expect(global.fetch).not.toHaveBeenCalled();
    expect(setWeatherData).toHaveBeenCalledWith(cached);
    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_WEATHER_DATA', payload: cached });
    expect(setWeatherLoading).toHaveBeenCalledWith(true);
    expect(setWeatherLoading).toHaveBeenCalledWith(false);
  });

  it('fetchForecastData: fetches, reduces to 5 midday entries, sets last forecast timestamp', async () => {
    const makeItem = (idx, hour = '12:00:00') => ({
      dt_txt: `2025-08-${String(10 + idx).padStart(2, '0')} ${hour}`,
      main: { temp: 20 + idx },
    });
    const list = [
      makeItem(0, '09:00:00'),
      makeItem(0), // midday
      makeItem(1),
      makeItem(2),
      makeItem(3),
      makeItem(4),
      makeItem(5), // > 5, should slice
    ];
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ list }),
      })
    );

    await fetchForecastData()(dispatch, getState);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        'https://api.openweathermap.org/data/2.5/forecast?lat=51.5&lon=-0.12&appid=TEST_KEY&units=metric'
      )
    );

    expect(setForecastData).toHaveBeenCalledTimes(1);
    const payload = setForecastData.mock.calls[0][0];
    expect(Array.isArray(payload)).toBe(true);
    expect(payload).toHaveLength(5);
    payload.forEach((it) => expect(it.dt_txt.includes('12:00:00')).toBe(true));

    expect(setLastForecastFetch).toHaveBeenCalledTimes(1);
    expect(typeof setLastForecastFetch.mock.calls[0][0]).toBe('string');
  });

  it('fetchWeatherData: dispatches error when network fails', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('Network down')));

    await fetchWeatherData()(dispatch, getState);

    expect(setWeatherError).toHaveBeenCalledWith('Network down');
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SET_WEATHER_ERROR',
      payload: 'Network down',
    });
    expect(setWeatherLoading).toHaveBeenLastCalledWith(false);
  });
});
