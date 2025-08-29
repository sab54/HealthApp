/**
 * Client/src/utils/__tests__/api.test.js
 *
 * What This Test File Covers:
 *
 * 1. GET success with query params
 *    - Builds query string, sends proper headers/method, returns parsed JSON.
 *
 * 2. GET non-JSON response
 *    - Throws with short preview of non-JSON body.
 *
 * 3. POST failure with JSON error
 *    - Throws with server-provided message when response.ok is false.
 *
 * 4. verifyDoctorLicense success
 *    - Sends FormData to the correct endpoint and returns parsed JSON.
 */

import { get, post, verifyDoctorLicense } from 'src/utils/api';

// Mock BASE_URL used inside ../api.js (which imports './config')
jest.mock('src/utils/config', () => ({
  BASE_URL: 'https://api.example.com',
}));

const makeHeaders = (contentType) => ({
  get: jest.fn().mockReturnValue(contentType),
});

describe('utils/api', () => {
  const originalFetch = global.fetch;
  const OriginalFormData = global.FormData;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock fetch for all tests
    global.fetch = jest.fn();

    // Minimal FormData mock to capture append calls
    class FD {
      constructor() {
        this.append = jest.fn();
      }
    }
    global.FormData = FD;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    global.FormData = OriginalFormData;
  });

  it('GET builds query string and returns JSON on success', async () => {
    const headers = makeHeaders('application/json; charset=utf-8');
    global.fetch.mockResolvedValueOnce({
      ok: true,
      headers,
      json: async () => ({ status: 'ok', items: [1, 2, 3] }),
    });

    const data = await get('/v1/items', { page: 2, q: 'heart rate' }, { Authorization: 'Bearer X' });

    // Assert return value
    expect(data).toEqual({ status: 'ok', items: [1, 2, 3] });

    // Assert fetch call shape
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/v1/items?page=2&q=heart%20rate',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer X',
        }),
      })
    );
  });

  it('GET throws when content-type is not JSON', async () => {
    const headers = makeHeaders('text/plain');
    global.fetch.mockResolvedValueOnce({
      ok: true,
      headers,
      text: async () => 'Not JSON response body for preview...',
    });

    await expect(get('/v1/plain')).rejects.toThrow(/Expected JSON, got:/);

    // Ensure fetch was called without query params
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/v1/plain',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('POST throws with server message on non-ok', async () => {
    const headers = makeHeaders('application/json');
    global.fetch.mockResolvedValueOnce({
      ok: false,
      headers,
      json: async () => ({ message: 'Bad request: missing field' }),
    });

    await expect(post('/v1/create', { name: 'Alice' })).rejects.toThrow('Bad request: missing field');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/v1/create',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ name: 'Alice' }),
      })
    );
  });

  it('verifyDoctorLicense uploads FormData and returns JSON on success', async () => {
    const headers = makeHeaders('application/json');
    const responseBody = { success: true, id: 'lic-123' };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      headers,
      json: async () => responseBody,
    });

    const result = await verifyDoctorLicense('file:///tmp/license.png', 'user-42');

    expect(result).toEqual(responseBody);

    // Verify endpoint and method
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/api/license/upload-license',
      expect.objectContaining({ method: 'POST' })
    );

    // Verify a FormData instance was sent
    const lastCallBody = global.fetch.mock.calls[0][1].body;
    expect(typeof lastCallBody.append).toBe('function'); // FormData-like

    // Check that expected fields were appended
    // Since we replaced FormData with our mock class, we can’t introspect entries,
    // but we can ensure append was called at least twice (image and user_id).
    expect(lastCallBody.append).toHaveBeenCalledTimes(2);
    expect(lastCallBody.append).toHaveBeenCalledWith(
      'image',
      expect.objectContaining({
        uri: 'file:///tmp/license.png',
        name: 'license.png',
        type: 'image/png',
      })
    );
    expect(lastCallBody.append).toHaveBeenCalledWith('user_id', 'user-42');
  });
});
