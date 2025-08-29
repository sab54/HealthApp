/**
 * RegistrationScreen.test.js
 *
 * Covers:
 * 1) Basic Rendering & Validation
 * 2) Country Picker Flow
 * 3) Error Rendering
 * 4) Loading State on Button
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useSelector, useDispatch } from 'react-redux';
import { ActivityIndicator } from 'react-native';
import RegistrationScreen from '@/screens/RegistrationScreen';
import * as Location from 'expo-location';

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return { ...actual, useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }) };
});

jest.mock('@/store/actions/registrationActions', () => ({
  registerUser: jest.fn((payload) => ({ type: 'REGISTER_USER', payload })),
}));
jest.mock('@/utils/config', () => ({ autoSetOTP: true }));

jest.mock('@/components/RadioButton', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  return ({ label, value, onPress }) => (
    <TouchableOpacity accessibilityLabel={`radio-${value}`} onPress={() => onPress(value)}>
      <Text>{label}</Text>
    </TouchableOpacity>
  );
});

// CountryPicker is mocked in your global jest.setup.js

const { registerUser } = require('@/store/actions/registrationActions');

describe('RegistrationScreen', () => {
  const themeColors = {
    background: '#fff',
    text: '#111',
    placeholder: '#999',
    input: '#f7f7f7',
    inputBorder: '#ddd',
    inputText: '#111',
    surface: '#f0f0f0',
    buttonPrimaryBackground: '#0a84ff',
    buttonPrimaryText: '#fff',
    buttonDisabledBackground: '#e0e0e0',
    buttonDisabledText: '#888',
    link: '#007bff',
    error: '#ff3b30',
  };

  const makeState = (overrides = {}) => ({
    theme: { themeColors },
    registration: { loading: false, error: null, user: null, ...overrides },
  });

  beforeEach(() => {
    jest.clearAllMocks();
    useSelector.mockImplementation((sel) => sel(makeState()));

    const dispatch = useDispatch();
    dispatch.unwrap?.mockReset?.();

    if (!Location.getCurrentPositionAsync) {
      Location.getCurrentPositionAsync = jest.fn();
    }
    jest
      .spyOn(Location, 'requestForegroundPermissionsAsync')
      .mockResolvedValue({ status: 'denied' }); // default: denied → lat/long null
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 51.5, longitude: -0.12 },
    });
  });

  const fillValidForm = ({ getByPlaceholderText, getByText }) => {
    fireEvent.changeText(getByPlaceholderText('First Name *'), 'John');
    fireEvent.changeText(getByPlaceholderText('Email *'), 'john@example.com');
    fireEvent.changeText(getByPlaceholderText('Phone Number *'), '1234567890');
    fireEvent.press(getByText('User')); // select role via RadioButton stub
  };

  it('renders inputs, shows +44 by default, and dispatches registerUser only when form is valid', async () => {
    const { getByPlaceholderText, getByText } = render(<RegistrationScreen />);

    expect(getByText('+44')).toBeTruthy();

    // Press before valid → no dispatch
    fireEvent.press(getByText('Register'));
    expect(registerUser).not.toHaveBeenCalled();

    // Fill valid form and submit
    fillValidForm({ getByPlaceholderText, getByText });
    fireEvent.press(getByText('Register'));

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith({
        first_name: 'John',
        last_name: '',
        email: 'john@example.com',
        phone_number: '1234567890',
        country_code: '+44',
        latitude: null,
        longitude: null,
        role: 'user',
      });
    });
  });

  it('country picker selection updates country code to +1', async () => {
    const { getByText, getByTestId } = render(<RegistrationScreen />);

    fireEvent.press(getByText('+44')); // open picker
    expect(getByTestId('mock-country-picker')).toBeTruthy();

    fireEvent.press(getByTestId('mock-country-picker-item')); // selects +1 (from setup mock)

    await waitFor(() => expect(getByText('+1')).toBeTruthy());
  });

  it('renders error message from registration slice', async () => {
    useSelector.mockImplementation((sel) =>
      sel(makeState({ error: 'Email already in use' }))
    );

    const { getByText } = render(<RegistrationScreen />);
    expect(getByText('Email already in use')).toBeTruthy();
  });

  it('shows loading indicator on button when loading=true', async () => {
    useSelector.mockImplementation((sel) => sel(makeState({ loading: true })));

    const { queryByText, UNSAFE_queryAllByType } = render(<RegistrationScreen />);

    expect(queryByText('Register')).toBeNull();
    // Assert the ActivityIndicator is present without using getByA11yRole
    expect(UNSAFE_queryAllByType(ActivityIndicator).length).toBeGreaterThan(0);
  });
});
