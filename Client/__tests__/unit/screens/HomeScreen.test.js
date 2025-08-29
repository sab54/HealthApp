/**
 * HomeScreen.test.js
 *
 * What This Test File Covers:
 *
 * 1) Basic Rendering (fonts loaded)
 *    - Renders DailyWellnessCard and Footer inside the FlatList.
 *
 * 2) Loading State (fonts not loaded)
 *    - Shows ActivityIndicator + "Loading fonts..." while fonts are loading.
 *
 * 3) Fetch Today Mood
 *    - Reads userId from AsyncStorage and dispatches fetchTodayMood(userId).
 *
 * 4) Passes healthlog props to DailyWellnessCard
 *    - Verifies the stub receives mood/sleep/energy/symptoms from the store.
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { fireEvent } from '@testing-library/react-native';
import { Alert, Text } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

// Under test
import HomeScreen from '@/screens/HomeScreen';

// Mocks ----------------------------------------------------------------------

jest.mock('expo-font', () => ({
  // We’ll override this per test to [true] or [false]
  useFonts: jest.fn(() => [true]),
}));

// AsyncStorage (setup already provides a mock; we spy for control)
import AsyncStorage from '@react-native-async-storage/async-storage';

// Navigation
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return { ...actual, useNavigation: () => ({ navigate: jest.fn() }) };
});

// Actions: we only need fetchTodayMood to be a simple action creator
jest.mock('@/store/actions/healthlogActions', () => ({
  fetchTodayMood: jest.fn((userId) => ({ type: 'FETCH_TODAY_MOOD', meta: { userId } })),
}));

// Modules used by HomeScreen — keep them minimal & assertable
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

// Bring in the mocked bits we need to assert against
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
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    // Default: fonts loaded
    useFonts.mockReturnValue([true]);
    // Default selector
    useSelector.mockImplementation((sel) => sel(makeState()));
    // AsyncStorage spies
    jest.spyOn(AsyncStorage, 'getItem');
    jest.spyOn(AsyncStorage, 'setItem');
  });

  it('renders DailyWellnessCard and Footer when fonts are loaded', async () => {
    const { getByTestId, getByText } = render(<HomeScreen />);

    // DailyWellnessCard from stub
    expect(getByTestId('daily-wellness')).toBeTruthy();
    expect(getByText('mood:Feeling great!')).toBeTruthy();

    // Footer from stub
    expect(getByTestId('footer')).toBeTruthy();
  });

  it('shows loading state while fonts are not loaded', async () => {
    // Force fonts to be not loaded for this test
    useFonts.mockReturnValueOnce([false]);

    const { getByText } = render(<HomeScreen />);
    expect(getByText('Loading fonts...')).toBeTruthy();
  });

  it('reads userId from AsyncStorage and dispatches fetchTodayMood(userId)', async () => {
    // Arrange AsyncStorage to return a user id
    AsyncStorage.getItem.mockImplementation(async (key) => {
      if (key === 'userId') return 'user-1';
      if (key === 'userRole') return 'member';
      if (key === 'isApproved') return '1';
      return null;
    });

    const dispatch = useDispatch();
    dispatch.unwrap.mockResolvedValue({}); // allow any unwrap safely

    render(<HomeScreen />);

    // The first awaited thing is the role/approval read; then health fetch effect
    await waitFor(() => {
      // We expect one of the dispatch calls to be our fetchTodayMood action
      expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'FETCH_TODAY_MOOD',
          meta: { userId: 'user-1' },
        })
      );
    });

    // Also verify our action creator was invoked with userId
    expect(fetchTodayMood).toHaveBeenCalledWith('user-1');
  });

  it('passes healthlog values to DailyWellnessCard', async () => {
    // Override store values
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

    expect(getByText('mood:Not feeling good!')).toBeTruthy();
    expect(getByText('sleep:6')).toBeTruthy();
    expect(getByText('energy:4')).toBeTruthy();
    expect(getByText('symptoms:1')).toBeTruthy();
  });
});
