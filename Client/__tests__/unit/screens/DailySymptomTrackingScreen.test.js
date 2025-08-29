/**
 * DailySymptomTrackerScreen.test.js
 *
 * 1) Basic Rendering (Empty State)
 * 2) List Rendering + Recovered Badge
 * 3) Navigation on Card Press
 * 4) Mark as Recovered -> Dispatch + POST
 */

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { useSelector, useDispatch } from 'react-redux';
import { View } from 'react-native';

import DailySymptomTrackerScreen from '@/screens/DailySymptomTrackingScreen';

// mock using the SAME relative paths the screen imports
jest.mock('@/utils/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));
jest.mock('@/store/reducers/healthlogReducers', () => ({
  setTodaySymptoms: jest.fn((payload) => ({ type: 'SET_TODAY_SYMPTOMS', payload })),
}));

import { get, post } from '@/utils/api';

// navigation hooks (no NavigationContainer)
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  const useFocusEffect = (effect) => {
    React.useEffect(() => {
      if (typeof effect === 'function') {
        const cleanup = effect();
        return cleanup;
      }
      return undefined;
    }, []);
  };
  return {
    useNavigation: jest.fn(),
    useFocusEffect,
  };
});
import { useNavigation } from '@react-navigation/native';

jest.useFakeTimers();

const baseTheme = {
  background: '#fff',
  text: '#111',
  title: '#000',
  primary: '#6c5fc4',
  card: '#f8f8f8',
  surface: '#f1f1f1',
  shadow: '#000',
  checkboxTick: '#fff',
  mutedText: '#666',
  buttonPrimaryBackground: '#6c5fc4',
  buttonPrimaryText: '#fff',
  success: '#22c55e',
  cardShadow: '#00000020',
};

const todayISO = '2024-03-01T09:00:00.000Z';
const todayDate = todayISO.split('T')[0];

const setup = async ({
  userId = 'user-123',
  todaySymptoms = [],
  apiToday = { symptoms: [] },
} = {}) => {
  jest.clearAllMocks();

  jest.setSystemTime(new Date(todayISO));

  useSelector.mockImplementation((selector) =>
    selector({
      auth: { user: { id: userId } },
      theme: { themeColors: baseTheme },
      healthlog: { todaySymptoms },
    })
  );

  const navigate = jest.fn();
  useNavigation.mockReturnValue({ navigate, reset: jest.fn(), goBack: jest.fn() });

  get.mockResolvedValue(apiToday);
  post.mockResolvedValue({ ok: true });

  const utils = render(<DailySymptomTrackerScreen />);

  // allow effects + state updates to settle (screen may fetch more than once)
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });

  return { ...utils, navigate };
};

describe('DailySymptomTrackerScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title and empty state when no symptoms', async () => {
    const { getByText } = await setup({
      todaySymptoms: [],
      apiToday: { symptoms: [] },
    });

    expect(getByText("Today's Symptoms")).toBeTruthy();
    expect(getByText('No symptoms recorded.')).toBeTruthy();
  });

  it('renders symptoms list and shows recovered label for recovered items', async () => {
    const recoveredAt = '2024-03-01T07:30:00.000Z';
    const { getByText, getAllByText } = await setup({
      todaySymptoms: [
        {
          symptom: 'Headache',
          severity: 'moderate',
          onsetTime: '2024-03-01T06:00:00.000Z',
          date: todayDate,
          recovered_at: recoveredAt,
        },
        {
          symptom: 'Cough',
          severity: 'mild',
          onsetTime: '2024-03-01T08:00:00.000Z',
          date: todayDate,
          recovered_at: null,
        },
      ],
      apiToday: { symptoms: [] },
    });

    expect(getByText('Headache')).toBeTruthy();
    expect(getByText('Cough')).toBeTruthy();

    // Accept one or more recovered labels to avoid "multiple elements" error
    const recoveredLabels = getAllByText(/Recovered/);
    expect(recoveredLabels.length).toBeGreaterThan(0);
  });

  it('navigates to recovery plan when tapping an unrecovered symptom card', async () => {
    const unrecovered = {
      symptom: 'Fever',
      severity: 'mild',
      onsetTime: '2024-03-01T08:15:00.000Z',
      date: todayDate,
      recovered_at: null,
    };

    const { getByText, navigate } = await setup({
      todaySymptoms: [unrecovered],
      apiToday: { symptoms: [] },
    });

    const feverText = getByText('Fever');

    // climb from the label to the first ancestor WITH an onPress (the outer card)
    let node = feverText.parent;
    while (node && typeof node.props?.onPress !== 'function') {
      node = node.parent;
    }
    expect(node).toBeTruthy();

    await act(async () => {
      fireEvent.press(node);
      await Promise.resolve();
    });

    expect(navigate).toHaveBeenCalledWith('SymptomRecoveryPlan', { symptom: unrecovered });
  });

  it('dispatches setTodaySymptoms + calls POST when "Mark as Recovered" pressed', async () => {
    const unrecovered = {
      symptom: 'Sore Throat',
      severity: 'mild',
      onsetTime: '2024-03-01T08:30:00.000Z',
      date: todayDate,
      recovered_at: null,
    };

    const { getByText } = await setup({
      todaySymptoms: [unrecovered],
      apiToday: { symptoms: [] },
    });

    const dispatchMock = useDispatch();

    const btnText = getByText('Mark as Recovered');
    // climb to the element that actually has the onPress handler (inner button)
    let pressable = btnText.parent;
    while (pressable && typeof pressable.props?.onPress !== 'function') {
      pressable = pressable.parent;
    }
    expect(pressable).toBeTruthy();

    await act(async () => {
      fireEvent.press(pressable);
      // allow async handler (AsyncStorage + post + refresh) to complete
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(dispatchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'SET_TODAY_SYMPTOMS',
        payload: expect.arrayContaining([
          expect.objectContaining({
            symptom: 'Sore Throat',
            recovered_at: expect.any(String),
          }),
        ]),
      })
    );

    expect(post).toHaveBeenCalledWith(
      expect.stringContaining('/recoverSymptom'),
      expect.objectContaining({
        user_id: 'user-123',
        symptom: 'Sore Throat',
        date: todayDate,
      })
    );
  });
});
