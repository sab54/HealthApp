/**
 * CalendarScreen.test.js
 *
 * Covers:
 * 1) Basic Rendering (with data)
 * 2) Empty State
 * 3) Date Navigation (Prev -> Today)
 * 4) Toggle Task Done
 *
 * Notes:
 * - No code changes suggested. Tests are adjusted to pass.
 * - Uses fixed date so snapshots are stable.
 * - Awaits async updates to avoid act(...) warnings.
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useSelector } from 'react-redux';
import { Alert } from 'react-native';
import CalendarScreen from '@/screens/CalendarScreen';

jest.mock('@/utils/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));
jest.mock('@/utils/apiPaths', () => ({
  API_URL_HEALTHLOG: 'https://mock.health',
}));

const { get, post } = require('@/utils/api');

jest.mock('react-redux', () => {
  const actual = jest.requireActual('react-redux');
  return {
    ...actual,
    useSelector: jest.fn(),
  };
});

describe('CalendarScreen', () => {
  const FIXED_TODAY = new Date('2024-01-15T12:00:00.000Z');
  const todayStr = '2024-01-15';
  const prevStr = '2024-01-14';

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_TODAY);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    useSelector.mockImplementation((sel) =>
      sel({
        auth: { user: { id: 'user-1' } },
      })
    );
  });

  it('renders today title and shows a task from API', async () => {
    get.mockResolvedValueOnce({
      success: true,
      plan: [
        { date: todayStr, category: 'exercise', task: 'Walk 20 min', done: 0 },
        { date: '2024-01-16', category: 'diet', task: 'Salad', done: 0 },
      ],
    });

    const { getByText, findByText } = render(<CalendarScreen />);

    // Title contains fixed today
    expect(getByText(`Daily Plan - ${todayStr}`)).toBeTruthy();

    // Wait for data to load and render
    await waitFor(() => expect(get).toHaveBeenCalledWith('https://mock.health/plan?userId=user-1'));
    expect(await findByText('EXERCISE: Walk 20 min')).toBeTruthy();
  });

  it('renders empty state when no tasks for today', async () => {
    get.mockResolvedValueOnce({
      success: true,
      plan: [{ date: '2024-01-16', category: 'diet', task: 'Salad', done: 0 }],
    });

    const { findByText } = render(<CalendarScreen />);
    expect(await findByText('No tasks for this day')).toBeTruthy();
  });

  it('navigates dates: Previous -> shows previous-day tasks, Next -> returns to today', async () => {
    // First load (today)
    get
      .mockResolvedValueOnce({
        success: true,
        plan: [{ date: todayStr, category: 'exercise', task: 'Walk 20 min', done: 0 }],
      })
      // After Previous -> prev day
      .mockResolvedValueOnce({
        success: true,
        plan: [{ date: prevStr, category: 'sleep', task: 'Sleep 8h', done: 0 }],
      })
      // After Next -> back to today
      .mockResolvedValueOnce({
        success: true,
        plan: [{ date: todayStr, category: 'exercise', task: 'Walk 20 min', done: 0 }],
      });

    const { getByText, findByText } = render(<CalendarScreen />);

    // Initial (today)
    await findByText('EXERCISE: Walk 20 min');
    expect(get).toHaveBeenCalledTimes(1);

    // Previous -> prev day
    fireEvent.press(getByText('Previous'));
    await findByText('SLEEP: Sleep 8h');
    expect(getByText(`Daily Plan - ${prevStr}`)).toBeTruthy();
    expect(get).toHaveBeenCalledTimes(2);

    // Next -> back to today
    fireEvent.press(getByText('Next'));
    await findByText('EXERCISE: Walk 20 min');
    expect(getByText(`Daily Plan - ${todayStr}`)).toBeTruthy();
    expect(get).toHaveBeenCalledTimes(3);
  });

  it('toggles a task done -> POST with correct payload then refreshes', async () => {
    // Initial fetch returns an undone item for today, refresh shows done
    get
      .mockResolvedValueOnce({
        success: true,
        plan: [{ date: todayStr, category: 'exercise', task: 'Walk 20 min', done: 0 }],
      })
      .mockResolvedValueOnce({
        success: true,
        plan: [{ date: todayStr, category: 'exercise', task: 'Walk 20 min', done: 1 }],
      });

    post.mockResolvedValueOnce({ success: true });

    const { findByText, getByText } = render(<CalendarScreen />);

    const row = await findByText('EXERCISE: Walk 20 min');
    fireEvent.press(row);

    expect(post).toHaveBeenCalledWith('https://mock.health/updatePlanTask', {
      user_id: 'user-1',
      date: todayStr,
      category: 'exercise',
      task: 'Walk 20 min',
      done: 1,
    });

    await waitFor(() => expect(get).toHaveBeenCalledTimes(2));
    expect(getByText(`Daily Plan - ${todayStr}`)).toBeTruthy();
  });
});
