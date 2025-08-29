/**
 * HealthTrackingScreen.test.js
 *
 * What This Test File Covers:
 *
 * 1) Basic Rendering (with data)
 *    - Shows header, charts (BarChart + 2x LineChart via stubs), and legend labels.
 *
 * 2) Days Filter Refetch
 *    - Tapping "3 Days" then "15 Days" triggers API refetches with correct params.
 *
 * 3) Missing User ID
 *    - Renders "User ID is missing" error state when route.params.userId is absent.
 *
 * 4) API Failure Path
 *    - When API returns { success: false }, renders "Failed to load trends".
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HealthTrackingScreen from '@/screens/HealthTrackingScreen';
import { useSelector } from 'react-redux';

jest.mock('@/utils/api', () => ({
  get: jest.fn(),
}));
jest.mock('@/utils/apiPaths', () => ({
  API_URL_HEALTHLOG: 'https://mock.health',
}));

const { get } = require('@/utils/api');

describe('HealthTrackingScreen', () => {
  const theme = {
    background: '#fff',
    text: '#111',
    title: '#000',
    mutedText: '#666',
    primary: '#0a84ff',
    error: '#ff3b30',
    success: '#34c759',
    surface: '#f2f2f7',
    card: '#ffffff',
    shadow: '#00000033',
  };

  const makeState = () => ({
    theme: { themeColors: theme },
  });

  const trendsPayload = {
    success: true,
    trends: [
      { date: '2024-02-01', mood: 'Feeling great!', energy: 8, sleep: 7.5 },
      { date: '2024-02-02', mood: 'Not feeling good!', energy: 5, sleep: 6 },
      { date: '2024-02-03', mood: 'Feeling great!', energy: 9, sleep: 8 },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useSelector.mockImplementation((sel) => sel(makeState()));
  });

it('renders header, charts, and legends with data', async () => {
  get.mockResolvedValueOnce(trendsPayload);

  const route = { params: { userId: 'user-1' } };
  const { getByText, UNSAFE_queryAllByProps } = render(<HealthTrackingScreen route={route} />);

  await waitFor(() =>
    expect(get).toHaveBeenCalledWith('https://mock.health/trends/user-1', { days: 15 })
  );

  expect(getByText('My Tracking')).toBeTruthy();

  // Chart-kit stubs render <View accessibilityLabel="BarChart" | "LineChart" />
  expect(UNSAFE_queryAllByProps({ accessibilityLabel: 'BarChart' }).length).toBeGreaterThan(0);
  expect(UNSAFE_queryAllByProps({ accessibilityLabel: 'LineChart' }).length).toBeGreaterThanOrEqual(2);

  expect(getByText('Feeling Great')).toBeTruthy();
  expect(getByText('Not Good')).toBeTruthy();
  expect(getByText('7–8 hrs (Healthy)')).toBeTruthy();
  expect(getByText('Unhealthy')).toBeTruthy();
});



  it('refetches when changing days filter: 3 Days then 15 Days', async () => {
    // First call (days=15)
    get.mockResolvedValueOnce(trendsPayload);
    // Second call (days=3)
    get.mockResolvedValueOnce(trendsPayload);
    // Third call (days=15 again)
    get.mockResolvedValueOnce(trendsPayload);

    const route = { params: { userId: 'user-1' } };
    const { getByText } = render(<HealthTrackingScreen route={route} />);

    await waitFor(() =>
      expect(get).toHaveBeenCalledWith('https://mock.health/trends/user-1', { days: 15 })
    );
    expect(get).toHaveBeenCalledTimes(1);

    // Tap "3 Days" -> refetch with days=3
    fireEvent.press(getByText('3 Days'));
    await waitFor(() =>
      expect(get).toHaveBeenCalledWith('https://mock.health/trends/user-1', { days: 3 })
    );
    expect(get).toHaveBeenCalledTimes(2);

    // Tap "15 Days" -> refetch with days=15
    fireEvent.press(getByText('15 Days'));
    await waitFor(() =>
      expect(get).toHaveBeenCalledWith('https://mock.health/trends/user-1', { days: 15 })
    );
    expect(get).toHaveBeenCalledTimes(3);
  });

  it('shows error state if userId is missing', async () => {
    const route = { params: {} }; // no userId
    const { findByText } = render(<HealthTrackingScreen route={route} />);

    // Should render the explicit error message from component
    expect(await findByText('User ID is missing')).toBeTruthy();

    // Should not call API when userId is missing
    expect(get).not.toHaveBeenCalled();
  });

  it('shows API failure message when success is false', async () => {
    get.mockResolvedValueOnce({ success: false });

    const route = { params: { userId: 'user-1' } };
    const { findByText } = render(<HealthTrackingScreen route={route} />);

    // Displays component's failure message
    expect(await findByText('Failed to load trends')).toBeTruthy();
  });
});
