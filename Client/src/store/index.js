//Client/src/store/index.js
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

//  UI-related
import themeReducer from './reducers/themeReducer';

const rootReducer = combineReducers({
  auth: loginReducer,
  registration: registrationReducer,
  theme: themeReducer,
  settings: settingsReducer,
  healthlog: healthlogReducer,

  weather: weatherReducer,
  chat: chatReducer,
  appointment: appointmentReducers,
  emergency: emergencyReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});
