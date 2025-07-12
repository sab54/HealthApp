import { configureStore, combineReducers } from '@reduxjs/toolkit';

// 🧩 Auth-related reducers
import loginReducer from './reducers/loginReducer';
import registrationReducer from './reducers/registrationReducer';

// 🎨 UI-related
import themeReducer from './reducers/themeReducer';

const rootReducer = combineReducers({
  auth: loginReducer,
  registration: registrationReducer,
  theme: themeReducer,
  // Add more reducers here if needed
});

export const store = configureStore({
  reducer: rootReducer,
});
