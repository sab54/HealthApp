/**
 * __tests__/unit/utils/utils.test.js
 *
 * What this test file covers:
 *
 * 1. getUserLocation
 *    - Returns lat/long when permission granted.
 *    - Throws error when permission denied.
 *
 * 2. parseDate
 *    - Parses normal ISO and SQLite datetime format.
 *    - Returns null for invalid or empty input.
 *
 * 3. formatTimeAgo
 *    - Formats differences in minutes, hours, days correctly.
 *
 * 4. truncate
 *    - Truncates text to length, appends ellipsis, preserves word boundary.
 *    - Returns empty string for invalid inputs.
 *
 * 5. formatTime (default export)
 *    - Formats valid date string into 12-hour time with AM/PM.
 *    - Returns empty string for invalid input.
 *
 * 6. formatTimestamp
 *    - Returns locale time string (HH:MM) for valid date.
 *    - Returns empty string for invalid date.
 */

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

import * as Location from 'expo-location';
import {
  getUserLocation,
  parseDate,
  formatTimeAgo,
  truncate,
  default as formatTime,
  formatTimestamp,
} from 'src/utils/utils';

describe('utils/utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserLocation', () => {
    it('returns latitude/longitude when permission granted', async () => {
      Location.requestForegroundPermissionsAsync.mockResolvedValueOnce({ status: 'granted' });
      Location.getCurrentPositionAsync.mockResolvedValueOnce({
        coords: { latitude: 12.34, longitude: 56.78 },
      });

      const loc = await getUserLocation();
      expect(loc).toEqual({ latitude: 12.34, longitude: 56.78 });
    });

    it('throws when permission not granted', async () => {
      Location.requestForegroundPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });

      await expect(getUserLocation()).rejects.toThrow('Location permission not granted');
    });
  });

  describe('parseDate', () => {
    it('parses ISO string', () => {
      const d = parseDate('2025-08-28T07:22:27Z');
      expect(d).toBeInstanceOf(Date);
      expect(d.toISOString()).toBe('2025-08-28T07:22:27.000Z');
    });

    it('parses SQLite DATETIME string', () => {
      const d = parseDate('2025-08-28 07:22:27');
      expect(d).toBeInstanceOf(Date);
      expect(d.toISOString()).toBe('2025-08-28T07:22:27.000Z');
    });

    it('returns null for invalid or empty input', () => {
      expect(parseDate('')).toBeNull();
      expect(parseDate('not-a-date')).toBeNull();
    });
  });

  describe('formatTimeAgo', () => {
    it('returns minutes ago when < 60 min', () => {
      const now = new Date();
      const tenMinAgo = new Date(now.getTime() - 10 * 60000);
      expect(formatTimeAgo(tenMinAgo.toISOString())).toBe('10 min ago');
    });

    it('returns hours ago when < 24 hours', () => {
      const now = new Date();
      const threeHoursAgo = new Date(now.getTime() - 3 * 3600 * 1000);
      expect(formatTimeAgo(threeHoursAgo.toISOString())).toBe('3 hr ago');
    });

    it('returns days ago when >= 24 hours', () => {
      const now = new Date();
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 3600 * 1000);
      expect(formatTimeAgo(twoDaysAgo.toISOString())).toBe('2 days ago');
    });

    it('returns empty string for invalid date', () => {
      expect(formatTimeAgo('invalid')).toBe('');
    });
  });

  describe('truncate', () => {
    it('truncates long text with ellipsis at word boundary', () => {
      const text = 'This is a very long text string that should be truncated nicely';
      const result = truncate(text, 25);
      expect(result.endsWith('...')).toBe(true);
      expect(result.length).toBeLessThanOrEqual(28);
    });

    it('returns full text if shorter than length', () => {
      expect(truncate('short text', 20)).toBe('short text');
    });

    it('returns empty string for non-string input', () => {
      expect(truncate(null)).toBe('');
      expect(truncate(12345)).toBe('');
    });
  });

  describe('formatTime (default)', () => {
    it('formats date to 12-hour time with AM/PM', () => {
      const d = new Date('2025-08-28T13:05:00Z');
      const str = formatTime(d.toISOString());
      expect(str).toMatch(/\d{1,2}:05 (AM|PM)/);
    });

    it('returns empty string for invalid date', () => {
      expect(formatTime('invalid')).toBe('');
    });
  });

  describe('formatTimestamp', () => {
    it('returns locale time string', () => {
      const d = new Date('2025-08-28T09:15:00Z');
      const str = formatTimestamp(d.toISOString());
      expect(typeof str).toBe('string');
      expect(str).toMatch(/\d{1,2}:\d{2}/);
    });

    it('returns empty string for invalid date', () => {
      expect(formatTimestamp('not-a-date')).toBe('');
    });
  });
});
