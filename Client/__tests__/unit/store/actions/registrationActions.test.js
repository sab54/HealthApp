/**
 * Client/src/store/actions/__tests__/registrationActions.test.js
 *
 * What This Test File Covers:
 *
 * 1. Success Path – Calls post() with correct URL, merges user data, defaults lat/long to null, and passes headers.
 * 2. Provided Coordinates – Preserves provided latitude/longitude (does not overwrite with null).
 * 3. AsyncStorage Side Effects – Stores countryCode and lastPhone on success.
 * 4. Error Handling – Returns rejected action with error.message via rejectWithValue.
 */

import { registerUser } from 'src/store/actions/registrationActions';

// Mocks
const mockPost = jest.fn();
const mockPatch = jest.fn(); // not used here, but the file imports it
jest.mock('src/utils/api', () => ({
  post: (...args) => mockPost(...args),
  patch: (...args) => mockPatch(...args),
}));

jest.mock('src/utils/apiPaths.js', () => ({
  API_URL_USERS: 'https://api.example.com/users',
}));

// AsyncStorage mock
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
}));

// Silence console noise from the action
const originalConsole = { log: console.log, error: console.error };
beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});
afterAll(() => {
  console.log = originalConsole.log;
  console.error = originalConsole.error;
});

const { setItem } = require('@react-native-async-storage/async-storage');

describe('registerUser thunk', () => {
  const dispatch = jest.fn();
  const getState = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls post() with correct URL, payload (lat/long default to null), and headers', async () => {
    const userData = {
      phone_number: '1234567890',
      country_code: '+1',
      name: 'Test User',
      // latitude/longitude intentionally omitted to test defaulting
    };

    const mockResponse = { ok: true, id: 'user_1' };
    mockPost.mockResolvedValueOnce(mockResponse);

    const actionFn = registerUser(userData);
    const action = await actionFn(dispatch, getState, undefined);

    // post called correctly
    expect(mockPost).toHaveBeenCalledTimes(1);
    const [calledUrl, calledBody, calledHeaders] = mockPost.mock.calls[0];

    expect(calledUrl).toBe('https://api.example.com/users/register');
    expect(calledBody).toEqual({
      ...userData,
      latitude: null,
      longitude: null,
    });
    expect(calledHeaders).toEqual({});

    // fulfilled action returned
    expect(action.type).toBe('registration/registerUser/fulfilled');
    expect(action.payload).toEqual(mockResponse);
  });

  it('preserves provided latitude/longitude (does not overwrite with null)', async () => {
    const userData = {
      phone_number: '5551112222',
      country_code: '+44',
      name: 'Geo User',
      latitude: 51.5074,
      longitude: -0.1278,
    };

    const mockResponse = { ok: true, id: 'user_2' };
    mockPost.mockResolvedValueOnce(mockResponse);

    const action = await registerUser(userData)(dispatch, getState, undefined);

    const [, calledBody] = mockPost.mock.calls[0];
    expect(calledBody.latitude).toBe(51.5074);
    expect(calledBody.longitude).toBe(-0.1278);

    expect(action.type).toBe('registration/registerUser/fulfilled');
    expect(action.payload).toEqual(mockResponse);
  });

  it('stores countryCode and lastPhone to AsyncStorage on success', async () => {
    const userData = {
      phone_number: '7778889999',
      country_code: '+61',
      name: 'Storage User',
    };

    mockPost.mockResolvedValueOnce({ ok: true });

    await registerUser(userData)(dispatch, getState, undefined);

    expect(setItem).toHaveBeenCalledWith('countryCode', '+61');
    expect(setItem).toHaveBeenCalledWith('lastPhone', '7778889999');
  });

  it('returns rejected action with provided error message on failure', async () => {
    const userData = {
      phone_number: '0000000000',
      country_code: '+91',
      name: 'Error User',
    };

    const err = new Error('Network down');
    mockPost.mockRejectedValueOnce(err);

    const action = await registerUser(userData)(dispatch, getState, undefined);

    expect(action.type).toBe('registration/registerUser/rejected');
    expect(action.payload).toBe('Network down');
  });
});
