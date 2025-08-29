/**
 * themeReducer.test.js
 *
 * What This Test File Covers:
 *
 * 1. Initial State
 *    - Reducer returns correct default theme state.
 *
 * 2. setThemeMode
 *    - Updates mode without touching isDarkMode or themeColors.
 *
 * 3. setEffectiveDarkMode
 *    - Updates isDarkMode and recalculates themeColors.
 */

import reducer, { setThemeMode, setEffectiveDarkMode } from '@/store/reducers/themeReducer';
import { getThemeColors } from '@/theme/themeTokens';

jest.mock('@/theme/themeTokens', () => ({
  getThemeColors: jest.fn((isDark) => (isDark ? { bg: 'black' } : { bg: 'white' })),
}));

describe('themeReducer', () => {
  const initial = {
    mode: 'system',
    isDarkMode: false,
    themeColors: { bg: 'white' }, // based on mocked getThemeColors(false)
  };

  it('returns initial state by default', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial);
  });

  it('updates mode with setThemeMode', () => {
    const state = reducer(initial, setThemeMode('dark'));
    expect(state.mode).toBe('dark');
    expect(state.isDarkMode).toBe(false);
    expect(state.themeColors).toEqual({ bg: 'white' }); // unchanged
  });

  it('updates dark mode and themeColors with setEffectiveDarkMode', () => {
    let state = reducer(initial, setEffectiveDarkMode(true));
    expect(state.isDarkMode).toBe(true);
    expect(getThemeColors).toHaveBeenCalledWith(true);
    expect(state.themeColors).toEqual({ bg: 'black' });

    state = reducer(state, setEffectiveDarkMode(false));
    expect(state.isDarkMode).toBe(false);
    expect(getThemeColors).toHaveBeenCalledWith(false);
    expect(state.themeColors).toEqual({ bg: 'white' });
  });
});
