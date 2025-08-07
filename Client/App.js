//Client/App.js
import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { ChatProvider } from './src/context/ChatContext';

export default function App() {
  return (
    <Provider store={store}>
      <ChatProvider>
        <AppNavigator />
      </ChatProvider>
    </Provider>
  );
}
