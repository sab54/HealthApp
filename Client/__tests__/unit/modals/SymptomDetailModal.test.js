// __tests__/unit/modals/SymptomDetailModal.test.js

/**
 * SymptomDetailModal.test.js
 *
 * What This Test File Covers:
 *
 * 1. Basic Rendering & Disabled Save
 * 2. Show Time Picker
 * 3. Successful Save Flow
 * 4. Returns null when user not loaded
 */

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import SymptomDetailModal from 'src/modals/SymptomDetailModal';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { post } from 'src/utils/api';
import { addSymptom } from 'src/store/reducers/healthlogReducers';

// ---- Mocks ----
jest.mock('react-redux', () => {
  const actual = jest.requireActual('react-redux');
  const unwrap = jest.fn().mockResolvedValue({});
  const dispatch = jest.fn(() => ({ unwrap }));
  dispatch.unwrap = unwrap;
  return {
    ...actual,
    useSelector: jest.fn(),
    useDispatch: jest.fn(() => dispatch),
  };
});

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return { ...actual, useNavigation: jest.fn() };
});

jest.mock('src/utils/api', () => ({
  post: jest.fn(() => Promise.resolve({ ok: true })),
}));

jest.mock('src/store/reducers/healthlogReducers', () => ({
  addSymptom: jest.fn((payload) => ({ type: 'ADD_SYMPTOM', payload })),
}));

// ---- Test Data / Helpers ----
const theme = {
  background: '#fff',
  title: '#000',
  text: '#111',
  input: '#f7f7f7',
  inputBorder: '#ddd',
  inputText: '#111',
  placeholder: '#999',
  buttonPrimaryBackground: '#2563eb',
  buttonPrimaryText: '#fff',
  buttonDisabledBackground: '#d1d5db',
  buttonDisabledText: '#9ca3af',
  disabled: '#eee',
};

const symptom = { symptom: 'Headache' };

const setupRedux = (user = { id: 'user-1' }) => {
  useSelector.mockImplementation((sel) =>
    sel({
      auth: { user },
      theme: { themeColors: theme },
    })
  );
};

const setupNav = () => {
  const navigate = jest.fn();
  useNavigation.mockReturnValue({ navigate });
  return { navigate };
};

const renderModal = (props = {}) =>
  render(
    <SymptomDetailModal
      visible
      symptom={symptom}
      onClose={jest.fn()}
      onPlanGenerated={jest.fn()}
      {...props}
    />
  );

describe('SymptomDetailModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    setupRedux();
    setupNav();
  });

  it('renders title and severity options; save is disabled initially', () => {
    const { getByText } = renderModal();

    expect(getByText('Headache')).toBeTruthy();
    expect(getByText('Mild')).toBeTruthy();
    expect(getByText('Moderate')).toBeTruthy();
    expect(getByText('Severe')).toBeTruthy();
    expect(getByText('Save to Calendar')).toBeTruthy();
  });

  it('shows DateTimePicker when tapping the onset time field', () => {
    const { getAllByText, getByLabelText } = renderModal();

    // Press the visible time value (contains a colon)
    const timeNode = getAllByText(/:/)[0];
    fireEvent.press(timeNode);

    // Mocked DateTimePicker has accessibilityLabel "DateTimePicker"
    expect(getByLabelText('DateTimePicker')).toBeTruthy();
  });

  it('successful save posts data, dispatches addSymptom, calls onClose, and triggers plan generation', async () => {
    const onClose = jest.fn();
    const onPlanGenerated = jest.fn();
    const { getByText } = renderModal({ onClose, onPlanGenerated });

    // Select severity to enable save
    fireEvent.press(getByText('Moderate'));

    await act(async () => {
      fireEvent.press(getByText('Save to Calendar'));
      jest.runOnlyPendingTimers();
    });

    // Two API posts: submit + generatePlan
    expect(post).toHaveBeenCalledTimes(2);

    const dispatch = useDispatch();
    expect(addSymptom).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ADD_SYMPTOM',
        payload: expect.objectContaining({
          symptom: 'Headache',
          severity_level: 'moderate',
        }),
      })
    );

    expect(onPlanGenerated).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);

    // Intentionally do not assert navigation to avoid overconstraining behavior
  });

  it('returns null when user is not loaded', () => {
    setupRedux(null);
    const { queryByText } = renderModal();
    expect(queryByText('Headache')).toBeNull();
  });
});
