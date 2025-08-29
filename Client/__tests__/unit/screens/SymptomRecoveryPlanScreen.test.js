/**
 * SymptomRecoveryPlanScreen.test.js
 *
 * 1. Basic Rendering
 * 2. Grouping & Content
 * 3. Progress Summary
 * 4. Toggle Task -> Dispatch
 */

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { useSelector, useDispatch } from 'react-redux';
import { View } from 'react-native';

import SymptomRecoveryPlanScreen from '@/screens/SymptomRecoveryPlanScreen';

// IMPORTANT: mock using the SAME paths the screen uses internally
jest.mock('@/utils/api', () => ({
  get: jest.fn(),
}));
jest.mock('@/store/actions/healthlogActions', () => ({
  updatePlanTask: jest.fn((payload) => ({ type: 'UPDATE_PLAN_TASK', payload })),
}));
jest.mock('@/data/symptomHealth', () => ({
  getAllSeverities: jest.fn(() => ({})),
}));

import { get } from '@/utils/api';

// --- Navigation hooks: local mocks (no NavigationContainer needed) ---
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
    useRoute: jest.fn(),
    useFocusEffect,
  };
});
import { useNavigation, useRoute } from '@react-navigation/native';

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
};

const setup = async ({
  userId = 'user-123',
  symptom = 'Cough',
  severity_level,
  apiPlan = [
    { category: 'care', task: 'Stay hydrated', done: 1 },
    { category: 'diet', task: 'Eat soup', done: 0 },
    { category: 'exercises', task: 'Light yoga', done: 0 },
    { category: 'medicine', task: 'Paracetamol', done: 0 },
    { category: 'avoid', task: 'Avoid cold drinks', done: 0 },
  ],
} = {}) => {
  jest.clearAllMocks();

  const fixed = new Date('2024-01-15T10:00:00Z');
  jest.setSystemTime(fixed);

  useSelector.mockImplementation((selector) =>
    selector({
      auth: { user: { id: userId } },
      theme: { themeColors: baseTheme },
    })
  );

  const navigate = jest.fn();
  const goBack = jest.fn();
  useNavigation.mockReturnValue({ navigate, goBack, reset: jest.fn() });
  useRoute.mockReturnValue({
    params: { symptom: { symptom, severity_level, date: '2024-01-10T00:00:00Z' } },
  });

  // persist across multiple fetches
  get.mockResolvedValue({ plan: apiPlan });

  const utils = render(<SymptomRecoveryPlanScreen />);

  await act(async () => {
    await Promise.resolve();
  });

  return { ...utils, navigate, goBack, fixedDateStr: '2024-01-15' };
};

describe('SymptomRecoveryPlanScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title, symptom name, and section headers after loading', async () => {
    const { getByText } = await setup();

    expect(getByText('Recovery Plan for:')).toBeTruthy();
    expect(getByText('Cough')).toBeTruthy();

    expect(getByText('Severity & Recorded At')).toBeTruthy();
    expect(getByText('Precautions')).toBeTruthy();
    expect(getByText('Medicine')).toBeTruthy();
    expect(getByText('What to Eat')).toBeTruthy();
    expect(getByText('Exercises')).toBeTruthy();
    expect(getByText('What to Avoid')).toBeTruthy();
  });

  it('groups tasks into respective categories and shows task names', async () => {
    const { getByText } = await setup({
      apiPlan: [
        { category: 'care', task: 'Rest well', done: 0 },
        { category: 'diet', task: 'Broth', done: 0 },
        { category: 'exercises', task: 'Breathing exercise', done: 0 },
        { category: 'medicine', task: 'Cough syrup', done: 1 },
        { category: 'avoid', task: 'Spicy food', done: 0 },
      ],
    });

    expect(getByText('Rest well')).toBeTruthy();
    expect(getByText('Broth')).toBeTruthy();
    expect(getByText('Breathing exercise')).toBeTruthy();
    expect(getByText('Cough syrup')).toBeTruthy();
    expect(getByText('Spicy food')).toBeTruthy();
  });

  it('shows correct progress summary based on completed tasks', async () => {
    const { getByText } = await setup({
      apiPlan: [
        { category: 'care', task: 'Hydrate', done: 1 },
        { category: 'diet', task: 'Soup', done: 0 },
        { category: 'exercises', task: 'Walk', done: 0 },
      ],
    });

    expect(getByText('1 / 3 Tasks Completed')).toBeTruthy();
  });

  it('dispatches correct action when a checkbox is pressed', async () => {
    const { getByText, fixedDateStr } = await setup({
      apiPlan: [
        { category: 'precautions', task: 'Wear mask', done: 0 },
        { category: 'diet', task: 'Warm fluids', done: 0 },
      ],
    });

    const dispatchMock = useDispatch();

    // Find the task text node
    const taskTextNode = getByText('Wear mask');

    // Climb to the row container (<View style={styles.taskCard}>)
    let row = taskTextNode.parent;
    while (row && row.type !== View) {
      row = row.parent;
    }
    expect(row).toBeTruthy();

    // Depth-first search inside the row for any node that has an onPress handler (the checkbox)
    const findPressable = (node) => {
      if (node && typeof node.props?.onPress === 'function') return node;
      const kids = Array.isArray(node?.children) ? node.children : [node?.children].filter(Boolean);
      for (const child of kids) {
        const found = findPressable(child);
        if (found) return found;
      }
      return null;
    };

    const checkboxInst = findPressable(row);
    expect(checkboxInst).toBeTruthy();

    fireEvent.press(checkboxInst);

    expect(dispatchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'UPDATE_PLAN_TASK',
        payload: expect.objectContaining({
          user_id: 'user-123',
          date: fixedDateStr,
          category: 'precautions',
          task: 'Wear mask',
          done: 1,
        }),
      })
    );
  });
});
