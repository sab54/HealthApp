//Client/src/store/index.js
import { configureStore, combineReducers } from '@reduxjs/toolkit';

//  Auth-related reducers
import loginReducer from './reducers/loginReducer';
import registrationReducer from './reducers/registrationReducer';
import emergencyReducer from './reducers/emergencyReducer';
import chatReducer from './reducers/chatReducer';

//  UI-related
import themeReducer from './reducers/themeReducer';

const rootReducer = combineReducers({
  auth: loginReducer,
  registration: registrationReducer,
  theme: themeReducer,

  chat: chatReducer,
  emergency: emergencyReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});
