// Client/__tests__/unit/module/WeatherCard.test.js

/**
 * WeatherCard.test.js
 *
 * Covers:
 * 1) Basic Rendering (no data)
 * 2) Weather Details & Unit Toggle
 * 3) Forecast Toggle with loading spinner
 * 4) Weather Alert
 */

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';

// Provide MaterialCommunityIcons in this suite (Ionicons/Feather are already stubbed globally)
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const wrap = (prefix) => ({ name, ...rest }) =>
    <Text accessibilityRole="button" {...rest}>{`${prefix}:${name}`}</Text>;
  return {
    Ionicons: wrap('ion'),
    Feather: wrap('feather'),
    MaterialCommunityIcons: wrap('mci'),
  };
});

jest.useFakeTimers();

import WeatherCard from '../../../src/module/WeatherCard';

// Minimal theme used by the component
const theme = {
  surface: '#fff',
  border: '#ddd',
  shadow: '#000',
  title: '#111',
  icon: '#222',
  text: '#333',
  mutedText: '#777',
  link: '#0a84ff',
  card: '#f7f7f7',
  warningBackground: '#fff5e6',
  warning: '#f59e0b',
  successBackground: '#e6f7ee',
};

const makeWeather = (overrides = {}) => ({
  name: 'London',
  main: { temp: 20, feels_like: 21, humidity: 60 },
  wind: { speed: 3.5 },
  weather: [{ main: 'Clear', description: 'clear sky' }],
  ...overrides,
});

const makeForecast = (n = 5) =>
  Array.from({ length: n }).map((_, i) => ({
    dt: Math.floor(Date.now() / 1000) + i * 86400,
    main: { temp: 18 + i },
    weather: [{ main: i % 2 === 0 ? 'Clouds' : 'Clear' }],
  }));

describe('WeatherCard', () => {
  it('renders title and fallback message when no data and not loading', () => {
    const { getByText } = render(
      <WeatherCard theme={theme} loadingWeather={false} />
    );

    expect(getByText('🌤️ Weather Overview')).toBeTruthy();
    expect(getByText('No weather data available.')).toBeTruthy();
  });

  it('shows weather details and toggles units from °C to °F', () => {
    const weatherData = makeWeather();
    const { getByText, queryByText } = render(
      <WeatherCard
        theme={theme}
        weatherData={weatherData}
        forecastData={[]}
        loadingWeather={false}
      />
    );

    // Default °C
    expect(getByText(/City: London/)).toBeTruthy();
    expect(getByText(/Temp: 20\.0°C/)).toBeTruthy();
    expect(getByText(/Feels Like: 21\.0°C/)).toBeTruthy();

    // Toggle to °F
    fireEvent.press(getByText('Switch to °F'));
    expect(queryByText(/Temp: 68\.0°F/)).toBeTruthy();      // 20C -> 68.0°F
    expect(queryByText(/Feels Like: 69\.8°F/)).toBeTruthy(); // 21C -> 69.8°F
  });

  it('expands to show forecast after loading spinner completes', () => {
    const weatherData = makeWeather();
    const forecastData = makeForecast(5);

    const { getByText, queryByText, queryAllByText } = render(
      <WeatherCard
        theme={theme}
        weatherData={weatherData}
        forecastData={forecastData}
        loadingWeather={false}
      />
    );

    // Tap header to toggle forecast (starts loading state)
    fireEvent.press(getByText('🌤️ Weather Overview'));

    // While loading, the "5-Day Forecast" title should not be there yet
    expect(queryByText('5-Day Forecast')).toBeNull();

    // Advance timers to finish the simulated 1500ms loading
    act(() => {
      jest.advanceTimersByTime(1600);
    });

    // Now the forecast should render
    expect(getByText('5-Day Forecast')).toBeTruthy();

    // At least one temp like "18.0°C"
    const anyTemp = queryAllByText(/\d+\.\d°C/);
    expect(anyTemp.length).toBeGreaterThan(0);
  });

  it('renders an alert box when weatherData.alerts is present', () => {
    const weatherData = makeWeather({
      alerts: [{ event: 'High Wind Warning' }],
    });

    const { getByText } = render(
      <WeatherCard
        theme={theme}
        weatherData={weatherData}
        forecastData={[]}
        loadingWeather={false}
      />
    );

    expect(getByText(/High Wind Warning/)).toBeTruthy();
  });
});
