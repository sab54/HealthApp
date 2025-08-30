// Client/App.js
/**
 * App.js
 *
 * This is the entry point of the application. It sets up the Redux store and context providers, ensuring the app is 
 * properly connected to the state and the necessary data flows. The `StartupWrapper` component dispatches the `initAuth` 
 * action to initialize the authentication state when the app starts.
 *
 * Features:
 * - `StartupWrapper`: A wrapper component that dispatches the `initAuth` action to initialize user authentication 
 *   when the app loads.
 * - `AppNavigator`: The main navigation component of the app, responsible for routing.
 * - `ChatProvider`: Provides context for managing chat-related state.
 * - Wraps the application in `Provider` to connect Redux store and `ChatProvider` for chat-related state management.
 *
 * This file uses the following libraries:
 * - `react-redux`: For connecting the app to the Redux store.
 * - `react-navigation`: For navigating between different screens of the app.
 * - `ChatContext`: Custom context for managing chat state.
 *
 * Dependencies:
 * - @react-redux
 * - react-navigation
 *
 * Author: Sunidhi Abhange
 */

import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { Provider, useDispatch } from 'react-redux';
import { store } from './src/store';
import { ChatProvider } from './src/context/ChatContext';

// Import the initAuth action
import { initAuth } from './src/store/actions/loginActions';

// Wrapper component so we can use dispatch
function StartupWrapper() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initAuth());
  }, [dispatch]);

  return <AppNavigator />;
}

export default function App() {
  return (
    <Provider store={store}>
      <ChatProvider>
        <StartupWrapper />
      </ChatProvider>
    </Provider>
  );
}
