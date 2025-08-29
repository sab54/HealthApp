// __tests__/unit/store/actions/emergencyActions.test.js

/**
 * emergencyActions.test.js
 *
 * What These Tests Cover (3–4 as requested):
 *
 * 1) loadEmergencySettings (non-DEV): loads values from AsyncStorage and dispatches
 *    setEmergencySettings with the mapped payload.
 *
 * 2) loadEmergencySettings (non-DEV, defaults): when keys are missing/null, falls back
 *    to empty strings and countryCode 'US'.
 *
 * 3) saveEmergencySettings (non-DEV): persists values via AsyncStorage.setItem
 *    and dispatches setEmergencySettings with the same settings.
 *
 * Note:
 * - We explicitly force DEV_MODE=false in tests to avoid the DEV branch, which
 *   references a mock variable that is not imported in your code.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Force DEV_MODE=false so the AsyncStorage code paths are exercised
jest.mock('src/utils/config', () => ({
  DEV_MODE: false,
}));

// Spy-able action creator from reducer (mocked so we can assert it’s called)
const mockSetEmergencySettings = jest.fn((payload) => ({
  type: 'emergency/setEmergencySettings',
  payload,
}));

jest.mock(
  'src/store/reducers/emergencyReducer',
  () => ({
    setEmergencySettings: (...args) => mockSetEmergencySettings(...args),
  })
);

// Import after mocks so thunks use the mocked modules above
const {
  loadEmergencySettings,
  saveEmergencySettings,
} = require('src/store/actions/emergencyActions');

const makeHarness = () => {
  const actions = [];
  const dispatch = (action) => {
    actions.push(action);
    return action;
  };
  return { dispatch, actions };
};

describe('emergencyActions thunks (non-DEV mode)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loadEmergencySettings: loads values and dispatches setEmergencySettings', async () => {
    // Arrange stored values
    AsyncStorage.getItem
      .mockResolvedValueOnce('Alice')   // emergencyContactName
      .mockResolvedValueOnce('+1555123456') // emergencyContactNumber
      .mockResolvedValueOnce('GB');     // emergencyCountry

    const { dispatch } = makeHarness();

    // Act
    await loadEmergencySettings()(dispatch);

    // Assert AsyncStorage lookups
    expect(AsyncStorage.getItem).toHaveBeenNthCalledWith(1, 'emergencyContactName');
    expect(AsyncStorage.getItem).toHaveBeenNthCalledWith(2, 'emergencyContactNumber');
    expect(AsyncStorage.getItem).toHaveBeenNthCalledWith(3, 'emergencyCountry');

    // Assert dispatch payload
    expect(mockSetEmergencySettings).toHaveBeenCalledWith({
      customName: 'Alice',
      customNumber: '+1555123456',
      countryCode: 'GB',
    });
  });

  it('loadEmergencySettings: applies defaults when storage values are missing', async () => {
    // Arrange nulls/missing
    AsyncStorage.getItem
      .mockResolvedValueOnce(null) // name
      .mockResolvedValueOnce(null) // number
      .mockResolvedValueOnce(null); // country

    const { dispatch } = makeHarness();

    await loadEmergencySettings()(dispatch);

    expect(mockSetEmergencySettings).toHaveBeenCalledWith({
      customName: '',
      customNumber: '',
      countryCode: 'US',
    });
  });

  it('saveEmergencySettings: persists values then dispatches setEmergencySettings', async () => {
    const settings = {
      customName: 'Bob',
      customNumber: '+441234567890',
      countryCode: 'UK',
    };

    const { dispatch } = makeHarness();

    await saveEmergencySettings(settings)(dispatch);

    // Persisted to AsyncStorage
    expect(AsyncStorage.setItem).toHaveBeenNthCalledWith(1, 'emergencyContactName', 'Bob');
    expect(AsyncStorage.setItem).toHaveBeenNthCalledWith(2, 'emergencyContactNumber', '+441234567890');
    expect(AsyncStorage.setItem).toHaveBeenNthCalledWith(3, 'emergencyCountry', 'UK');

    // Then reducer action dispatched
    expect(mockSetEmergencySettings).toHaveBeenCalledWith(settings);
  });
});
