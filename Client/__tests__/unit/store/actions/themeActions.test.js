/**
 * src/actions/__tests__/themeActions.test.js
 *
 * What This Test File Covers:
 *
 * 1. loadThemeFromStorage – Defaults to 'system' when no stored value, applies mode, and sets effective dark based on Appearance.
 * 2. loadThemeFromStorage (stored value) – Uses stored 'dark' and sets effective dark true regardless of system scheme.
 * 3. toggleTheme – Cycles light -> dark and applies correct side effects.
 * 4. toggleTheme – Cycles system -> light and applies correct side effects.
 */

import { loadThemeFromStorage, toggleTheme, applyThemeMode } from 'src/store/actions/themeActions';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('src/store/reducers/themeReducer', () => ({
  setThemeMode: jest.fn((mode) => ({ type: 'SET_THEME_MODE', payload: mode })),
  setEffectiveDarkMode: jest.fn((val) => ({ type: 'SET_EFFECTIVE_DARK_MODE', payload: val })),
}));

jest.mock('react-native', () => ({
  Appearance: { getColorScheme: jest.fn(() => 'light') },
}));

const AsyncStorage = require('@react-native-async-storage/async-storage');
const { setThemeMode, setEffectiveDarkMode } = require('src/store/reducers/themeReducer');
const { Appearance } = require('react-native');

// Thunk-aware dispatch helper
const createDispatch = (getState) =>
  jest.fn((action) => (typeof action === 'function' ? action(dispatch, getState) : action));
let dispatch;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('theme actions', () => {
  it("loadThemeFromStorage defaults to 'system' when unset and applies effective dark from Appearance", async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(null);
    Appearance.getColorScheme.mockReturnValueOnce('light');

    const getState = jest.fn(() => ({ theme: { mode: 'system' } }));
    dispatch = createDispatch(getState);

    await loadThemeFromStorage()(dispatch, getState);

    expect(AsyncStorage.getItem).toHaveBeenCalledWith('themeMode');

    // applyThemeMode('system') should have run: stored and dispatched
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('themeMode', 'system');
    expect(setThemeMode).toHaveBeenCalledWith('system');
    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_THEME_MODE', payload: 'system' });

    // system + Appearance 'light' => isDark false
    expect(setEffectiveDarkMode).toHaveBeenCalledWith(false);
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SET_EFFECTIVE_DARK_MODE',
      payload: false,
    });
  });

  it("loadThemeFromStorage uses stored 'dark' and sets effective dark true", async () => {
    AsyncStorage.getItem.mockResolvedValueOnce('dark');
    Appearance.getColorScheme.mockReturnValueOnce('light'); // should not matter for 'dark'

    const getState = jest.fn(() => ({ theme: { mode: 'dark' } }));
    dispatch = createDispatch(getState);

    await loadThemeFromStorage()(dispatch, getState);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('themeMode', 'dark');
    expect(setThemeMode).toHaveBeenCalledWith('dark');
    expect(setEffectiveDarkMode).toHaveBeenCalledWith(true);
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SET_EFFECTIVE_DARK_MODE',
      payload: true,
    });
  });

  it('toggleTheme cycles light -> dark and applies correct side effects', async () => {
    const getState = jest.fn(() => ({ theme: { mode: 'light' } }));
    dispatch = createDispatch(getState);

    Appearance.getColorScheme.mockReturnValueOnce('light'); // for completeness; 'dark' mode ignores system
    await toggleTheme()(dispatch, getState);

    // Next mode should be 'dark'
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('themeMode', 'dark');
    expect(setThemeMode).toHaveBeenCalledWith('dark');
    expect(setEffectiveDarkMode).toHaveBeenCalledWith(true);
  });

  it('toggleTheme cycles system -> light and applies correct side effects', async () => {
    const getState = jest.fn(() => ({ theme: { mode: 'system' } }));
    dispatch = createDispatch(getState);

    Appearance.getColorScheme.mockReturnValueOnce('dark'); // system value before toggling (will switch to light)
    await toggleTheme()(dispatch, getState);

    // Next mode should be 'light'
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('themeMode', 'light');
    expect(setThemeMode).toHaveBeenCalledWith('light');
    // light mode => effective dark false (independent of system)
    expect(setEffectiveDarkMode).toHaveBeenCalledWith(false);
  });
});
