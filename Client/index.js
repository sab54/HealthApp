
/**
 * index.js
 *
 * This is the entry point of the application for Expo. It registers the root component of the app, which is the
 * `App` component, using Expo's `registerRootComponent` function. This function ensures that the app is properly 
 * initialized and managed by Expo's runtime.
 *
 * Features:
 * - Registers the root component (`App`) of the application using `registerRootComponent` from the `expo` package.
 * - This is the main entry file when running the app with Expo.
 *
 * This file uses the following libraries:
 * - `expo`: For registering the root component and initializing the app.
 *
 * Dependencies:
 * - expo
 *
 * Author: Sunidhi Abhange
 */
import { registerRootComponent } from 'expo';

import App from './App';

registerRootComponent(App);
