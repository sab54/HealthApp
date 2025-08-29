/**
 * settingsReducer.test.js
 *
 * What This Test File Covers:
 *
 * 1. Initial State & SETTINGS_RESET
 *    - Returns correct defaults.
 *    - SETTINGS_RESET clears error and success flags.
 *
 * 2. Update Profile Flow (string action types)
 *    - UPDATE_PROFILE_REQUEST sets loading and clears error/success.
 *    - UPDATE_PROFILE_SUCCESS sets user, success=true, loading=false.
 *    - UPDATE_PROFILE_FAIL sets error, success=false, loading=false.
 */

import reducer, { SETTINGS_RESET } from '@/store/reducers/settingsReducer';

describe('settingsReducer', () => {
  const initial = {
    user: null,
    loading: false,
    error: null,
    success: false,
  };

  it('returns initial state and handles SETTINGS_RESET', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial);

    const dirty = {
      ...initial,
      error: 'Something went wrong',
      success: true,
    };
    const state = reducer(dirty, SETTINGS_RESET());
    expect(state.error).toBeNull();
    expect(state.success).toBe(false);
    // user and loading should remain untouched by SETTINGS_RESET
    expect(state.user).toBeNull();
    expect(state.loading).toBe(false);
  });

  it('handles UPDATE_PROFILE_REQUEST', () => {
    const state = reducer(
      { ...initial, error: 'old error', success: true },
      { type: 'UPDATE_PROFILE_REQUEST' }
    );
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
    expect(state.success).toBe(false);
  });

  it('handles UPDATE_PROFILE_SUCCESS', () => {
    const payload = { id: 'u1', name: 'Alice' };
    const state = reducer(
      { ...initial, loading: true },
      { type: 'UPDATE_PROFILE_SUCCESS', payload }
    );
    expect(state.loading).toBe(false);
    expect(state.success).toBe(true);
    expect(state.error).toBeNull();
    expect(state.user).toEqual(payload);
  });

  it('handles UPDATE_PROFILE_FAIL', () => {
    const state = reducer(
      { ...initial, loading: true },
      { type: 'UPDATE_PROFILE_FAIL', payload: 'Network error' }
    );
    expect(state.loading).toBe(false);
    expect(state.success).toBe(false);
    expect(state.error).toBe('Network error');
    expect(state.user).toBeNull();
  });
});
