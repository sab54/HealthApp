/**
 * Client/src/components/Chat/__tests__/MessageBubble.test.js
 *
 * What This Test File Covers:
 *
 * 1) Basic Rendering (incoming message)
 *    - Renders sender name (when not me), message content, and reactions.
 *
 * 2) Long-Press Actions (incoming message)
 *    - Opens action modal on long press.
 *    - Copy calls Clipboard.setString.
 *    - Reply calls openThread.
 *    - React calls Alert.alert.
 *    - Delete button is NOT shown when the message is not from me.
 *
 * 3) Location Message (android path)
 *    - Taps map preview and opens Linking URL with geo scheme.
 *
 * 4) Quiz Message
 *    - Renders "Take Quiz" button and navigates to Quiz with parsed quizId.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TouchableOpacity, Linking, Platform, Alert } from 'react-native';
import MessageBubble from 'src/components/Chat/MessageBubble';

// ---- Targeted suppression: RN Clipboard deprecation warning (install spy before any Clipboard access) ----
const __originalConsoleWarn = console.warn;
const __warnSpy = jest.spyOn(console, 'warn').mockImplementation((...args) => {
  const msg = args?.[0];
  if (
    typeof msg === 'string' &&
    msg.includes('Clipboard has been extracted from react-native core')
  ) {
    // Swallow ONLY the Clipboard deprecation warning.
    return;
  }
  return __originalConsoleWarn(...args);
});

afterAll(() => {
  if (__warnSpy && typeof __warnSpy.mockRestore === 'function') {
    __warnSpy.mockRestore();
  } else {
    console.warn = __originalConsoleWarn;
  }
});

// ---- Mocks (no full 'react-native' mock to avoid TurboModule errors) ----

// Navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

// Icons
jest.mock('@expo/vector-icons', () => ({
  Feather: (props) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, { ...props }, `icon:${props.name}`);
  },
}));

// Haptics
jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: { Medium: 'Medium' },
  impactAsync: jest.fn(),
}));

// Clipboard: attach a stub onto RN at runtime (do NOT mock the whole module)
const RN = require('react-native');
if (!RN.Clipboard) {
  // Older RN may not expose Clipboard; component imports from 'react-native', so stub it
  RN.Clipboard = { setString: jest.fn() };
}

// Spy on specific RN APIs
jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
jest.spyOn(Alert, 'alert').mockImplementation(() => {});
// Force android code path
Object.defineProperty(Platform, 'OS', { value: 'android' });
jest.spyOn(Platform, 'select').mockImplementation((obj) => obj.android);

const theme = {
  primary: '#e0f7ff',
  surface: '#ffffff',
  text: '#111111',
  mutedText: '#999999',
  accent: '#ffeeaa',
  link: '#3366ff',
};

const baseIncomingMessage = {
  sender: { id: 'other', name: 'Alex' },
  content: 'Hello there!',
  timestamp: Date.now(),
  reactions: [{ emoji: '👍' }, { emoji: '🎉' }],
};

describe('MessageBubble', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders sender name, message content, and reactions for incoming message', () => {
    const openThread = jest.fn();
    const { getByText } = render(
      <MessageBubble
        senderId="me"
        message={baseIncomingMessage}
        theme={theme}
        openThread={openThread}
      />
    );

    expect(getByText('Alex')).toBeTruthy();
    expect(getByText('Hello there!')).toBeTruthy();
    expect(getByText('👍')).toBeTruthy();
    expect(getByText('🎉')).toBeTruthy();
  });

  it('opens actions on long press; Copy/Reply/React trigger expected handlers; Delete hidden when not me', () => {
    const openThread = jest.fn();
    const { UNSAFE_getAllByType, getByText, queryByText } = render(
      <MessageBubble
        senderId="me"
        message={baseIncomingMessage}
        theme={theme}
        openThread={openThread}
      />
    );

    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    expect(touchables.length).toBeGreaterThan(0);
    const wrapperTouchable = touchables[0];

    // Open modal
    fireEvent(wrapperTouchable, 'longPress');

    // Reply
    fireEvent.press(getByText('Reply'));
    expect(openThread).toHaveBeenCalledWith(baseIncomingMessage);

    // Re-open modal for next actions
    fireEvent(wrapperTouchable, 'longPress');

    // Copy
    fireEvent.press(getByText('Copy'));
    expect(RN.Clipboard.setString).toHaveBeenCalledWith('Hello there!');

    // Re-open modal
    fireEvent(wrapperTouchable, 'longPress');

    // React
    fireEvent.press(getByText('React'));
    expect(Alert.alert).toHaveBeenCalledWith('React', '❤️ reaction added (demo only)');

    // Not my message, so Delete is hidden
    expect(queryByText('Delete')).toBeNull();
  });

  it('opens map URL when tapping a location message (android scheme)', () => {
    const locMessage = {
      sender: { id: 'other', name: 'Alex' },
      message_type: 'location',
      content: '{latitude:12.34, longitude:56.78}', // unquoted keys; component quotes before parse
      timestamp: Date.now(),
    };

    const { UNSAFE_getAllByType } = render(
      <MessageBubble
        senderId="me"
        message={locMessage}
        theme={theme}
        openThread={jest.fn()}
      />
    );

    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    expect(touchables.length).toBeGreaterThan(1);
    const mapTouchable = touchables[1];

    fireEvent.press(mapTouchable);
    expect(Linking.openURL).toHaveBeenCalledWith('geo:12.34,56.78?q=12.34,56.78');
  });

  it('renders quiz message and navigates to Quiz on "Take Quiz"', () => {
    const quizMessage = {
      sender: { id: 'other', name: 'Alex' },
      message_type: 'quiz',
      content: 'Daily check-in [quizId:42]',
      timestamp: Date.now(),
    };

    const { getByText } = render(
      <MessageBubble
        senderId="me"
        message={quizMessage}
        theme={theme}
        openThread={jest.fn()}
      />
    );

    const takeQuizBtn = getByText('Take Quiz');
    fireEvent.press(takeQuizBtn);
    expect(mockNavigate).toHaveBeenCalledWith('Quiz', { quizId: 42 });
  });
});
