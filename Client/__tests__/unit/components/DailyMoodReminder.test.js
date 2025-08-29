/**
 * Client/src/components/__tests__/DailyMoodReminder.test.js
 *
 * What This Test File Covers:
 *
 * 1) Shows modal when skipped today, no recent reminder, and user is logged in.
 * 2) "Later" dismiss sets lastMoodReminder in AsyncStorage and hides modal.
 * 3) "Enter Mood" navigates to MoodPrompt.
 * 4) Timer-based reminder: advancing the interval triggers a reminder check and shows modal.
 *
 * Notes:
 * - We avoid relying on AppState for the last test (which can be flaky across environments)
 *   and instead use the component's interval to deterministically trigger checkReminder.
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import DailyMoodReminder from 'src/components/DailyMoodReminder';

// Use fake timers for interval-based reminder checks
jest.useFakeTimers();

// AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

// Redux
const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: jest.fn((selector) =>
    selector({
      healthlog: { moodToday: null }, // default: not entered mood yet
      auth: { user: { id: 'user-1' } }, // default: logged in
    })
  ),
}));

// Action
jest.mock('src/store/actions/healthlogActions', () => ({
  fetchTodayMood: jest.fn((uid) => ({ type: 'FETCH_TODAY_MOOD', payload: uid })),
}));

const AsyncStorage = require('@react-native-async-storage/async-storage');

beforeEach(() => {
  jest.clearAllMocks();
  // Simulate RTK unwrap() resolving
  mockDispatch.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) });
});

// Helper: set successive AsyncStorage.getItem returns for one checkReminder run.
// Order in component: getItem('lastMoodReminder') then getItem('moodSkipped')
const setGetItemForReminderCheck = ({ lastReminder = null, skipped = 'true' } = {}) => {
  AsyncStorage.getItem
    .mockResolvedValueOnce(lastReminder)
    .mockResolvedValueOnce(skipped);
};

describe('DailyMoodReminder', () => {
  it('shows modal when user skipped mood and no recent reminder exists', async () => {
    setGetItemForReminderCheck({ lastReminder: null, skipped: 'true' });

    const { getByText, queryByText } = render(<DailyMoodReminder />);

    await waitFor(() => {
      expect(getByText(/You skipped entering your mood/i)).toBeTruthy();
      expect(getByText('Enter Mood')).toBeTruthy();
      expect(getByText('Later')).toBeTruthy();
    });

    expect(queryByText('Enter Mood')).toBeTruthy();
  });

  it('pressing "Later" stores lastMoodReminder and hides the modal', async () => {
    setGetItemForReminderCheck({ lastReminder: null, skipped: 'true' });

    const { getByText, queryByText } = render(<DailyMoodReminder />);

    await waitFor(() => getByText('Later'));
    fireEvent.press(getByText('Later'));

    // setItem should be called with a numeric timestamp string
    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
    const [key, value] = AsyncStorage.setItem.mock.calls[0];
    expect(key).toBe('lastMoodReminder');
    expect(typeof value).toBe('string');
    expect(Number.isNaN(Number(value))).toBe(false);

    await waitFor(() => {
      expect(queryByText('Enter Mood')).toBeNull();
    });
  });

  it('pressing "Enter Mood" navigates to MoodPrompt', async () => {
    setGetItemForReminderCheck({ lastReminder: null, skipped: 'true' });

    const { getByText } = render(<DailyMoodReminder />);

    await waitFor(() => getByText('Enter Mood'));
    fireEvent.press(getByText('Enter Mood'));

    expect(mockNavigate).toHaveBeenCalledWith('MoodPrompt');
  });

  it('timer interval triggers reminder check and shows modal', async () => {
    // 1) Initial mount check: DO NOT show modal (simulate recent reminder)
    setGetItemForReminderCheck({
      lastReminder: String(Date.now()),
      skipped: 'true',
    });

    const { queryByText, getByText } = render(<DailyMoodReminder />);

    // Let the initial async check settle
    await act(async () => {});

    // Ensure no modal after initial check
    expect(queryByText(/You skipped entering your mood/i)).toBeNull();

    // 2) Next interval tick should show the modal
    // Prepare AsyncStorage responses for the next checkReminder run
    setGetItemForReminderCheck({
      lastReminder: null,
      skipped: 'true',
    });

    // Advance timers by the component's interval (1 min = 60000 ms)
    await act(async () => {
      jest.advanceTimersByTime(60000);
    });

    await waitFor(() => {
      expect(getByText(/You skipped entering your mood/i)).toBeTruthy();
    });
  });
});
