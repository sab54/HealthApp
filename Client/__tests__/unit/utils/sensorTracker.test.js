/**
 * __tests__/unit/utils/stepTracker.test.js
 *
 * What this test file covers:
 *
 * 1. Basic start & idle tick
 * 2. Step detection and distance increment with interval gating
 * 3. Unsubscribe
 * 4. resetSteps
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

    // Emit a small magnitude < threshold (smoothedMagnitude stays below threshold)
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
    accelHandler({ x: 0, y: 0, z: 2 }); // strong peak
    expect(cb).toHaveBeenLastCalledWith({
      steps: 1,
      distance: 1, // rounded
      activity: 'Walking',
    });

    // Too soon (t=1100ms, < MIN_STEP_INTERVAL) → NOT a step
    setNow(1100);
    accelHandler({ x: 0, y: 0, z: 2 });
    expect(cb).toHaveBeenLastCalledWith({
      steps: 1,
      distance: 1,
      activity: 'Walking',
    });

    // After interval (t=1300ms, > MIN_STEP_INTERVAL) → step #2
    setNow(1300);
    accelHandler({ x: 0, y: 0, z: 2 });
    expect(cb).toHaveBeenLastCalledWith({
      steps: 2,
      distance: 2,
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

    // Generate some activity (implementation may or may not emit for peaks)
    setNow(1000);
    accelHandler({ x: 0, y: 0, z: 2 });
    setNow(1300);
    accelHandler({ x: 0, y: 0, z: 2 });

    // Reset counters (do not assert pre-reset emissions)
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
