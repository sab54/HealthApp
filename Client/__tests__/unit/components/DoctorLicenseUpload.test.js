/**
 * Client/src/components/__tests__/DoctorLicenseUpload.test.js
 *
 * What This Test File Covers:
 *
 * 1) Basic Rendering & Initial State
 *    - Renders title and disabled Upload button when no image is selected.
 *
 * 2) Happy Path (Success)
 *    - Picks an image, enables button, uploads, calls API, stores approval,
 *      calls onVerified, and shows "success" result.
 *
 * 3) Failure Path
 *    - Picks an image, API returns failure; shows "failure" result and does not store approval.
 *
 * 4) Missing userId Guard
 *    - With image selected but no userId, shows Alert and does not call the API.
 */

import React from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import { render, fireEvent, act } from '@testing-library/react-native';
import DoctorLicenseUpload from 'src/components/DoctorLicenseUpload';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: 'Images' },
}));

jest.mock('src/utils/api', () => ({
  verifyDoctorLicense: jest.fn(),
}));

// Mock vector icons (avoid native rendering issues)
jest.mock('@expo/vector-icons', () => ({
  Ionicons: (props) => {
    // minimal stub
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, props, 'icon');
  },
}));

const { setItem } = require('@react-native-async-storage/async-storage');
const ImagePicker = require('expo-image-picker');
const { verifyDoctorLicense } = require('src/utils/api');

const baseTheme = {
  border: '#ddd',
  surface: '#fff',
  text: '#111',
  buttonPrimaryBackground: '#007BFF',
  buttonPrimaryText: '#fff',
  success: '#2ecc71',
  warning: '#e67e22',
};

const mockPickResult = (uri = 'file:///license.jpg') => {
  ImagePicker.launchImageLibraryAsync.mockResolvedValueOnce({
    canceled: false,
    assets: [{ uri }],
  });
};

describe('DoctorLicenseUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders title and has disabled Upload button initially', () => {
    const { getByText, UNSAFE_getAllByType } = render(
      <DoctorLicenseUpload theme={baseTheme} userId="u1" onVerified={jest.fn()} />
    );

    expect(getByText('Upload Medical License')).toBeTruthy();
    const uploadBtnText = getByText('Upload and Verify');
    const uploadBtnTouchable = UNSAFE_getAllByType(TouchableOpacity)[1]; // second touchable is the Upload button
    expect(uploadBtnTouchable.props.disabled).toBe(true);
    expect(uploadBtnText).toBeTruthy();
  });

  it('success: picks image, enables button, uploads, stores approval, calls onVerified, and shows success', async () => {
    const onVerified = jest.fn();
    const userId = 'doctor-123';
    mockPickResult('file:///ok.jpg');
    verifyDoctorLicense.mockResolvedValueOnce({ success: true });

    const { getByText, UNSAFE_getAllByType, queryByText } = render(
      <DoctorLicenseUpload theme={baseTheme} userId={userId} onVerified={onVerified} />
    );

    // Press the upload zone to pick image (first TouchableOpacity)
    const [uploadZoneTouchable] = UNSAFE_getAllByType(TouchableOpacity);
    await act(async () => {
      fireEvent.press(uploadZoneTouchable);
    });

    // Upload button should be enabled now
    const uploadButton = UNSAFE_getAllByType(TouchableOpacity)[1];
    expect(uploadButton.props.disabled).toBe(false);

    // Press upload
    await act(async () => {
      fireEvent.press(uploadButton);
    });

    expect(verifyDoctorLicense).toHaveBeenCalledTimes(1);
    expect(verifyDoctorLicense).toHaveBeenCalledWith('file:///ok.jpg', userId);

    expect(setItem).toHaveBeenCalledWith('isApproved', '1');
    expect(onVerified).toHaveBeenCalled();

    // Shows success result
    expect(queryByText(/Verification Result: success/i)).toBeTruthy();
  });

  it('failure: shows failure result and does not store approval nor call onVerified', async () => {
    const onVerified = jest.fn();
    mockPickResult('file:///bad.jpg');
    verifyDoctorLicense.mockResolvedValueOnce({ success: false });

    const { getByText, UNSAFE_getAllByType, queryByText } = render(
      <DoctorLicenseUpload theme={baseTheme} userId="u2" onVerified={onVerified} />
    );

    const [uploadZoneTouchable] = UNSAFE_getAllByType(TouchableOpacity);
    await act(async () => {
      fireEvent.press(uploadZoneTouchable);
    });

    const uploadButton = UNSAFE_getAllByType(TouchableOpacity)[1];
    await act(async () => {
      fireEvent.press(uploadButton);
    });

    expect(verifyDoctorLicense).toHaveBeenCalledWith('file:///bad.jpg', 'u2');
    expect(setItem).not.toHaveBeenCalled();
    expect(onVerified).not.toHaveBeenCalled();

    expect(queryByText(/Verification Result: failure/i)).toBeTruthy();
  });

  it('missing userId: alerts and does not call API', async () => {
    mockPickResult('file:///has-image.jpg');

    const { UNSAFE_getAllByType } = render(
      <DoctorLicenseUpload theme={baseTheme} userId={null} onVerified={jest.fn()} />
    );

    const [uploadZoneTouchable] = UNSAFE_getAllByType(TouchableOpacity);
    await act(async () => {
      fireEvent.press(uploadZoneTouchable);
    });

    const uploadButton = UNSAFE_getAllByType(TouchableOpacity)[1];
    await act(async () => {
      fireEvent.press(uploadButton);
    });

    expect(Alert.alert).toHaveBeenCalled();
    expect(verifyDoctorLicense).not.toHaveBeenCalled();
  });
});
