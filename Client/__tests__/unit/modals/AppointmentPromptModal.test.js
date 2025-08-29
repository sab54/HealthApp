// __tests__/unit/modals/AppointmentPromptModal.test.js

/**
 * AppointmentPromptModal.test.js
 *
 * What This Test File Covers:
 *
 * 1. Basic Rendering & Prefill
 *    - Renders title and inputs when visible=true.
 *    - Prefills Patient Name from props.
 *
 * 2. Prop Updates
 *    - Updates patient name when initialPatientName changes while visible.
 *
 * 3. Validation
 *    - Shows Alert when required fields are missing on submit.
 *
 * 4. Successful Submit
 *    - Calls onSubmit with full form payload and then calls onClose.
 */

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AppointmentPromptModal from 'src/modals/AppointmentPromptModal';

const baseTheme = {
  surface: '#ffffff',
  text: '#111111',
  input: '#f7f7f7',
  inputText: '#111111',
  placeholder: '#999999',
  buttonPrimaryBackground: '#2563eb',
  buttonPrimaryText: '#ffffff',
};

const setup = (props = {}) => {
  const onClose = jest.fn();
  const onSubmit = jest.fn();

  const utils = render(
    <AppointmentPromptModal
      visible
      onClose={onClose}
      onSubmit={onSubmit}
      theme={baseTheme}
      patientName="Alice"
      {...props}
    />
  );

  return { ...utils, onClose, onSubmit };
};

describe('AppointmentPromptModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  it('renders when visible=true and pre-fills patient name', () => {
    const { getByText, getByPlaceholderText, getByDisplayValue } = setup({ visible: true });

    expect(getByText('Book Doctor Appointment')).toBeTruthy();

    // Inputs present
    expect(getByPlaceholderText('Patient Name')).toBeTruthy();
    expect(getByPlaceholderText('Appointment Date (YYYY-MM-DD)')).toBeTruthy();
    expect(getByPlaceholderText('Appointment Time (HH:MM)')).toBeTruthy();
    expect(getByText('Book Appointment')).toBeTruthy();

    // Prefilled name
    expect(getByDisplayValue('Alice')).toBeTruthy();
  });

  it('updates patient name when prop changes while visible', () => {
    const { rerender, getByDisplayValue } = setup({ visible: true, patientName: 'Alice' });

    // Change prop
    rerender(
      <AppointmentPromptModal
        visible
        onClose={jest.fn()}
        onSubmit={jest.fn()}
        theme={baseTheme}
        patientName="Bob"
      />
    );

    expect(getByDisplayValue('Bob')).toBeTruthy();
  });

  it('shows alert if required fields are missing on submit', () => {
    const { getByText } = setup({ visible: true, patientName: 'Alice' });

    fireEvent.press(getByText('Book Appointment'));

    expect(Alert.alert).toHaveBeenCalledTimes(1);
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please fill in all required fields');
  });

  it('submits with valid data and calls onClose', async () => {
    const { getByPlaceholderText, getByText, onSubmit, onClose } = setup({
      visible: true,
      patientName: 'Carol',
    });

    // Fill required fields
    fireEvent.changeText(getByPlaceholderText('Patient Name'), 'Carol');
    fireEvent.changeText(getByPlaceholderText('Appointment Date (YYYY-MM-DD)'), '2025-09-01');
    fireEvent.changeText(getByPlaceholderText('Appointment Time (HH:MM)'), '14:30');
    fireEvent.changeText(getByPlaceholderText('Mode of Appointment'), 'Video');
    fireEvent.changeText(getByPlaceholderText('Purpose of Visit'), 'Follow-up');
    fireEvent.changeText(getByPlaceholderText('Previous Visit (Yes/No)'), 'Yes');
    fireEvent.changeText(getByPlaceholderText('Notes (Optional)'), 'Prefers afternoon');

    await act(async () => {
      fireEvent.press(getByText('Book Appointment'));
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      patientName: 'Carol',
      appointmentDate: '2025-09-01',
      appointmentTime: '14:30',
      mode: 'Video',
      purpose: 'Follow-up',
      previousVisit: 'Yes',
      notes: 'Prefers afternoon',
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
