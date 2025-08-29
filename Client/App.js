// Client/App.js
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
