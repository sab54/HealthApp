/**
 * stepTracking.js
 *
 * This file contains utilities for tracking the user's steps using the accelerometer data from the device. It integrates
 * with the `expo-sensors` package to listen to accelerometer data and determine when the user takes a step based on 
 * acceleration magnitude. The system processes data to count steps, calculate distance, and categorize activity (idle, walking, or running).
 *
 * Features:
 * - `startStepTracking`: Starts step tracking by subscribing to accelerometer data and calculating steps and distance.
 *   - Uses a low-pass filter to smooth out small fluctuations in accelerometer data.
 *   - Detects steps based on acceleration magnitude exceeding a defined threshold.
 *   - Categorizes activity as 'Idle', 'Walking', or 'Running' based on step rate.
 * - `resetSteps`: Resets the step count, distance, and other state variables.
 * - `stopStepTracking`: Stops the accelerometer listener and unsubscribes from the accelerometer data stream.
 *
 * Constants:
 * - `STEP_THRESHOLD`: The minimum magnitude above which a step is considered.
 * - `MIN_STEP_INTERVAL`: The minimum time interval (in ms) between valid steps.
 * - `ALPHA`: The smoothing factor used for the low-pass filter to ignore small, unimportant shakes.
 *
 * This file uses the following libraries:
 * - `expo-sensors`: Provides access to accelerometer data in React Native apps.
 * 
 * Dependencies:
 * - expo-sensors
 *
 * Author: Sunidhi Abhange
 */

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
