/**
 * loginReducer.test.js
 *
 * What This Test File Covers:
 *
 * 1. Initial & Reset
 *    - Returns initial state and resetAuthState restores it.
 *
 * 2. verifyOtp Lifecycle
 *    - pending sets loading=true, isVerified=false, clears error.
 *    - fulfilled sets user and isVerified=true.
 *    - rejected sets error and isVerified=false.
 *
 * 3. updateUserLocation
 *    - fulfilled updates user latitude/longitude when user exists.
 *    - does nothing harmful when user is null.
 *
 * 4. Logout & Instant Update
 *    - logout.fulfilled resets to initial.
 *    - AUTH_UPDATE_USER replaces user immediately.
 */

import reducer, { resetAuthState } from '@/store/reducers/loginReducer';
import { verifyOtp, logout, updateUserLocation } from '@/store/actions/loginActions';

describe('loginReducer', () => {
  const initial = {
    loading: false,
    error: null,
    user: null,
    isVerified: false,
  };

  it('returns initial state and handles resetAuthState', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial);

    const dirty = {
      loading: true,
      error: 'x',
      user: { id: 'u1' },
      isVerified: true,
    };
    expect(reducer(dirty, resetAuthState())).toEqual(initial);
  });

  it('handles verifyOtp pending, fulfilled, and rejected', () => {
    // pending
    let state = reducer(initial, { type: verifyOtp.pending.type });
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
    expect(state.isVerified).toBe(false);

    // fulfilled
    const payload = { user: { id: 'u123', name: 'Alice' } };
    state = reducer(state, { type: verifyOtp.fulfilled.type, payload });
    expect(state.loading).toBe(false);
    expect(state.isVerified).toBe(true);
    expect(state.user).toEqual(payload.user);

    // rejected
    state = reducer(state, { type: verifyOtp.rejected.type, payload: 'Invalid OTP' });
    expect(state.loading).toBe(false);
    expect(state.isVerified).toBe(false);
    expect(state.error).toBe('Invalid OTP');
  });

  it('updates location on updateUserLocation.fulfilled when user exists and ignores when user is null', () => {
    // with user in state
    let state = {
      ...initial,
      user: { id: 'u1', name: 'Bob', latitude: 0, longitude: 0 },
    };
    const meta = { arg: { latitude: 51.5, longitude: -0.12 } };
    state = reducer(state, { type: updateUserLocation.pending.type });
    state = reducer(state, { type: updateUserLocation.fulfilled.type, meta });
    expect(state.loading).toBe(false);
    expect(state.user?.latitude).toBe(51.5);
    expect(state.user?.longitude).toBe(-0.12);

    // without user in state (should not throw or add a user)
    let stateNoUser = reducer(initial, { type: updateUserLocation.pending.type });
    stateNoUser = reducer(stateNoUser, { type: updateUserLocation.fulfilled.type, meta });
    expect(stateNoUser.user).toBeNull();
    expect(stateNoUser.loading).toBe(false);
  });

  it('handles logout.fulfilled and AUTH_UPDATE_USER', () => {
    // AUTH_UPDATE_USER replaces user immediately
    let state = reducer(initial, { type: 'AUTH_UPDATE_USER', payload: { id: 'u9', name: 'Z' } });
    expect(state.user).toEqual({ id: 'u9', name: 'Z' });

    // logout resets to initial
    state = reducer(state, { type: logout.fulfilled.type });
    expect(state).toEqual(initial);
  });
});
