/**
 * StepsTrackerScreen.test.js
 *
 * What This Test File Covers:
 *
 * 1) Basic Rendering
 *    - Shows initial values: "Idle", "0 steps", "0 meters", "0 kcal".
 *
 * 2) Live Update via Sensor Callback
 *    - Mocks SensorTracker.startStepTracking, triggers the callback, and asserts UI updates.
 *      Calories = round(steps * 0.04).
 *
 * 3) Reset Button
 *    - Press "Reset" -> calls SensorTracker.resetSteps and UI resets to zeroes.
 *
 * 4) Unsubscribe on Unmount
 *    - startStepTracking returns unsubscribe; verify it is called on unmount.
 */

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import StepsTrackerScreen from '@/screens/StepsTrackerScreen';

const mockUnsubscribe = jest.fn();
const mockStart = jest.fn();
const mockReset = jest.fn();

let savedCallback = null;

jest.mock('@/utils/sensorTracker', () => ({
  startStepTracking: jest.fn((cb) => {
    // Save callback so tests can push updates
    savedCallback = cb;
    // Return unsubscribe function
    return mockUnsubscribe;
  }),
  resetSteps: jest.fn(),
}));

// Re-require the mock after jest.mock to capture references
const SensorTracker = require('@/utils/sensorTracker');

describe('StepsTrackerScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    savedCallback = null;
  });

  it('renders initial values (Idle, 0 steps, 0 meters, 0 kcal)', () => {
    const { getByText } = render(<StepsTrackerScreen />);

    expect(getByText("Today's Activity")).toBeTruthy();
    expect(getByText('Idle')).toBeTruthy();
    expect(getByText('0 steps')).toBeTruthy();
    expect(getByText('0 meters')).toBeTruthy();
    expect(getByText('0 kcal')).toBeTruthy();

    expect(SensorTracker.startStepTracking).toHaveBeenCalledTimes(1);
  });

  it('updates when SensorTracker callback fires (e.g., Walking, 1234 steps, 800 meters)', async () => {
    const { getByText, queryByText } = render(<StepsTrackerScreen />);
    expect(SensorTracker.startStepTracking).toHaveBeenCalledTimes(1);
    expect(typeof savedCallback).toBe('function');

    // Push a live update
    await act(async () => {
      savedCallback({ steps: 1234, distance: 800, activity: 'Walking' });
    });

    // Calories = round(1234 * 0.04) = 49.36 -> 49
    expect(getByText('Walking')).toBeTruthy();
    expect(getByText('1234 steps')).toBeTruthy();
    expect(getByText('800 meters')).toBeTruthy();
    expect(getByText('49 kcal')).toBeTruthy();

    // Ensure old values no longer visible
    expect(queryByText('Idle')).toBeNull();
    expect(queryByText('0 steps')).toBeNull();
  });

  it('pressing Reset calls SensorTracker.resetSteps and resets UI', async () => {
    const { getByText } = render(<StepsTrackerScreen />);

    // First simulate some non-zero state
    await act(async () => {
      savedCallback({ steps: 250, distance: 175, activity: 'Jogging' });
    });
    expect(getByText('Jogging')).toBeTruthy();
    expect(getByText('250 steps')).toBeTruthy();
    expect(getByText('175 meters')).toBeTruthy();
    // round(250 * 0.04) = 10
    expect(getByText('10 kcal')).toBeTruthy();

    // Press Reset
    fireEvent.press(getByText('Reset'));

    // Verify SensorTracker.resetSteps called
    expect(SensorTracker.resetSteps).toHaveBeenCalledTimes(1);

    // UI resets
    expect(getByText('Idle')).toBeTruthy();
    expect(getByText('0 steps')).toBeTruthy();
    expect(getByText('0 meters')).toBeTruthy();
    expect(getByText('0 kcal')).toBeTruthy();
  });

  it('unsubscribes on unmount', () => {
    const { unmount } = render(<StepsTrackerScreen />);
    expect(SensorTracker.startStepTracking).toHaveBeenCalledTimes(1);
    expect(typeof mockUnsubscribe).toBe('function');

    unmount();
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
