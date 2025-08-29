/**
 * __tests__/unit/utils/tokenHelper.test.js
 *
 * What this test file covers:
 *
 * 1. saveToken success
 *    - Calls AsyncStorage.setItem with correct key and token.
 *
 * 2. saveToken error handling
 *    - Logs an error when AsyncStorage.setItem throws.
 *
 * 3. getToken success
 *    - Returns stored token when AsyncStorage.getItem resolves.
 *
 * 4. getToken error handling
 *    - Returns null and logs error when AsyncStorage.getItem rejects.
 */

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveToken, getToken } from 'src/utils/tokenHelper';

describe('utils/tokenHelper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
    console.log.mockRestore();
  });

  it('saveToken stores token successfully', async () => {
    AsyncStorage.setItem.mockResolvedValueOnce();

    await saveToken('abc123');

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('token', 'abc123');
    expect(console.error).not.toHaveBeenCalled();
  });

  it('saveToken logs error when AsyncStorage.setItem throws', async () => {
    AsyncStorage.setItem.mockRejectedValueOnce(new Error('storage error'));

    await saveToken('badtoken');

    expect(console.error).toHaveBeenCalledWith(
      'Failed to save token',
      expect.any(Error)
    );
  });

  it('getToken retrieves token successfully', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce('xyz789');

    const token = await getToken();

    expect(AsyncStorage.getItem).toHaveBeenCalledWith('token');
    expect(token).toBe('xyz789');
    expect(console.log).toHaveBeenCalledWith('Retrieved token:', 'xyz789');
  });

  it('getToken returns null and logs error when AsyncStorage.getItem fails', async () => {
    AsyncStorage.getItem.mockRejectedValueOnce(new Error('get error'));

    const token = await getToken();

    expect(token).toBeNull();
    expect(console.error).toHaveBeenCalledWith(
      'Failed to get token',
      expect.any(Error)
    );
  });
});
