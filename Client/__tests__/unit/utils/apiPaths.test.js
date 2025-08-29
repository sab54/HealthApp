/**
 * Client/src/utils/__tests__/apiPaths.test.js
 *
 * What this test file covers:
 * - Ensures that the exported API_URL_* constants from apiPaths.js
 *   match the expected string values.
 */

import {
  API_URL_CHAT,
  API_URL_USERS,
  API_URL_HEALTHLOG,
  API_URL_APPOINTMENT,
} from 'src/utils/apiPaths';

describe('utils/apiPaths', () => {
  it('should export correct API_URL_CHAT', () => {
    expect(API_URL_CHAT).toBe('/api/chat');
  });

  it('should export correct API_URL_USERS', () => {
    expect(API_URL_USERS).toBe('/api/users');
  });

  it('should export correct API_URL_HEALTHLOG', () => {
    expect(API_URL_HEALTHLOG).toBe('/api/healthlog');
  });

  it('should export correct API_URL_APPOINTMENT', () => {
    expect(API_URL_APPOINTMENT).toBe('/api/appointment');
  });
});
