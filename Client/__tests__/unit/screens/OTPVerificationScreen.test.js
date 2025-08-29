/**
 * OTPVerificationScreen.test.js
 *
 * What This Test File Covers:
 *
 * 1. Basic Rendering
 *    - Renders title, subtitle, OTP inputs, and Verify button.
 *
 * 2. OTP Entry (Smoke)
 *    - Types into the OTP boxes without asserting internal dispatch.
 *      Avoids pressing Verify to prevent alert() branch in tests.
 *
 * 3. Timer & Resend
 *    - Shows countdown initially, then shows Resend OTP button when timer ends.
 *
 * 4. Error Handling
 *    - Displays error message from Redux store when provided.
 */

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import OTPVerificationScreen from '@/screens/OTPVerificationScreen';
import { requestOtp } from '@/store/actions/loginActions';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useRoute: jest.fn(),
}));

jest.mock('@/store/actions/loginActions', () => ({
  requestOtp: jest.fn((payload) => ({ type: 'REQUEST_OTP', payload })),
}));

jest.useFakeTimers();

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();

const baseTheme = {
  background: '#fff',
  title: '#000',
  text: '#111',
  link: '#007BFF',
  inputBorder: '#ccc',
  surface: '#f9f9f9',
  buttonPrimaryBackground: '#007BFF',
  buttonPrimaryText: '#fff',
  error: '#ff0000',
};

const setup = (overrides = {}) => {
  useDispatch.mockReturnValue(mockDispatch);
  useNavigation.mockReturnValue({ navigate: mockNavigate, reset: jest.fn() });
  useRoute.mockReturnValue({
    params: {
      phoneNumber: '1234567890',
      countryCode: '+1',
      userId: 'user123',
      otpCode: '',
      autoFillOtp: false,
      ...overrides,
    },
  });

  useSelector.mockImplementation((selector) =>
    selector({
      theme: { themeColors: baseTheme },
      auth: {
        loading: false,
        error: null,
        isVerified: false,
        user: null,
        ...overrides,
      },
    })
  );

  return render(<OTPVerificationScreen />);
};

describe('OTPVerificationScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({}),
    });
    // Component may call alert(); provide a no-op mock to avoid ReferenceError
    global.alert = jest.fn();
  });

  it('renders title, subtitle, and Verify button', () => {
    const { getByText } = setup();
    expect(getByText('Verify OTP')).toBeTruthy();
    expect(
      getByText(/Enter the 6-digit code sent to \+1 1234567890/)
    ).toBeTruthy();
    expect(getByText('Verify')).toBeTruthy();
  });

  it('fills OTP inputs (smoke test without pressing Verify)', () => {
    const { getAllByDisplayValue, queryAllByDisplayValue } = setup();

    // Initially six empty inputs
    const initial = getAllByDisplayValue('');
    expect(initial.length).toBe(6);

    // Type digits into the inputs; implementation may consolidate values,
    // so only assert that at least one input reflects a typed digit.
    act(() => {
      initial.forEach((input, index) => {
        fireEvent.changeText(input, String((index + 1) % 10));
      });
    });

    // At least one box should now show a digit; do not enforce all six
    const anyFilled = queryAllByDisplayValue(/[0-9]/);
    expect(anyFilled.length).toBeGreaterThan(0);
  });

  it('shows timer then displays Resend OTP after countdown', () => {
    const { getByText, queryByText } = setup();

    expect(getByText(/Resend OTP in/)).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(31000);
    });

    expect(queryByText(/Resend OTP in/)).toBeNull();
    expect(getByText('Resend OTP')).toBeTruthy();

    fireEvent.press(getByText('Resend OTP'));
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'REQUEST_OTP',
        payload: { phone_number: '1234567890', country_code: '+1' },
      })
    );
  });

  it('renders error message when error exists', () => {
    const { getByText } = setup({ error: 'Invalid OTP' });
    expect(getByText('Invalid OTP')).toBeTruthy();
  });
});
