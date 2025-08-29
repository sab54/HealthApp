// Client/__tests__/unit/store/actions/loginActions.test.js

/**
 * Covers:
 * 1) requestOtp success (posts correct body, stores phone & country in AsyncStorage)
 * 2) verifyOtp success (stores token via saveToken and persists role/approval)
 * 3) verifyOtp failure (rejects with provided error message)
 * 4) updateUserLocation success (patch called with correct URL and body)
 */

import {
  requestOtp,
  verifyOtp,
  updateUserLocation,
} from 'src/store/actions/loginActions';
import AsyncStorage from '@react-native-async-storage/async-storage'; // <-- import directly

// Mock HTTP helpers (define inside factory)
jest.mock('src/utils/api', () => {
  const mockPost = jest.fn();
  const mockPatch = jest.fn();
  return {
    __esModule: true,
    post: mockPost,
    patch: mockPatch,
  };
});

// Mock token helper
jest.mock('src/utils/tokenHelper', () => {
  const mockSaveToken = jest.fn(async () => undefined);
  return { __esModule: true, saveToken: mockSaveToken };
});

describe('loginActions thunks', () => {
  const dispatch = jest.fn();
  const getState = jest.fn();

  const api = require('src/utils/api');
  const { saveToken } = require('src/utils/tokenHelper');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestOtp', () => {
    it('fulfills, posts to /request-otp and stores phone/country', async () => {
      api.post.mockResolvedValue({ ok: true, request_id: 'r1' });

      const action = await requestOtp({
        phone_number: '1234567890',
        country_code: '+1',
      })(dispatch, getState, undefined);

      expect(api.post).toHaveBeenCalledWith(
        expect.stringMatching(/\/request-otp$/),
        { phone_number: '1234567890', country_code: '+1' }
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('countryCode', '+1');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('lastPhone', '1234567890');

      expect(action.type).toBe('auth/requestOtp/fulfilled');
      expect(action.payload).toEqual({ ok: true, request_id: 'r1' });
    });
  });

  describe('verifyOtp', () => {
    it('fulfills, posts to /verify-otp, saves token, and persists user role/approval', async () => {
      api.post.mockResolvedValue({
        token: 'jwt.token.value',
        user: { role: 'patient', is_approved: 1 },
      });

      const action = await verifyOtp({
        user_id: 'u-1',
        otp_code: '123456',
      })(dispatch, getState, undefined);

      expect(api.post).toHaveBeenCalledWith(
        expect.stringMatching(/\/verify-otp$/),
        { user_id: 'u-1', otp_code: '123456' }
      );
      expect(saveToken).toHaveBeenCalledWith('jwt.token.value');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('userRole', 'patient');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('isApproved', '1');

      expect(action.type).toBe('auth/verifyOtp/fulfilled');
      expect(action.payload).toEqual({
        token: 'jwt.token.value',
        user: { role: 'patient', is_approved: 1 },
      });
    });

    it('rejects with message when API errors', async () => {
      api.post.mockRejectedValue(new Error('OTP invalid'));

      const action = await verifyOtp({
        user_id: 'u-1',
        otp_code: '000000',
      })(dispatch, getState, undefined);

      expect(action.type).toBe('auth/verifyOtp/rejected');
      expect(action.payload).toBe('OTP invalid');
    });
  });

  describe('updateUserLocation', () => {
    it('fulfills after PATCH to /:id/location with coordinates', async () => {
      api.patch.mockResolvedValue({ updated: true });

      const action = await updateUserLocation({
        userId: 'u-77',
        latitude: 37.1,
        longitude: -122.5,
      })(dispatch, getState, undefined);

      expect(api.patch).toHaveBeenCalledWith(
        expect.stringMatching(/\/u-77\/location$/),
        { latitude: 37.1, longitude: -122.5 }
      );

      expect(action.type).toBe('auth/updateUserLocation/fulfilled');
      expect(action.payload).toEqual({ updated: true });
    });
  });
});
