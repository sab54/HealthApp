// __tests__/unit/modals/AppointmentPromptModal.test.js

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
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
    const { getByText, getByPlaceholderText, getByDisplayValue } = setup();

    expect(getByText('Book Doctor Appointment')).toBeTruthy();

    // Inputs present
    expect(getByPlaceholderText('Patient Name')).toBeTruthy();
    expect(getByText('Select Appointment Date')).toBeTruthy();
    expect(getByText('Select Appointment Time')).toBeTruthy();
    expect(getByText('Book Appointment')).toBeTruthy();

    // Prefilled name
    expect(getByDisplayValue('Alice')).toBeTruthy();
  });

  it('updates patient name when prop changes while visible', () => {
    const { rerender, getByDisplayValue } = setup({ patientName: 'Alice' });

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
    const { getByText } = setup({ patientName: 'Alice' });

    fireEvent.press(getByText('Book Appointment'));

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please fill in all required fields');
  });

  // Adjusted to align with current modal behavior (date/time selection is required before submit)
  it('does not call onSubmit without date/time selected and shows validation alert', () => {
    const { getByPlaceholderText, getByText, onSubmit, onClose } = setup({
      patientName: 'Carol',
    });

    // Fill text inputs (but not date/time)
    fireEvent.changeText(getByPlaceholderText('Patient Name'), 'Carol');
    fireEvent.changeText(getByPlaceholderText('Mode of Appointment'), 'Video');
    fireEvent.changeText(getByPlaceholderText('Purpose of Visit'), 'Follow-up');
    fireEvent.changeText(getByPlaceholderText('Previous Visit (Yes/No)'), 'Yes');
    fireEvent.changeText(getByPlaceholderText('Notes (Optional)'), 'Prefers afternoon');

    fireEvent.press(getByText('Book Appointment'));

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please fill in all required fields');
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
