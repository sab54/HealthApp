// __tests__/unit/navigation/AppNavigator.test.js

import React from 'react';
import { render, act } from '@testing-library/react-native';
import { useSelector, useDispatch } from 'react-redux';
import AppNavigator from '../../../src/navigation/AppNavigator';

// --- Minimal Navigation mocks ---
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    NavigationContainer: ({ children }) => React.createElement(React.Fragment, null, children),
    useNavigationContainerRef: () => ({}),
  };
});

jest.mock('@react-navigation/native-stack', () => {
  const React = require('react');

  // Collect <Screen> elements; Navigator will decide which to render based on initialRouteName
  const Screen = (props) => React.createElement(React.Fragment, null, null);

  const Navigator = ({ initialRouteName, children }) => {
    const all = React.Children.toArray(children);
    const target = all.find((el) => el?.props?.name === initialRouteName) || all[0];
    const Comp = target?.props?.component;
    // If no component prop, try children
    if (Comp) return React.createElement(Comp, {});
    return React.createElement(React.Fragment, null, target?.props?.children || null);
  };

  return {
    createNativeStackNavigator: () => ({ Navigator, Screen }),
  };
});

// --- Gesture + Safe Area ---
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }) => children,
}));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaProvider: ({ children }) => React.createElement(React.Fragment, null, children),
    SafeAreaView: ({ children }) => React.createElement(React.Fragment, null, children),
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});

// --- Native modules touched by the file ---
jest.mock('expo-asset', () => ({ Asset: {} }));
jest.mock('expo-media-library', () => ({}));

// --- Screen stubs (inline factory with in-mock requires) ---
jest.mock('../../../src/screens/onboardingScreen', () => {
  const React = require('react'); const { Text } = require('react-native');
  return () => React.createElement(Text, null, 'OnboardingScreen');
});
jest.mock('../../../src/screens/LoginScreen', () => {
  const React = require('react'); const { Text } = require('react-native');
  return () => React.createElement(Text, null, 'LoginScreen');
});
jest.mock('../../../src/screens/RegistrationScreen', () => {
  const React = require('react'); const { Text } = require('react-native');
  return () => React.createElement(Text, null, 'RegistrationScreen');
});
jest.mock('../../../src/screens/OTPVerificationScreen', () => {
  const React = require('react'); const { Text } = require('react-native');
  return () => React.createElement(Text, null, 'OTPVerificationScreen');
});
jest.mock('../../../src/screens/HealthTrackingScreen', () => {
  const React = require('react'); const { Text } = require('react-native');
  return () => React.createElement(Text, null, 'HealthTrackingScreen');
});
jest.mock('../../../src/screens/HealthlogScreen', () => {
  const React = require('react'); const { Text } = require('react-native');
  return () => React.createElement(Text, null, 'HealthlogScreen');
});
jest.mock('../../../src/screens/SymptomRecoveryPlanScreen', () => {
  const React = require('react'); const { Text } = require('react-native');
  return () => React.createElement(Text, null, 'SymptomRecoveryPlanScreen');
});
jest.mock('../../../src/navigation/TabNavigator', () => {
  const React = require('react'); const { Text } = require('react-native');
  return () => React.createElement(Text, null, 'MainTabs');
});
jest.mock('../../../src/screens/Chat/ChatRoomScreen', () => {
  const React = require('react'); const { Text } = require('react-native');
  return () => React.createElement(Text, null, 'ChatRoomScreen');
});
jest.mock('../../../src/screens/Chat/AddPeopleScreen', () => {
  const React = require('react'); const { Text } = require('react-native');
  return () => React.createElement(Text, null, 'AddPeopleScreen');
});
jest.mock('../../../src/screens/SettingsScreen', () => {
  const React = require('react'); const { Text } = require('react-native');
  return () => React.createElement(Text, null, 'SettingsScreen');
});
jest.mock('../../../src/screens/CalendarScreen', () => {
  const React = require('react'); const { Text } = require('react-native');
  return () => React.createElement(Text, null, 'CalendarScreen');
});
jest.mock('../../../src/screens/Chat/ChatScreen', () => {
  const React = require('react'); const { Text } = require('react-native');
  return () => React.createElement(Text, null, 'ChatScreen');
});
jest.mock('../../../src/screens/StepsTrackerScreen', () => {
  const React = require('react'); const { Text } = require('react-native');
  return () => React.createElement(Text, null, 'StepsTrackerScreen');
});
jest.mock('../../../src/components/DailyMoodReminder', () => {
  const React = require('react'); const { Text } = require('react-native');
  return () => React.createElement(Text, null, 'DailyMoodReminder');
});

// --- Redux + side effects ---
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn().mockResolvedValue(undefined),
  hideAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@expo-google-fonts/poppins', () => ({
  useFonts: jest.fn(() => [true]),
  Poppins_400Regular: 'Poppins_400Regular',
  Poppins_700Bold: 'Poppins_700Bold',
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(async () => ({ status: 'denied' })),
  Accuracy: { High: 3 },
  watchPositionAsync: jest.fn(),
}));

