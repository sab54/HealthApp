//Client/src/store/index.js
/**
 * index.js
 *
 * This file configures and exports the Redux store for the application. It combines all reducers into a root reducer
 * using `combineReducers` from Redux Toolkit and configures the store using `configureStore`. The store includes 
 * reducers for both authentication-related state (e.g., login, registration, emergency contacts) and UI-related state 
 * (e.g., theme, health log, steps, weather, chat, appointments).
 *
 * Features:
 * - Combines multiple reducers into a single root reducer using `combineReducers`.
 * - Configures the Redux store with the root reducer using `configureStore` from Redux Toolkit.
 * - Includes authentication-related reducers (e.g., login, registration) and UI-related reducers (e.g., theme, steps).
 * - Supports asynchronous actions for various features (e.g., fetching weather, managing chat, tracking steps).
 *
 * This file uses the following libraries:
 * - Redux Toolkit for configuring the store and managing state.
 * - `combineReducers` to organize state across multiple feature reducers.
 *
 * Dependencies:
 * - @reduxjs/toolkit
 *
 * Author: Sunidhi Abhange
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit';

//  Auth-related reducers
import loginReducer from './reducers/loginReducer';
import registrationReducer from './reducers/registrationReducer';
import emergencyReducer from './reducers/emergencyReducer';
import weatherReducer from './reducers/weatherReducer';
import chatReducer from './reducers/chatReducer';
import settingsReducer from './reducers/settingsReducer';
import healthlogReducer from './reducers/healthlogReducers';
import appointmentReducers from './reducers/appointmentReducers';
import stepsReducer from './reducers/stepsReducer';

//  UI-related
import themeReducer from './reducers/themeReducer';

const rootReducer = combineReducers({
  auth: loginReducer,
  registration: registrationReducer,
  theme: themeReducer,
  settings: settingsReducer,
  healthlog: healthlogReducer,
  steps: stepsReducer,
  weather: weatherReducer,
  chat: chatReducer,
  appointment: appointmentReducers,
  emergency: emergencyReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});
