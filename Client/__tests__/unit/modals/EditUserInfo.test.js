// __tests__/unit/modals/EditUserInfoModal.test.js

/**
 * EditUserInfoModal.test.js
 *
 * What This Test File Covers:
 *
 * 1. Basic Rendering & Visibility
 *    - Renders title and inputs when visible=true.
 *    - Hides content when visible=false.
 *
 * 2. Prefill & Reset on Open
 *    - Prefills first/last name from props.
 *    - Resets fields to new props when reopened with different values.
 *
 * 3. Save (Happy Path)
 *    - Calls onSave(first, last) and onClose when both fields are non-empty.
 *
 * 4. Save (Validation)
 *    - Does not call onSave/onClose when either field is empty.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import EditUserInfoModal from 'src/modals/EditUserInfo';

describe('EditUserInfoModal', () => {
  const baseProps = {
    visible: true,
    onClose: jest.fn(),
    onSave: jest.fn(),
    firstName: 'Ada',
    lastName: 'Lovelace',
    isDarkMode: false,
  };

  const renderModal = (override = {}) =>
    render(<EditUserInfoModal {...baseProps} {...override} />);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title and inputs when visible=true; hides when visible=false', () => {
    const { getByText, getByPlaceholderText, rerender, queryByText } = renderModal();

    expect(getByText('Edit User Info')).toBeTruthy();
    expect(getByPlaceholderText('Enter first name')).toBeTruthy();
    expect(getByPlaceholderText('Enter last name')).toBeTruthy();
    expect(getByText('Save')).toBeTruthy();

    rerender(
      <EditUserInfoModal
        {...baseProps}
        visible={false}
      />
    );
    expect(queryByText('Edit User Info')).toBeNull();
  });

  it('prefills names from props and resets on reopen with new props', () => {
    const { getByDisplayValue, getByPlaceholderText, rerender } = renderModal();

    // Prefilled from props
    expect(getByDisplayValue('Ada')).toBeTruthy();
    expect(getByDisplayValue('Lovelace')).toBeTruthy();

    // User edits fields
    fireEvent.changeText(getByPlaceholderText('Enter first name'), 'Grace');
    fireEvent.changeText(getByPlaceholderText('Enter last name'), 'Hopper');

    // Close then reopen with new props -> should reset to new values
    rerender(
      <EditUserInfoModal
        {...baseProps}
        visible={false}
      />
    );
    rerender(
      <EditUserInfoModal
        {...baseProps}
        visible
        firstName="Alan"
        lastName="Turing"
      />
    );

    expect(getByDisplayValue('Alan')).toBeTruthy();
    expect(getByDisplayValue('Turing')).toBeTruthy();
  });

  it('calls onSave with names and then onClose when Save is pressed and both fields are non-empty', () => {
    const onSave = jest.fn();
    const onClose = jest.fn();
    const { getByPlaceholderText, getByText } = renderModal({ onSave, onClose });

    fireEvent.changeText(getByPlaceholderText('Enter first name'), 'Marie');
    fireEvent.changeText(getByPlaceholderText('Enter last name'), 'Curie');

    fireEvent.press(getByText('Save'));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith('Marie', 'Curie');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not save when a field is empty', () => {
    const onSave = jest.fn();
    const onClose = jest.fn();
    const { getByPlaceholderText, getByText } = renderModal({
      onSave,
      onClose,
      firstName: '',
      lastName: '',
    });

    // Leave first name empty, only enter last name
    fireEvent.changeText(getByPlaceholderText('Enter last name'), 'Einstein');

    fireEvent.press(getByText('Save'));

    expect(onSave).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
