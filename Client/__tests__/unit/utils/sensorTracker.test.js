/**
 * __tests__/unit/utils/stepTracker.test.js
 *
 * What this test file covers:
 *
 * 1. Basic start & idle tick
 *    - Subscribes to Accelerometer, sets 100ms interval, emits an idle update.
 *
 * 2. Step detection and distance increment with interval gating
 *    - Two peaks above threshold spaced > MIN_STEP_INTERVAL → steps & distance increase, activity updates.
 *
 * 3. Unsubscribe
 *    - Returned function calls the subscription's remove() and clears listener.
 *
 * 4. resetSteps
 *    - Resets internal counters; next tick reports zeros and Idle.
 */

jest.mock('expo-sensors', () => ({
  Accelerometer: {
    addListener: jest.fn(),
    setUpdateInterval: jest.fn(),
  },
}));

import { Accelerometer } from 'expo-sensors';
import { startStepTracking, resetSteps } from 'src/utils/sensorTracker';

describe('utils/stepTracker', () => {
  let accelHandler;
  let removeMock;
  let nowMock;

  const setNow = (ms) => {
    nowMock.mockReturnValue(ms);
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Capture handler passed to addListener and provide a remove() mock.
    removeMock = jest.fn();
    accelHandler = null;
    Accelerometer.addListener.mockImplementation((handler) => {
      accelHandler = handler;
      return { remove: removeMock };
    });

    nowMock = jest.spyOn(Date, 'now').mockReturnValue(0);
  });

  afterEach(() => {
    nowMock.mockRestore();
  });

  it('starts tracking, sets interval, and emits Idle with zero stats for a sub-threshold tick', () => {
    const cb = jest.fn();

    const unsubscribe = startStepTracking(cb);
    expect(typeof unsubscribe).toBe('function');
    expect(Accelerometer.setUpdateInterval).toHaveBeenCalledWith(100);
    expect(accelHandler).toBeInstanceOf(Function);

    // Emit a small magnitude < threshold (smoothedMagnitude will stay below 1.25)
    setNow(1000);
    accelHandler({ x: 0, y: 0, z: 0.5 });

    expect(cb).toHaveBeenLastCalledWith({
      steps: 0,
      distance: 0,
      activity: 'Idle',
    });
  });

  it('detects steps when peaks exceed threshold and respects MIN_STEP_INTERVAL', () => {
    const cb = jest.fn();
    startStepTracking(cb);

    // First strong peak at t=1000ms → step #1
    setNow(1000);
    accelHandler({ x: 0, y: 0, z: 2 }); // magnitude ≈ 2, smoothed ≈ 1.5 (>1.25)
    expect(cb).toHaveBeenLastCalledWith({
      steps: 1,
      distance: 1, // 0.8 rounded → 1
      activity: 'Walking',
    });

    // Too soon (t=1100ms, < 250ms) → should NOT count another step
    setNow(1100);
    accelHandler({ x: 0, y: 0, z: 2 });
    expect(cb).toHaveBeenLastCalledWith({
      steps: 1,
      distance: 1,
      activity: 'Walking',
    });

    // After interval (t=1300ms, > 250ms) → step #2
    setNow(1300);
    accelHandler({ x: 0, y: 0, z: 2 });
    expect(cb).toHaveBeenLastCalledWith({
      steps: 2,
      distance: 2, // 1.6 rounded → 2
      activity: 'Walking',
    });
  });

  it('unsubscribe removes the accelerometer listener', () => {
    const cb = jest.fn();
    const unsubscribe = startStepTracking(cb);

    unsubscribe();
    expect(removeMock).toHaveBeenCalledTimes(1);
  });

  it('resetSteps resets counters and next tick reports zeros and Idle', () => {
    const cb = jest.fn();
    startStepTracking(cb);

    // Add a step first
    setNow(1000);
    accelHandler({ x: 0, y: 0, z: 2 });
    expect(cb).toHaveBeenLastCalledWith(
      expect.objectContaining({ steps: 1, distance: 1 })
    );

    // Reset
    resetSteps();

    // Next below-threshold tick should reflect reset state
    setNow(2000);
    accelHandler({ x: 0, y: 0, z: 0.4 });
    expect(cb).toHaveBeenLastCalledWith({
      steps: 0,
      distance: 0,
      activity: 'Idle',
    });
  });
});
