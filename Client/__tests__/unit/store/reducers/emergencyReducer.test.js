/**
 * emergencyReducer.test.js
 *
 * What This Test File Covers:
 *
 * 1. Initial State
 *    - Reducer returns correct defaults.
 *
 * 2. Individual Reducers
 *    - setCountryCode updates countryCode.
 *    - setCustomName updates customName.
 *    - setCustomNumber updates customNumber.
 *
 * 3. setEmergencySettings
 *    - Updates all fields at once.
 */

import reducer, {
  setCountryCode,
  setCustomName,
  setCustomNumber,
  setEmergencySettings,
} from '@/store/reducers/emergencyReducer';

describe('emergencyReducer', () => {
  const initial = {
    countryCode: 'US',
    customName: '',
    customNumber: '',
  };

  it('returns the initial state by default', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial);
  });

  it('updates countryCode, customName, and customNumber individually', () => {
    let state = reducer(initial, setCountryCode('IN'));
    expect(state.countryCode).toBe('IN');

    state = reducer(state, setCustomName('Alice'));
    expect(state.customName).toBe('Alice');

    state = reducer(state, setCustomNumber('+123456789'));
    expect(state.customNumber).toBe('+123456789');
  });

  it('updates all emergency settings together', () => {
    const payload = {
      countryCode: 'GB',
      customName: 'Bob',
      customNumber: '+447700900123',
    };
    const state = reducer(initial, setEmergencySettings(payload));
    expect(state).toEqual(payload);
  });
});
