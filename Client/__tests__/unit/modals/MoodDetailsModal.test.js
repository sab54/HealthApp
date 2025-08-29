// __tests__/unit/modals/MoodDetailsModal.test.js

/**
 * MoodDetailsModal.test.js
 *
 * What This Test File Covers:
 *
 * 1. Basic Rendering & Visibility
 *    - Renders title and selected mood when visible=true.
 *    - Hides content when visible=false.
 *
 * 2. Submit (Default Values)
 *    - Calls onSubmit with selectedMood and default slider values (sleep=8, energy=5).
 *
 * 3. Slider Interaction & Submit (Updated Values)
 *    - Changing both sliders updates labels and submit payload.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MoodDetailsModal from 'src/modals/MoodDetailsModal';

// Mock Slider -> simple pressable that triggers onValueChange with a fixed value
jest.mock('@react-native-community/slider', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  const Slider = ({ onValueChange, value }) => (
    <TouchableOpacity
      onPress={() => onValueChange(12)}
    >
      <Text>{`val:${value}`}</Text>
    </TouchableOpacity>
  );
  Slider.displayName = 'MockSlider';
  return Slider;
});

const theme = {
  overlay: 'rgba(0,0,0,0.4)',
  modalBackground: '#fff',
  title: '#111',
  text: '#222',
  primary: '#0a84ff',
  trackBackground: '#e5e5e5',
  buttonPrimaryBackground: '#2563eb',
  buttonPrimaryText: '#fff',
};

const setup = (props = {}) => {
  const onSubmit = jest.fn();
  const utils = render(
    <MoodDetailsModal
      visible
      selectedMood="Happy"
      onSubmit={onSubmit}
      theme={theme}
      {...props}
    />
  );
  return { ...utils, onSubmit };
};

describe('MoodDetailsModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title and mood when visible=true; hides when visible=false', () => {
    const { getByText, queryByText, rerender } = setup({ visible: true });

    expect(getByText('Self-Reflection')).toBeTruthy();
    expect(getByText('Mood: Happy')).toBeTruthy();
    expect(getByText('Sleep hours: 8 hrs')).toBeTruthy();
    expect(getByText('Energy level: 5/10')).toBeTruthy();

    rerender(
      <MoodDetailsModal
        visible={false}
        selectedMood="Happy"
        onSubmit={jest.fn()}
        theme={theme}
      />
    );
    expect(queryByText('Self-Reflection')).toBeNull();
  });

  it('submits with default values (sleep=8, energy=5) when sliders not changed', () => {
    const { getByText, onSubmit } = setup();

    fireEvent.press(getByText('Submit'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith('Happy', 8, 5);
  });

  it('updates labels after slider presses and submits updated values', () => {
    const { getAllByText, getByText, onSubmit } = setup();

    // Select sliders by their displayed value text from the mock
    const sliderValueTexts = getAllByText(/^val:/); // ["val:8", "val:5"]
    // First press -> sleep to 12
    fireEvent.press(sliderValueTexts[0]);
    expect(getByText('Sleep hours: 12 hrs')).toBeTruthy();

    // Second press -> energy to 12
    fireEvent.press(sliderValueTexts[1]);
    expect(getByText('Energy level: 12/10')).toBeTruthy();

    fireEvent.press(getByText('Submit'));
    expect(onSubmit).toHaveBeenCalledWith('Happy', 12, 12);
  });
});
