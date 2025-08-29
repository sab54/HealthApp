/**
 * src/actions/__tests__/settingsActions.test.js
 *
 * What This Test File Covers:
 *
 * 1. Success Path – Dispatches UPDATE_PROFILE_REQUEST, calls fetch with correct URL/body, then dispatches UPDATE_PROFILE_SUCCESS and AUTH_UPDATE_USER, and stores user in AsyncStorage.
 * 2. Failure Path (API returns success=false) – Dispatches UPDATE_PROFILE_REQUEST, then UPDATE_PROFILE_FAIL with provided message.
 * 3. Failure Path (fetch throws) – Dispatches UPDATE_PROFILE_REQUEST, then UPDATE_PROFILE_FAIL with thrown error message.
 * 4. AsyncStorage Side Effect – Verifies updated user is saved to AsyncStorage on success.
 */

import { updateUserProfile } from 'src/store/actions/settingActions';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('src/utils/apiPaths', () => ({
  API_URL_USERS: '/users',
}));

jest.mock('src/utils/config', () => ({
  BASE_URL: 'https://api.example.com',
}));

const { setItem } = require('@react-native-async-storage/async-storage');

describe('updateUserProfile action', () => {
  let dispatch;

  beforeEach(() => {
    dispatch = jest.fn();
    jest.clearAllMocks();
  });

  it('dispatches success flow and stores user in AsyncStorage', async () => {
    const mockUser = { id: 'u1', first_name: 'John', last_name: 'Doe' };
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            success: true,
            user: mockUser,
          }),
      })
    );

    await updateUserProfile('u1', 'John', 'Doe')(dispatch);

    expect(dispatch).toHaveBeenNthCalledWith(1, { type: 'UPDATE_PROFILE_REQUEST' });
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/users/update-profile',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'u1', first_name: 'John', last_name: 'Doe' }),
      })
    );
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: 'UPDATE_PROFILE_SUCCESS',
      payload: mockUser,
    });
    expect(dispatch).toHaveBeenNthCalledWith(3, {
      type: 'AUTH_UPDATE_USER',
      payload: mockUser,
    });
    expect(setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
  });

  it('dispatches fail when API responds with success=false', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            success: false,
            message: 'Invalid request',
          }),
      })
    );

    await updateUserProfile('u2', 'Jane', 'Smith')(dispatch);

    expect(dispatch).toHaveBeenNthCalledWith(1, { type: 'UPDATE_PROFILE_REQUEST' });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: 'UPDATE_PROFILE_FAIL',
      payload: 'Invalid request',
    });
  });

  it('dispatches fail when fetch throws an error', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));

    await updateUserProfile('u3', 'Alice', 'Brown')(dispatch);

    expect(dispatch).toHaveBeenNthCalledWith(1, { type: 'UPDATE_PROFILE_REQUEST' });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: 'UPDATE_PROFILE_FAIL',
      payload: 'Network error',
    });
  });

  it('saves updated user into AsyncStorage on success', async () => {
    const mockUser = { id: 'u4', first_name: 'Sam', last_name: 'Taylor' };
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            success: true,
            user: mockUser,
          }),
      })
    );

    await updateUserProfile('u4', 'Sam', 'Taylor')(dispatch);

    expect(setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
  });
});
