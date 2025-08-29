/**
 * ResourcesScreen.test.js
 *
 * Covers:
 * 1) Loading State (fonts not loaded)
 * 2) Basic Rendering (fonts loaded)
 * 3) Prop Pass-through to WeatherCard
 * 4) Pull-to-Refresh
 */

import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { fireEvent } from '@testing-library/react-native';
import { ActivityIndicator, RefreshControl } from 'react-native';
import { useSelector } from 'react-redux';
import ResourcesScreen from '@/screens/ResourcesScreen';

// Mock expo-font so we can control fontsLoaded
jest.mock('expo-font', () => ({
  useFonts: jest.fn(() => [true]),
}));

// Stub child modules to simple components that expose props for assertion
jest.mock('@/module/WeatherCard', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return ({ weatherData, forecastData, loadingWeather, theme }) => (
    <View testID="weather-card">
      <Text>{`w:${weatherData?.temp ?? 'NA'}`}</Text>
      <Text>{`f:${forecastData?.length ?? 0}`}</Text>
      <Text>{`l:${loadingWeather ? '1' : '0'}`}</Text>
      <Text>{`t:${theme?.title ?? ''}`}</Text>
    </View>
  );
});
jest.mock('@/module/EmergencyShortcuts', () => {
  const React = require('react');
  const { View } = require('react-native');
  return ({ theme }) => <View testID="emergency-shortcuts" />;
});
jest.mock('@/components/Footer', () => {
  const React = require('react');
  const { View } = require('react-native');
  return ({ theme }) => <View testID="footer" />;
});

import { useFonts } from 'expo-font';

describe('ResourcesScreen', () => {
  const theme = {
    background: '#fff',
    text: '#111',
    title: '#000',
    info: '#0a84ff',
    primary: '#0a84ff',
  };

  const makeState = (overrides = {}) => ({
    theme: { themeColors: theme },
    weather: {
      current: { temp: 21 },
      forecast: [{ d: 1 }, { d: 2 }],
      loading: false,
      ...overrides.weather,
    },
  });

  beforeEach(() => {
    jest.clearAllMocks();
    useSelector.mockImplementation((sel) => sel(makeState()));
  });

  it('shows loading UI when fonts are not loaded', () => {
    useFonts.mockReturnValueOnce([false]); // force loading

    const { getByText, UNSAFE_queryAllByType } = render(<ResourcesScreen />);
    expect(getByText('Loading fonts...')).toBeTruthy();
    expect(UNSAFE_queryAllByType(ActivityIndicator).length).toBeGreaterThan(0);
  });

  it('renders title, WeatherCard, EmergencyShortcuts, and Footer when fonts loaded', async () => {
    const { getByText, getByTestId } = render(<ResourcesScreen />);

    // Title (ignore emoji, match readable part)
    expect(getByText(/Emergency Resources/i)).toBeTruthy();

    expect(getByTestId('weather-card')).toBeTruthy();
    expect(getByTestId('emergency-shortcuts')).toBeTruthy();
    expect(getByTestId('footer')).toBeTruthy();
  });

  it('passes weather props from store down to WeatherCard', () => {
    const state = makeState({
      weather: { current: { temp: 18 }, forecast: [{}, {}, {}], loading: true },
    });
    // Override ALL selector calls for this test (not just once)
    useSelector.mockImplementation((sel) => sel(state));

    const { getByTestId, getByText } = render(<ResourcesScreen />);

    const card = getByTestId('weather-card');
    expect(card).toBeTruthy();
    // Stub prints w:, f:, l:, t: for quick verification
    expect(getByText('w:18')).toBeTruthy();
    expect(getByText('f:3')).toBeTruthy();
    expect(getByText('l:1')).toBeTruthy();
    expect(getByText(`t:${theme.title}`)).toBeTruthy();
  });

  it('triggers pull-to-refresh and resets after timeout', async () => {
    jest.useFakeTimers();

    const { UNSAFE_queryAllByType } = render(<ResourcesScreen />);

    // Initial RefreshControl
    expect(UNSAFE_queryAllByType(RefreshControl)[0].props.refreshing).toBe(false);

    // Invoke onRefresh inside act to avoid warnings and ensure state flushes
    await act(async () => {
      UNSAFE_queryAllByType(RefreshControl)[0].props.onRefresh();
    });

    // Wait for refreshing=true
    await waitFor(() => {
      expect(UNSAFE_queryAllByType(RefreshControl)[0].props.refreshing).toBe(true);
    });

    // Advance timers for the internal setTimeout(1000)
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Wait for refreshing=false after timeout
    await waitFor(() => {
      expect(UNSAFE_queryAllByType(RefreshControl)[0].props.refreshing).toBe(false);
    });

    jest.useRealTimers();
  });
});
