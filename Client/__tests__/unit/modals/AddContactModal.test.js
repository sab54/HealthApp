// __tests__/unit/modals/AddContactModal.test.js

/**
 * AddContactModal.test.js
 *
 * What This Test File Covers:
 *
 * 1. Basic Rendering & Visibility
 *    - Renders title, inputs, and save button when visible=true.
 *    - Hides content when visible=false.
 *
 * 2. Contact List Toggle & Population
 *    - Tapping "Pick from Contacts" shows the list populated from expo-contacts.
 *
 * 3. Selecting a Contact
 *    - Selecting an item fills the Name and Phone Number inputs.
 *
 * 4. Saving a Contact (Happy Path)
 *    - With valid inputs, calls onAdd with payload and then onClose.
 */

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import * as Contacts from 'expo-contacts';
import AddContactModal from 'src/modals/AddContactModal';

const baseTheme = {
  surface: '#fff',
  text: '#111',
  input: '#f7f7f7',
  inputText: '#111',
  placeholder: '#999',
  link: '#007bff',
  border: '#e5e5e5',
  mutedText: '#666',
};

const setup = (props = {}) => {
  const onClose = jest.fn();
  const onAdd = jest.fn();

  const utils = render(
    <AddContactModal
      visible
      onClose={onClose}
      onAdd={onAdd}
      theme={baseTheme}
      {...props}
    />
  );
  return { ...utils, onClose, onAdd };
};

describe('AddContactModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders content when visible=true and hides when visible=false', () => {
    const { getByText, queryByText, rerender } = setup({ visible: true });

    // Visible: title present
    expect(getByText('Add Emergency Contact')).toBeTruthy();
    expect(getByText('Pick from Contacts')).toBeTruthy();
    expect(getByText('Save Contact')).toBeTruthy();

    // Hidden: title not present
    rerender(
      <AddContactModal
        visible={false}
        onClose={jest.fn()}
        onAdd={jest.fn()}
        theme={baseTheme}
      />
    );
    expect(queryByText('Add Emergency Contact')).toBeNull();
  });

  it('shows contacts after tapping Pick from Contacts and populates list from expo-contacts', async () => {
    // Mock contacts returned by expo-contacts
    jest.spyOn(Contacts, 'getContactsAsync').mockResolvedValue({
      data: [
        {
          id: '1',
          name: 'Alice',
          phoneNumbers: [{ number: '+1 555-1111' }],
        },
        {
          id: '2',
          name: 'Bob',
          phoneNumbers: [{ number: '+1 555-2222' }],
        },
      ],
      hasNextPage: false,
    });

    const { getByText, findByText } = setup({ visible: true });

    // Open list
    fireEvent.press(getByText('Pick from Contacts'));
    expect(getByText('Hide Contact List')).toBeTruthy();

    // Wait for items to appear
    expect(await findByText('Alice')).toBeTruthy();
    expect(await findByText('+1 555-1111')).toBeTruthy();
    expect(await findByText('Bob')).toBeTruthy();
    expect(await findByText('+1 555-2222')).toBeTruthy();
  });

  it('selecting a contact fills the form fields', async () => {
    jest.spyOn(Contacts, 'getContactsAsync').mockResolvedValue({
      data: [
        {
          id: '3',
          name: 'Charlie',
          phoneNumbers: [{ number: '(020) 7000 0000' }],
        },
      ],
      hasNextPage: false,
    });

    const { getByText, findByText, getByDisplayValue } = setup({ visible: true });

    fireEvent.press(getByText('Pick from Contacts'));
    const item = await findByText('Charlie');
    fireEvent.press(item);

    // Inputs should reflect chosen contact
    expect(getByDisplayValue('Charlie')).toBeTruthy();
    expect(getByDisplayValue('(020) 7000 0000')).toBeTruthy();
  });

  it('pressing Save Contact with valid inputs calls onAdd and onClose', async () => {
    const { getByPlaceholderText, getByText, onAdd, onClose } = setup({ visible: true });

    // Fill inputs
    fireEvent.changeText(getByPlaceholderText('Name'), 'Dana');
    fireEvent.changeText(getByPlaceholderText('Phone Number'), '+44 7700 900123');

    // Save
    await act(async () => {
      fireEvent.press(getByText('Save Contact'));
    });

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith({
      name: 'Dana',
      number: '+44 7700 900123',
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
