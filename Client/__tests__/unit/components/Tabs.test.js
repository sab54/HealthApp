/**
 * Tabs.test.js
 *
 * What This Test File Covers:
 *
 * 1. Basic Rendering
 *    - Renders all tabs and displays correct labels.
 *
 * 2. Tab Selection Behavior
 *    - Calls onTabSelect when a tab is pressed.
 *    - Does not call onTabSelect for disabled tabs.
 *
 * 3. UI & Theming
 *    - Applies theming to selected, unselected, and disabled states.
 *
 * 4. Animation Styles
 *    - Animates indicator position on tab change.
 *
 * 5. Accessibility
 *    - Tabs are accessible with correct roles and states.
 *
 * 6. Scrollable Tabs
 *    - Renders scrollable container when `scrollable` is true.
 *
 * 7. Snapshots
 *    - Matches snapshot with basic theme.
 */

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import Tabs from '@/components/Tabs';
import { Animated } from 'react-native';
import { TouchableOpacity } from 'react-native';

jest.useFakeTimers();
jest.spyOn(Animated, 'spring').mockImplementation(() => ({
  start: (cb) => cb && cb(),
}));

const mockTabs = [
  { key: 'home', label: 'Home' },
  { key: 'search', label: 'Search' },
  { key: 'profile', label: 'Profile' },
];

const themedTabs = [
  { key: 'home', label: 'Home' },
  { key: 'settings', label: 'Settings', disabled: true },
];

const theme = {
  text: '#333',
  primary: '#007AFF',
  surface: '#fafafa',
  border: '#ddd',
  muted: '#aaa',
};

describe('Tabs Component', () => {
  const onTabSelectMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all tab labels', () => {
    const { getByText } = render(
      <Tabs tabs={mockTabs} selectedTab="home" onTabSelect={onTabSelectMock} theme={theme} />
    );

    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Search')).toBeTruthy();
    expect(getByText('Profile')).toBeTruthy();
  });

  it('calls onTabSelect when a tab is pressed', () => {
    const { getByText } = render(
      <Tabs tabs={mockTabs} selectedTab="home" onTabSelect={onTabSelectMock} theme={theme} />
    );

    fireEvent.press(getByText('Profile'));
    expect(onTabSelectMock).toHaveBeenCalledWith('profile');
  });

  it('does not call onTabSelect for disabled tabs', () => {
    const { getByText } = render(
      <Tabs tabs={themedTabs} selectedTab="home" onTabSelect={onTabSelectMock} theme={theme} />
    );

    fireEvent.press(getByText('Settings'));
    expect(onTabSelectMock).not.toHaveBeenCalled();
  });

  it('applies theme styles to selected and disabled tabs', () => {
    const { getByText } = render(
      <Tabs tabs={themedTabs} selectedTab="home" onTabSelect={onTabSelectMock} theme={theme} />
    );

    const homeTab = getByText('Home');
    const settingsTab = getByText('Settings');

    expect(homeTab.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          color: theme.primary,
          fontWeight: '600',
        }),
      ])
    );

    expect(settingsTab.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          color: theme.muted,
        }),
      ])
    );
  });

  it('animates the indicator on selectedTab change', () => {
    const { rerender } = render(
      <Tabs tabs={mockTabs} selectedTab="home" onTabSelect={onTabSelectMock} theme={theme} />
    );

    rerender(
      <Tabs tabs={mockTabs} selectedTab="search" onTabSelect={onTabSelectMock} theme={theme} />
    );

    expect(Animated.spring).toHaveBeenCalledWith(
      expect.any(Animated.Value),
      expect.objectContaining({ toValue: 1, useNativeDriver: false })
    );
  });

  it('assigns correct accessibility props', () => {
    const { UNSAFE_queryAllByType } = render(
      <Tabs tabs={themedTabs} selectedTab="home" onTabSelect={onTabSelectMock} theme={theme} />
    );

    const touchables = UNSAFE_queryAllByType(TouchableOpacity);

    const homeButton = touchables.find(
      (node) => node.props.accessibilityState?.selected === true
    );
    const settingsButton = touchables.find(
      (node) => node.props.accessibilityState?.disabled === true
    );

    expect(homeButton).toBeTruthy();
    expect(homeButton.props.accessibilityRole).toBe('button');
    expect(homeButton.props.accessibilityState).toMatchObject({ selected: true }); // ✅ Only assert present fields

    expect(settingsButton).toBeTruthy();
    expect(settingsButton.props.accessibilityRole).toBe('button');
    expect(settingsButton.props.accessibilityState).toEqual({ selected: false, disabled: true }); // ✅ disabled = true is explicitly present
  });


  it('renders scrollable container when scrollable is true', () => {
    const { UNSAFE_getByType } = render(
      <Tabs tabs={mockTabs} selectedTab="home" onTabSelect={onTabSelectMock} theme={theme} scrollable />
    );

    const scrollView = UNSAFE_getByType(require('react-native').ScrollView);
    expect(scrollView.props.horizontal).toBe(true);
  });

  it('matches snapshot', () => {
    const { toJSON } = render(
      <Tabs tabs={mockTabs} selectedTab="home" onTabSelect={onTabSelectMock} theme={theme} />
    );

    expect(toJSON()).toMatchSnapshot();
  });
});
