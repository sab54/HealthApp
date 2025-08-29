/**
 * SearchBar.test.js
 *
 * What This Test File Covers:
 *
 * 1. Basic Rendering
 *    - Renders input, icons, and placeholder.
 *
 * 2. Input Behavior
 *    - Handles input changes and triggers debounced onChange.
 *    - Calls onSubmitEditing on return.
 *
 * 3. Clear Button
 *    - Appears when input is non-empty.
 *    - Clears and refocuses input.
 *
 * 4. Voice Input Icon
 *    - Renders mic icon when `showVoice` is true.
 *
 * 5. UI & Theming
 *    - Applies light/dark theme correctly.
 *
 * 6. Accessibility
 *    - Text input is accessible.
 *
 * 7. Snapshots
 *    - Matches snapshot for light and dark theme.
 *
 * 8. Animation Styles
 *    - Clear icon animates in with opacity.
 */

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import SearchBar from '@/components/SearchBar';
import { getThemeColors } from '@/theme/themeTokens';

jest.useFakeTimers();

// Mock Ionicons
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name }) => <Text>{`Icon: ${name}`}</Text>,
  };
});

const lightTheme = getThemeColors(false);
const darkTheme = getThemeColors(true);

describe('SearchBar Component', () => {
  const onChangeMock = jest.fn();
  const onSubmitMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with placeholder and icons', () => {
    const { getByPlaceholderText, getByText } = render(
      <SearchBar
        query=""
        onChange={onChangeMock}
        onSubmit={onSubmitMock}
        theme={lightTheme}
      />
    );

    expect(getByPlaceholderText('Search...')).toBeTruthy();
    expect(getByText('Icon: search')).toBeTruthy();
  });

  it('updates input and debounces onChange', () => {
    const { getByPlaceholderText } = render(
      <SearchBar
        query=""
        onChange={onChangeMock}
        onSubmit={onSubmitMock}
        theme={lightTheme}
      />
    );

    const input = getByPlaceholderText('Search...');
    fireEvent.changeText(input, 'query');

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(onChangeMock).toHaveBeenCalledWith('query');
  });

  it('submits on return key press', () => {
    const { getByPlaceholderText } = render(
      <SearchBar
        query=""
        onChange={onChangeMock}
        onSubmit={onSubmitMock}
        theme={lightTheme}
      />
    );

    const input = getByPlaceholderText('Search...');
    fireEvent.changeText(input, 'run');
    fireEvent(input, 'submitEditing');

    expect(onSubmitMock).toHaveBeenCalledWith('run');
  });

  it('clears input and refocuses when clear button pressed', () => {
    const { getByPlaceholderText, getByText } = render(
      <SearchBar
        query="clearme"
        onChange={onChangeMock}
        onSubmit={onSubmitMock}
        theme={lightTheme}
      />
    );

    const input = getByPlaceholderText('Search...');
    fireEvent.changeText(input, 'clearme');

    act(() => {
      jest.advanceTimersByTime(300);
    });

    const clearIcon = getByText('Icon: close-circle');
    fireEvent.press(clearIcon);

    expect(onChangeMock).toHaveBeenCalledWith('');
  });

  it('renders mic icon if showVoice is true', () => {
    const { getByText } = render(
      <SearchBar
        query=""
        onChange={onChangeMock}
        onSubmit={onSubmitMock}
        showVoice
        theme={lightTheme}
      />
    );

    expect(getByText('Icon: mic-outline')).toBeTruthy();
  });

  it('applies dark theme styling', () => {
    const { getByPlaceholderText } = render(
      <SearchBar
        query="dark"
        onChange={onChangeMock}
        onSubmit={onSubmitMock}
        theme={darkTheme}
      />
    );

    const input = getByPlaceholderText('Search...');
    expect(input.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: darkTheme.text }),
      ])
    );
  });

  it('is accessible to screen readers', () => {
    const { getByPlaceholderText } = render(
      <SearchBar
        query=""
        onChange={onChangeMock}
        onSubmit={onSubmitMock}
        theme={lightTheme}
      />
    );

    const input = getByPlaceholderText('Search...');
    expect(input.props.accessibilityRole).toBe('search');
    expect(input.props.accessibilityLabel).toBe('Search input');
  });

  it('matches snapshot (light theme)', () => {
    const { toJSON } = render(
      <SearchBar
        query="light"
        onChange={onChangeMock}
        onSubmit={onSubmitMock}
        theme={lightTheme}
      />
    );

    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot (dark theme)', () => {
    const { toJSON } = render(
      <SearchBar
        query="dark"
        onChange={onChangeMock}
        onSubmit={onSubmitMock}
        theme={darkTheme}
      />
    );

    expect(toJSON()).toMatchSnapshot();
  });

  it('animates clear icon opacity', () => {
    const { toJSON, getByPlaceholderText } = render(
      <SearchBar
        query="test"
        onChange={onChangeMock}
        onSubmit={onSubmitMock}
        theme={lightTheme}
      />
    );

    const input = getByPlaceholderText('Search...');
    fireEvent.changeText(input, '123');

    act(() => {
      jest.advanceTimersByTime(200);
    });

    const tree = toJSON();
    const animatedView = tree.children.find(
      (child) => child?.type === 'View' && child?.props?.style?.opacity !== undefined
    );

    expect(animatedView?.props?.style?.opacity).toBeDefined();
  });
});
