/**
 * registrationReducer.test.js
 *
 * What This Test File Covers:
 *
 * 1. Initial State
 *    - Reducer returns correct defaults.
 *
 * 2. registerUser Lifecycle
 *    - pending sets loading=true and clears error.
 *    - fulfilled sets user and clears error.
 *    - rejected sets error and loading=false.
 */

import reducer from '@/store/reducers/registrationReducer';
import { registerUser } from '@/store/actions/registrationActions';

describe('registrationReducer', () => {
  const initial = {
    loading: false,
    user: null,
    error: null,
  };

  it('returns the initial state by default', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial);
  });

  it('handles registerUser.pending', () => {
    const state = reducer(initial, { type: registerUser.pending.type });
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
    expect(state.user).toBeNull();
  });

  it('handles registerUser.fulfilled', () => {
    const payload = { id: 'u1', name: 'Alice' };
    const state = reducer(
      { ...initial, loading: true, error: 'old' },
      { type: registerUser.fulfilled.type, payload }
    );
    expect(state.loading).toBe(false);
    expect(state.user).toEqual(payload);
    expect(state.error).toBeNull();
  });

  it('handles registerUser.rejected', () => {
    const state = reducer(
      { ...initial, loading: true },
      { type: registerUser.rejected.type, payload: 'Email in use' }
    );
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Email in use');
    expect(state.user).toBeNull();
  });
});
