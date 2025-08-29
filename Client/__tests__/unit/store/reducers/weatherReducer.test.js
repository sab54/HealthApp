/**
 * weatherReducer.test.js
 *
 * What This Test File Covers:
 *
 * 1. Initial State
 *    - Reducer returns correct defaults.
 *
 * 2. Data Setters
 *    - setWeatherData updates current.
 *    - setForecastData updates forecast array.
 *
 * 3. Status Flags
 *    - setWeatherLoading toggles loading.
 *    - setWeatherError sets error message.
 *
 * 4. Timestamps
 *    - setLastWeatherFetch and setLastForecastFetch store provided values.
 */

import reducer, {
  setWeatherData,
  setForecastData,
  setWeatherLoading,
  setWeatherError,
  setLastWeatherFetch,
  setLastForecastFetch,
} from '@/store/reducers/weatherReducer';

describe('weatherReducer', () => {
  const initial = {
    current: null,
    forecast: [],
    loading: false,
    error: null,
    lastWeatherFetch: null,
    lastForecastFetch: null,
  };

  it('returns initial state by default', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial);
  });

  it('sets current and forecast data', () => {
    const current = { temp: 21, condition: 'Cloudy' };
    const forecast = [
      { day: 'Mon', temp: 20 },
      { day: 'Tue', temp: 22 },
    ];

    let state = reducer(initial, setWeatherData(current));
    expect(state.current).toEqual(current);

    state = reducer(state, setForecastData(forecast));
    expect(state.forecast).toEqual(forecast);
  });

  it('updates loading and error flags', () => {
    let state = reducer(initial, setWeatherLoading(true));
    expect(state.loading).toBe(true);

    state = reducer(state, setWeatherError('Network error'));
    expect(state.error).toBe('Network error');

    state = reducer(state, setWeatherLoading(false));
    expect(state.loading).toBe(false);
  });

  it('stores last fetch timestamps', () => {
    const wTime = '2025-08-28T10:00:00Z';
    const fTime = '2025-08-28T12:00:00Z';

    let state = reducer(initial, setLastWeatherFetch(wTime));
    expect(state.lastWeatherFetch).toBe(wTime);

    state = reducer(state, setLastForecastFetch(fTime));
    expect(state.lastForecastFetch).toBe(fTime);
  });
});
