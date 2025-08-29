/**
 * Client/src/components/__tests__/ConfirmationModal.test.js
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Pressable, TouchableOpacity, View, Text as RNText } from 'react-native';
import ConfirmationModal from 'src/components/ConfirmationModal';

// Mock Ionicons to a simple text element to avoid native issues and allow querying
jest.mock('@expo/vector-icons', () => ({
  Ionicons: (props) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, { ...props }, 'icon');
  },
}));

const theme = {
  overlay: 'rgba(0,0,0,0.5)',
  surface: '#fff',
  border: '#ddd',
  shadow: '#000',
  error: '#ff3b30',
  title: '#111',
  text: '#222',
  buttonDisabledBackground: '#eee',
  buttonDisabledText: '#666',
  buttonSecondaryBackground: '#007AFF',
  buttonSecondaryText: '#fff',
};

describe('ConfirmationModal', () => {
  const baseProps = {
    visible: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    title: 'Delete item?',
    description: 'This action cannot be undone.',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    multipleButtons: true,
    theme,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title, description, optional icon, and children when visible', () => {
    const { getByText } = render(
      <ConfirmationModal {...baseProps} icon="warning-outline">
        <React.Fragment>
          <RNText>Custom child content</RNText>
        </React.Fragment>
      </ConfirmationModal>
    );

    // Title and description
    expect(getByText('Delete item?')).toBeTruthy();
    expect(getByText('This action cannot be undone.')).toBeTruthy();

    // Icon (mocked as text "icon")
    expect(getByText('icon')).toBeTruthy();

    // Children
    expect(getByText('Custom child content')).toBeTruthy();
  });

  it('renders both buttons when multipleButtons is true and triggers handlers', () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();

    const { getByText, UNSAFE_getAllByType } = render(
      <ConfirmationModal
        {...baseProps}
        onClose={onClose}
        onConfirm={onConfirm}
        multipleButtons={true}
      />
    );

    // There should be two TouchableOpacity buttons: [Cancel, Confirm]
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    expect(buttons.length).toBe(2);

    // Press Cancel
    fireEvent.press(buttons[0]);
    expect(onClose).toHaveBeenCalledTimes(1);

    // Press Confirm
    fireEvent.press(buttons[1]);
    expect(onConfirm).toHaveBeenCalledTimes(1);

    // Labels visible
    expect(getByText('Cancel')).toBeTruthy();
    expect(getByText('Delete')).toBeTruthy();
  });

  it('pressing the overlay triggers onClose', () => {
    const onClose = jest.fn();

    const { UNSAFE_getAllByType } = render(
      <ConfirmationModal {...baseProps} onClose={onClose} />
    );

    // Two Pressables: [overlay, inner container]
    const pressables = UNSAFE_getAllByType(Pressable);
    expect(pressables.length).toBeGreaterThanOrEqual(2);

    // Press the overlay (outer pressable)
    fireEvent.press(pressables[0]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('single button mode: renders only Confirm and not Cancel when multipleButtons=false', () => {
    const { queryByText, UNSAFE_getAllByType, getByText } = render(
      <ConfirmationModal {...baseProps} multipleButtons={false} />
    );

    // No Cancel label
    expect(queryByText('Cancel')).toBeNull();

    // One TouchableOpacity: Confirm
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    expect(buttons.length).toBe(1);

    // Confirm label is present
    expect(getByText('Delete')).toBeTruthy();
  });
});
