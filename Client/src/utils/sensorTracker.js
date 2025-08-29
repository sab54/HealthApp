import { Accelerometer } from 'expo-sensors';

let accelerometerSubscription = null;

let stepsToday = 0;
let distanceToday = 0; // meters
let lastStepTime = 0;
let smoothedMagnitude = 0;

const STEP_THRESHOLD = 1.25;
const MIN_STEP_INTERVAL = 250;  // keep same, ensures only realistic step intervals
const ALPHA = 0.25;             // more smoothing to ignore tiny shakes

// AFTER
export const startStepTracking = (callback, initialSteps = 0, initialDistance = 0, reset = false) => {
  if (reset) {
    stepsToday = 0;
    distanceToday = 0;
    lastStepTime = 0;
    smoothedMagnitude = 0;
  } else {
    stepsToday = initialSteps;
    distanceToday = initialDistance;
  }


  accelerometerSubscription = Accelerometer.addListener(({ x, y, z }) => {
    console.log("Accelerometer data:", x, y, z);

    const now = Date.now();

    // Calculate total acceleration magnitude
    const magnitude = Math.sqrt(x * x + y * y + z * z);

    // Low-pass filter to smooth out small jitters
    smoothedMagnitude = ALPHA * smoothedMagnitude + (1 - ALPHA) * magnitude;

    // Detect step: peak above threshold & valid interval
    if (
      smoothedMagnitude > STEP_THRESHOLD &&
      (now - lastStepTime) > MIN_STEP_INTERVAL
    ) {
      stepsToday += 1;
      distanceToday += 0.8; // meters per step
      lastStepTime = now;
    }

    // Determine activity
    let activity = 'Idle';
    const stepRate = stepsToday / Math.max(1, (now - lastStepTime) / 60000);
    if (stepRate > 0 && stepRate <= 120) activity = 'Walking';
    else if (stepRate > 120) activity = 'Running';

    callback({
      steps: stepsToday,
      distance: Math.round(distanceToday),
      activity,
    });
  });

  Accelerometer.setUpdateInterval(100); // 100ms for smooth detection

  // Unsubscribe function
  return () => {
    if (accelerometerSubscription) {
      accelerometerSubscription.remove();
      accelerometerSubscription = null;
    }
  };
};

export const resetSteps = () => {
  stepsToday = 0;
  distanceToday = 0;
  lastStepTime = 0;
  smoothedMagnitude = 0;
};

export const stopStepTracking = () => {
  if (accelerometerSubscription) {
    accelerometerSubscription.remove();
    accelerometerSubscription = null;
  }
};
