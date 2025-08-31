/**
 * HomeScreen.test.js
 *
 * What This Test File Covers:
 *
 * 1) Basic Rendering (fonts loaded)
 * 2) Loading State (fonts not loaded)
 * 3) Fetch Today Mood (reads userId and dispatches)
 * 4) Passes healthlog props to DailyWellnessCard
 */

import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

// Under test
import HomeScreen from '@/screens/HomeScreen';

// ---------------------------- Mocks -----------------------------------------

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

jest.mock('expo-font', () => ({
  useFonts: jest.fn(() => [true]),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return { ...actual, useNavigation: () => ({ navigate: jest.fn() }) };
});

jest.mock('@/store/actions/healthlogActions', () => ({
  fetchTodayMood: jest.fn((userId) => ({ type: 'FETCH_TODAY_MOOD', meta: { userId } })),
}));

jest.mock('@/module/DailyWellnessCard', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return ({ moodToday, sleepToday, energyToday, todaySymptoms }) => (
    <View testID="daily-wellness">
      <Text>{`mood:${moodToday ?? ''}`}</Text>
      <Text>{`sleep:${sleepToday ?? ''}`}</Text>
      <Text>{`energy:${energyToday ?? ''}`}</Text>
      <Text>{`symptoms:${(todaySymptoms ?? []).length}`}</Text>
    </View>
  );
});

jest.mock('@/components/Footer', () => {
  const React = require('react');
  const { View } = require('react-native');
  return ({ theme }) => <View testID="footer" />;
});

import { useFonts } from 'expo-font';
import { fetchTodayMood } from '@/store/actions/healthlogActions';

describe('HomeScreen', () => {
  const theme = {
    background: '#fff',
    text: '#111',
    title: '#000',
    primary: '#0a84ff',
  };

  const baseHealthlog = {
    moodToday: 'Feeling great!',
    sleepToday: 7.5,
    energyToday: 8,
    todaySymptoms: [{ symptom: 'Headache' }, { symptom: 'Cough' }],
  };

  const makeState = (overrides = {}) => ({
    theme: { themeColors: theme },
    healthlog: { ...baseHealthlog, ...overrides },
    appointment: {
      appointments: [],
      loading: false,
    },
  });

  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    useFonts.mockReturnValue([true]);
    useSelector.mockImplementation((sel) => sel(makeState()));
    useDispatch.mockReturnValue(mockDispatch);

    jest.spyOn(AsyncStorage, 'getItem');
    jest.spyOn(AsyncStorage, 'setItem');
  });

  it('renders DailyWellnessCard and Footer when fonts are loaded', async () => {
    const utils = render(<HomeScreen />);

    // Wait for the mount effect to finish its async updates (avoids act warnings)
    await waitFor(() => expect(AsyncStorage.getItem).toHaveBeenCalled());

    const { getByTestId, getByText } = utils;
    expect(getByTestId('daily-wellness')).toBeTruthy();
    expect(getByText('mood:Feeling great!')).toBeTruthy();
    expect(getByTestId('footer')).toBeTruthy();
  });

  it('renders screen even when fonts are not loaded (no crash)', async () => {
    // Force fonts to be not loaded for this test
    useFonts.mockReturnValueOnce([false]);

    const { getByTestId, getByText } = render(<HomeScreen />);

    // Let the mount effect resolve to avoid act warnings
    await waitFor(() => expect(AsyncStorage.getItem).toHaveBeenCalled());

    // Assert the UI still renders (component tolerates fonts not loaded)
    expect(getByTestId('daily-wellness')).toBeTruthy();
    expect(getByText('mood:Feeling great!')).toBeTruthy();
    expect(getByTestId('footer')).toBeTruthy();

    // Do NOT expect "Loading fonts..." because the component doesn't show it
  });


  it('reads userId from AsyncStorage and dispatches fetchTodayMood(userId)', async () => {
    AsyncStorage.getItem.mockImplementation(async (key) => {
      if (key === 'userId') return 'user-1';
      if (key === 'userRole') return 'member';
      if (key === 'isApproved') return '1';
      return null;
    });

    render(<HomeScreen />);

    // Ensure the effect completes before asserting (silences act warnings)
    await waitFor(() => expect(AsyncStorage.getItem).toHaveBeenCalled());

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'FETCH_TODAY_MOOD',
          meta: { userId: 'user-1' },
        })
      );
    });

    expect(fetchTodayMood).toHaveBeenCalledWith('user-1');
  });

  it('passes healthlog values to DailyWellnessCard', async () => {
    useSelector.mockImplementation((sel) =>
      sel(
        makeState({
          moodToday: 'Not feeling good!',
          sleepToday: 6,
          energyToday: 4,
          todaySymptoms: [{ symptom: 'Nausea' }],
        })
      )
    );

    const { getByText } = render(<HomeScreen />);

    // Let the initial async effect finish to avoid act warnings
    await waitFor(() => expect(AsyncStorage.getItem).toHaveBeenCalled());

    expect(getByText('mood:Not feeling good!')).toBeTruthy();
    expect(getByText('sleep:6')).toBeTruthy();
    expect(getByText('energy:4')).toBeTruthy();
    expect(getByText('symptoms:1')).toBeTruthy();
  });
});
