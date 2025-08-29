// Client/__tests__/unit/module/EmergencyShortcuts.test.js

/**
 * EmergencyShortcuts.test.js
 *
 * What This Test File Covers:
 *
 * 1) Mount & Dispatch
 *    - Renders title and services.
 *    - Dispatches loadEmergencySettings on mount.
 *
 * 2) Expand & Locate
 *    - Tapping a service card expands it and pressing "Locate" opens Maps with platform URL.
 *
 * 3) Text preset SMS
 *    - Pressing "Text" opens the modal and choosing a preset triggers an SMS deep link.
 *
 * 4) Add custom contact
 *    - Opens AddContactModal mock and adds a contact; the new contact renders with its number.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import EmergencyShortcuts from '../../../src/module/EmergencyShortcuts';

// Use fake timers because the component starts an Animated.loop
jest.useFakeTimers();

// --- Mock redux
const mockDispatch = jest.fn(() => ({ unwrap: jest.fn().mockResolvedValue({}) }));
jest.mock('react-redux', () => {
  const actual = jest.requireActual('react-redux');
  return {
    ...actual,
    useDispatch: () => mockDispatch,
    useSelector: jest.fn(),
  };
});

// --- Mock action creator
jest.mock('../../../src/store/actions/emergencyActions', () => ({
  loadEmergencySettings: () => ({ type: 'LOAD_EMERGENCY_SETTINGS' }),
}));

// --- Mock AddContactModal: render a simple button that calls onAdd
jest.mock('../../../src/modals/AddContactModal', () => {
  return ({ visible, onClose, onAdd, theme }) => {
    const React = require('react');
    const { View, TouchableOpacity, Text } = require('react-native');
    if (!visible) return null;
    return (
      <View testID="add-contact-modal">
        <TouchableOpacity
          testID="mock-add-contact"
          onPress={() => {
            onAdd({ name: 'Mom', number: '1234567890' });
            onClose?.();
          }}
        >
          <Text>Add</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

// --- Stable theme for tests
const theme = {
  card: '#fafafa',
  background: '#fff',
  surface: '#f5f5f5',
  border: '#ddd',
  cardShadow: '#000',
  text: '#111',
  title: '#000',
  icon: '#666',
  success: 'green',
  successBackground: '#e6f7ee',
  warning: 'orange',
  warningBackground: '#fff5e6',
  actionText: '#000',
  primary: '#007bff',
  link: '#007bff',
  buttonPrimaryBackground: '#28a745',
  buttonSecondaryBackground: '#e0f0ff',
  buttonSecondaryText: '#0053a0',
};

// Helper to render SUT
const setup = (overrides = {}) =>
  render(<EmergencyShortcuts theme={theme} {...overrides} />);

describe('EmergencyShortcuts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('mounts, renders title and services, and dispatches loadEmergencySettings', () => {
    const { getByText } = setup();

    // Title
    expect(getByText('🚨 Emergency Quick Access')).toBeTruthy();
    // Service labels
    expect(getByText('Medical')).toBeTruthy();
    expect(getByText('Dentist')).toBeTruthy();
    expect(getByText('Pharmacy')).toBeTruthy();

    // loadEmergencySettings dispatched on mount
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'LOAD_EMERGENCY_SETTINGS' });
  });

it('expands a service and opens maps when pressing Locate (platform URL)', () => {
  const { getByText } = setup();

  // Expand "Medical"
  fireEvent.press(getByText('Medical'));

  // Spy after expansion
  const { Linking, Platform } = require('react-native');
  const openURLSpy = jest.spyOn(Linking, 'openURL').mockResolvedValueOnce();

  fireEvent.press(getByText('Locate'));

  const expected = Platform.select({
    ios: 'http://maps.apple.com/?q=Hospital',
    android: 'geo:0,0?q=Hospital',
  });
  expect(openURLSpy).toHaveBeenCalledWith(expected);
});


it('opens Text modal and choosing a preset triggers an SMS deeplink to default emergency number', () => {
  const { getByText, queryByText } = setup();

  // Expand first service
  fireEvent.press(getByText('Medical'));

  // Open Text modal
  fireEvent.press(getByText('Text'));

  // Choose first preset
  const preset = 'Medical emergency! Please assist.';
  const presetNode = getByText(preset);

  const { Linking } = require('react-native');
  const openURLSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue();

  fireEvent.press(presetNode);

  // Assert SMS deeplink uses default US number "911" with encoded body
  expect(openURLSpy).toHaveBeenCalled();
  const calledWith = openURLSpy.mock.calls[0][0];
  expect(calledWith).toContain('sms:911');
  expect(calledWith).toContain(encodeURIComponent('Medical emergency! Please assist.'));

  // Modal closes after choosing a preset
  expect(queryByText(preset)).toBeNull();
});

  it('adds a custom contact via AddContactModal mock and renders it', () => {
    const { getByText, getByTestId } = setup();

    // Button at bottom
    fireEvent.press(getByText('Add Another Emergency Contact'));

    // Modal shows and we add a contact
    getByTestId('add-contact-modal'); // visible
    fireEvent.press(getByTestId('mock-add-contact'));

    // Newly added contact should render
    expect(getByText('Mom')).toBeTruthy();
    expect(getByText('1234567890')).toBeTruthy();
  });
});
