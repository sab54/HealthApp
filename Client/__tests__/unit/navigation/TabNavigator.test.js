// __tests__/unit/navigation/TabNavigator.test.js
/**
 * TabNavigator.test.js — extra tests
 *
 * New coverage added:
 * 4) Header Left opens sidebar; tapping "Settings" navigates correctly.
 * 5) Theme toggle dispatches APPLY_THEME_MODE and closes the sidebar.
 * 6) Logout dispatches LOGOUT from the sidebar.
 *
 * (The file still includes the original 3 tests for initial route
 *  and Add Symptom button behavior.)
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useSelector, useDispatch } from 'react-redux';
import TabNavigator from '../../../src/navigation/TabNavigator';

// --- Share a mock navigate so we can assert calls ---
const mockNavigate = jest.fn();

// --- Navigation mocks ---
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    useNavigation: () => ({ navigate: mockNavigate }),
    // No-op to avoid render loops in tests
    useFocusEffect: jest.fn(() => {}),
  };
});

// Fake bottom-tabs that renders:
// - initialRoute component
// - the custom tabBarButton for "ConsultNow"
// - headerLeft / headerRight from screenOptions so we can press them
jest.mock('@react-navigation/bottom-tabs', () => {
  const React = require('react');

  const Screen = (props) => React.createElement(React.Fragment, null, null);

  const Navigator = ({ initialRouteName, children, screenOptions }) => {
    const screens = React.Children.toArray(children);

    // Gather options from screenOptions (function or object)
    const routeCtx = { route: { name: initialRouteName } };
    const opts =
      typeof screenOptions === 'function'
        ? screenOptions(routeCtx)
        : (screenOptions || {});

    // Render initial route component
    const initial =
      screens.find((el) => el?.props?.name === initialRouteName) || screens[0];
    const InitialComp = initial?.props?.component;

    // Also render the custom tab button for ConsultNow
    const consult = screens.find((el) => el?.props?.name === 'ConsultNow');
    const consultOpts =
      (typeof consult?.props?.options === 'function'
        ? consult.props.options({})
        : consult?.props?.options) || {};
    const TabBarButton = consultOpts.tabBarButton;

    // headerLeft / headerRight are functions that return elements
    const headerLeftEl = typeof opts.headerLeft === 'function' ? opts.headerLeft() : null;
    const headerRightEl = typeof opts.headerRight === 'function' ? opts.headerRight() : null;

    return React.createElement(
      React.Fragment,
      null,
      // headerLeft/right first so we can interact before main component if needed
      headerLeftEl,
      headerRightEl,
      InitialComp ? React.createElement(InitialComp, {}) : null,
      TabBarButton
        ? React.createElement(TabBarButton, {
            accessibilityState: { selected: false },
          })
        : null
    );
  };

  return {
    createBottomTabNavigator: () => ({ Navigator, Screen }),
  };
});

// --- Safe area / icons ---
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
    SafeAreaProvider: ({ children }) => React.createElement(React.Fragment, null, children),
  };
});

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const Ionicons = ({ name }) => React.createElement(Text, null, `icon:${name}`);
  return { Ionicons };
});

// --- Screens used by TabNavigator ---
jest.mock('../../../src/screens/HomeScreen', () => {
  const React = require('react'); const { Text } = require('react-native');
  return () => React.createElement(Text, null, 'Home Screen');
});
jest.mock('../../../src/screens/ResourcesScreen', () => {
  const React = require('react'); const { Text } = require('react-native');
  return () => React.createElement(Text, null, 'Resources Screen');
});
jest.mock('../../../src/screens/DailySymptomTrackingScreen', () => {
  const React = require('react'); const { Text } = require('react-native');
  return () => React.createElement(Text, null, 'Daily Symptom Tracking Screen');
});
jest.mock('../../../src/screens/HealthTrackingScreen', () => {
  const React = require('react'); const { Text } = require('react-native');
  return ({ route }) =>
    React.createElement(Text, null, `Health Tracking (userId=${route?.params?.userId ?? ''})`);
});

// --- Modals used inside TabNavigator ---
jest.mock('../../../src/modals/SymptomsModal', () => {
  const React = require('react');
  const { Text, View } = require('react-native');
  return ({ visible }) =>
    React.createElement(
      View,
      null,
      visible ? React.createElement(Text, null, 'SymptomsModalVisible') : null
    );
});

jest.mock('../../../src/modals/SymptomDetailModal', () => {
  const React = require('react'); const { Text, View } = require('react-native');
  return ({ visible, symptom }) =>
    React.createElement(
      View,
      null,
      visible ? React.createElement(Text, null, `SymptomDetail:${symptom?.symptom}`) : null
    );
});

// --- Redux + actions ---
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));
jest.mock('../../../src/store/actions/loginActions', () => ({
  logout: jest.fn(() => ({ type: 'LOGOUT' })),
}));
jest.mock('../../../src/store/actions/themeActions', () => ({
  applyThemeMode: jest.fn((mode) => ({ type: 'APPLY_THEME_MODE', payload: mode })),
}));
jest.mock('../../../src/store/actions/healthlogActions', () => ({
  fetchTodaySymptoms: jest.fn((id) => ({ type: 'FETCH_TODAY_SYMPTOMS', payload: id })),
}));

// --- Redux state builder ---
const baseTheme = {
  surface: '#fff',
  text: '#111',
  title: '#000',
  link: '#1976d2',
  headerBackground: '#f5f5f5',
  card: '#ffffff',
  error: '#ff5252',
};
const makeState = ({
  user = { id: 'u1', first_name: 'Pat' },
  moodToday = null,
  todaySymptoms = [],
  isDarkMode = false,
} = {}) => ({
  auth: { user },
  theme: { themeColors: baseTheme, isDarkMode },
  healthlog: { moodToday, todaySymptoms },
});
const setSelectors = (state) => {
  useSelector.mockImplementation((sel) => sel(state));
};

describe('TabNavigator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockReset();
    const dispatchFn = jest.fn(() => ({ unwrap: jest.fn().mockResolvedValue({}) }));
    useDispatch.mockReturnValue(dispatchFn);
  });

  // 1) Initial route
  it('renders Home as the initial route', async () => {
    setSelectors(makeState());
    const { findByText } = render(<TabNavigator />);
    expect(await findByText('Home Screen')).toBeTruthy();
  });

  // 2) Add Symptom opens modal
  it('opens SymptomsModal when pressing Add Symptom under the max', () => {
    setSelectors(makeState({ todaySymptoms: [] }));

    const { getByText, queryByText } = render(<TabNavigator />);

    expect(queryByText('SymptomsModalVisible')).toBeNull();

    const addLabel = getByText('Add Symptom');
    fireEvent.press(addLabel);

    expect(queryByText('SymptomsModalVisible')).toBeTruthy();
  });

  // 3) Add Symptom disabled at max
  it('does NOT open SymptomsModal when at max unrecovered symptoms', () => {
    const unrecovered = [
      { symptom: 'Headache', recovered_at: null },
      { symptom: 'Cough', recovered_at: null },
      { symptom: 'Fatigue', recovered_at: null },
    ];
    setSelectors(makeState({ todaySymptoms: unrecovered }));

    const { getByText, queryByText } = render(<TabNavigator />);

    const addLabel = getByText('Add Symptom');
    fireEvent.press(addLabel);

    expect(queryByText('SymptomsModalVisible')).toBeNull();
  });

  // 4) Header-left opens sidebar; tapping Settings navigates
  it('opens sidebar via header-left and navigates to Settings', () => {
    setSelectors(makeState());

    const { getByText, queryByText } = render(<TabNavigator />);

    // headerLeft renders an icon:person-circle in our mock
    const avatarIcon = getByText('icon:person-circle');
    fireEvent.press(avatarIcon);

    // Sidebar content appears
    expect(queryByText('Settings')).toBeTruthy();

    // Tap Settings
    const settingsRow = getByText('Settings');
    fireEvent.press(settingsRow);

    expect(mockNavigate).toHaveBeenCalledWith('Settings');
  });

  // 5) Theme toggle dispatches APPLY_THEME_MODE
  it('toggles theme from Light to Dark via sidebar', () => {
    setSelectors(makeState({ isDarkMode: false }));

    const { getByText, queryByText } = render(<TabNavigator />);

    // Open sidebar
    fireEvent.press(getByText('icon:person-circle'));

    // Expect label 'Dark Mode' when currently light
    const themeToggle = getByText('Dark Mode');
    expect(themeToggle).toBeTruthy();

    // Tap it -> should dispatch APPLY_THEME_MODE('dark')
    fireEvent.press(themeToggle);

    const dispatch = useDispatch();
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'APPLY_THEME_MODE',
        payload: 'dark',
      })
    );
  });

  // 6) Logout dispatches LOGOUT
  it('dispatches logout from the sidebar', () => {
    setSelectors(makeState());

    const { getByText, queryByText } = render(<TabNavigator />);

    // Open sidebar
    fireEvent.press(getByText('icon:person-circle'));

    // Tap Logout
    const logoutRow = getByText('Logout');
    fireEvent.press(logoutRow);

    const dispatch = useDispatch();
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'LOGOUT' })
    );
  });
});