jest.mock('../../../src/store/actions/themeActions', () => ({
  loadThemeFromStorage: jest.fn(() => ({ type: 'LOAD_THEME' })),
}));
jest.mock('../../../src/store/actions/loginActions', () => ({
  updateUserLocation: jest.fn((payload) => ({ type: 'UPDATE_USER_LOCATION', payload })),
}));
jest.mock('../../../src/store/actions/healthlogActions', () => ({
  fetchTodayMood: jest.fn((id) => ({ type: 'FETCH_TODAY_MOOD', payload: id })),
}));

const AsyncStorage = require('@react-native-async-storage/async-storage');
const SplashScreen = require('expo-splash-screen');
const Fonts = require('@expo-google-fonts/poppins');
const Location = require('expo-location');

const baseState = ({ user = null, moodToday = null, todaySymptoms = [] } = {}) => ({
  auth: { user },
  healthlog: { moodToday, todaySymptoms },
});
const setSelectors = (state) => {
  useSelector.mockImplementation((sel) => sel(state));
};

describe('AppNavigator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue('true'); // onboarding_seen -> "Login" initial route for app, but Auth stack is hard-coded to Onboarding

    const dispatchFn = jest.fn(() => ({ unwrap: jest.fn().mockResolvedValue({}) }));
    useDispatch.mockReturnValue(dispatchFn);
  });

  it('shows Auth stack when user is null (after loading gate)', async () => {
    setSelectors(baseState({ user: null }));

    const { queryByText } = render(<AppNavigator />);
    await act(async () => {});

    // Auth flow should render its initial route ("Onboarding")
    expect(queryByText('OnboardingScreen')).toBeTruthy();
  });

  it('renders DailyMoodReminder and starts at HealthLog when user exists but no mood/todaySymptoms', async () => {
    setSelectors(baseState({ user: { id: 'u1' }, moodToday: null, todaySymptoms: [] }));

    const { queryByText } = render(<AppNavigator />);
    await act(async () => {});

    expect(queryByText('DailyMoodReminder')).toBeTruthy();
    expect(queryByText('HealthlogScreen')).toBeTruthy();
  });

  it('starts at MainTabs when user exists and mood + todaySymptoms exist', async () => {
    setSelectors(baseState({ user: { id: 'u1' }, moodToday: { mood: 'ok' }, todaySymptoms: ['x'] }));

    const { queryByText } = render(<AppNavigator />);
    await act(async () => {});

    expect(queryByText('MainTabs')).toBeTruthy();
  });

  // ---------------- NEW TESTS BELOW ----------------

  it('shows a loading gate while fonts are not loaded (spinner phase) and hides splash when ready', async () => {
    Fonts.useFonts.mockReturnValueOnce([false]); // simulate fonts not ready
    setSelectors(baseState({ user: null }));

    const utils = render(<AppNavigator />);

    // During loading, neither Onboarding nor app screens should be present
    expect(utils.queryByText('OnboardingScreen')).toBeNull();
    expect(SplashScreen.preventAutoHideAsync).toHaveBeenCalled();

    // Now simulate fonts becoming ready on next render
    Fonts.useFonts.mockReturnValueOnce([true]);
    utils.rerender(<AppNavigator />);
    await act(async () => {});

    expect(SplashScreen.hideAsync).toHaveBeenCalled();
  });

  it('dispatches fetchTodayMood when a user exists', async () => {
    setSelectors(baseState({ user: { id: 'user-123' }, moodToday: null, todaySymptoms: [] }));

    const { queryByText } = render(<AppNavigator />);
    await act(async () => {});

    // Screen still HealthLog
    expect(queryByText('HealthlogScreen')).toBeTruthy();

    // Verify dispatch called with FETCH_TODAY_MOOD action carrying user id
    const dispatch = useDispatch();
    const calledWith = dispatch.mock.calls.map((args) => args[0]);
    expect(calledWith).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'FETCH_TODAY_MOOD', payload: 'user-123' }),
      ])
    );
  });

  it('requests location permission and dispatches updateUserLocation when granted', async () => {
    // Override permission to granted for this test
    Location.requestForegroundPermissionsAsync.mockResolvedValueOnce({ status: 'granted' });

    // Provide a watchPositionAsync implementation that immediately invokes the callback
    Location.watchPositionAsync.mockImplementationOnce(async (_opts, cb) => {
      cb({ coords: { latitude: 12.34, longitude: 56.78 } });
      return { remove: jest.fn() };
    });

    setSelectors(baseState({ user: { id: 'u1' }, moodToday: { mood: 'ok' }, todaySymptoms: ['x'] }));

    render(<AppNavigator />);
    await act(async () => {});

    const dispatch = useDispatch();
    expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();

    // Ensure updateUserLocation was dispatched with coords
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'UPDATE_USER_LOCATION',
        payload: expect.objectContaining({
          userId: 'u1',
          latitude: 12.34,
          longitude: 56.78,
        }),
      })
    );
  });
});
