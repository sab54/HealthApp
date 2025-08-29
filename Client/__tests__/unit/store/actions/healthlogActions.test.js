// Client/__tests__/unit/store/actions/healthlogActions.test.js

/**
 * Covers:
 * 1) submitMood success (fallback user id, posts correct body, returns shaped payload)
 * 2) submitMood rejection when missing user_id & mood
 * 3) fetchTodaySymptoms mapping/filtering to today's date
 * 4) updatePlanTask success (posts body, echoes payload)
 */

import {
  submitMood,
  fetchTodaySymptoms,
  updatePlanTask,
} from 'src/store/actions/healthlogActions';

// Do NOT mock apiPaths; use the real constant to avoid path resolution issues.

// Mock HTTP helpers (define mocks inside the factory)
jest.mock('src/utils/api', () => {
  const mockPost = jest.fn();
  const mockGet = jest.fn();
  return {
    __esModule: true,
    post: mockPost,
    get: mockGet,
  };
});

describe('healthlogActions thunks', () => {
  const dispatch = jest.fn();
  const getState = jest.fn();

  // Access the in-factory mocks via require()
  const api = require('src/utils/api');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('submitMood', () => {
    it('fulfills and posts with fallback user id from state; includes optional fields', async () => {
      getState.mockReturnValue({
        auth: { user: { id: 'state-user-123' } },
      });

      api.post.mockResolvedValue({ message: 'Saved' });

      const action = await submitMood({
        mood: 'happy',
        sleep: 7,
        energy: 8,
        symptoms: ['cough'],
      })(dispatch, getState, undefined);

      // Assert POST URL only by path (base can vary)
      expect(api.post).toHaveBeenCalledWith(
        expect.stringMatching(/\/submit$/),
        {
          user_id: 'state-user-123',
          mood: 'happy',
          sleep: 7,
          energy: 8,
          symptoms: ['cough'],
        }
      );

      expect(action.type).toBe('healthlog/submitMood/fulfilled');
      expect(action.payload).toEqual({
        mood: 'happy',
        symptoms: ['cough'],
        sleep: 7,
        energy: 8,
        message: 'Saved',
      });
    });

    it('rejects when missing user_id and/or mood', async () => {
      getState.mockReturnValue({ auth: { user: {} } });

      const action = await submitMood({})(dispatch, getState, undefined);

      expect(action.type).toBe('healthlog/submitMood/rejected');
      expect(action.payload).toBe('Missing user_id or mood');
      expect(api.post).not.toHaveBeenCalled();
    });
  });

  describe('fetchTodaySymptoms', () => {
    beforeAll(() => {
      jest.useFakeTimers();
    });
    afterAll(() => {
      jest.useRealTimers();
    });

    it("returns only today's symptoms and fills defaults", async () => {
      const fixed = new Date('2025-01-02T10:00:00Z');
      jest.setSystemTime(fixed);
      const todayStr = '2025-01-02';

      api.get.mockResolvedValue({
        symptoms: [
          { symptom: 'headache', date: '2025-01-01', recovered_at: null },
          { symptom: 'nausea' }, // gets date=today & recovered_at=null
          { symptom: 'fatigue', date: '2025-01-02', recovered_at: '2025-01-02' },
        ],
      });

      const action = await fetchTodaySymptoms('u-1')(dispatch, getState, undefined);

      // Assert GET URL by path + query (base can vary)
      expect(api.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/today\?userId=u-1$/)
      );

      expect(action.type).toBe('healthlog/fetchTodaySymptoms/fulfilled');
      expect(action.payload).toEqual([
        { symptom: 'nausea', recovered_at: null, date: todayStr },
        { symptom: 'fatigue', date: todayStr, recovered_at: todayStr },
      ]);
    });
  });

  describe('updatePlanTask', () => {
    it('posts update and returns echo payload', async () => {
      api.post.mockResolvedValue({ ok: true });

      const args = {
        user_id: 'u-9',
        date: '2025-01-03',
        category: 'Hydration',
        task: 'Drink 8 glasses',
        done: true,
      };

      const action = await updatePlanTask(args)(dispatch, getState, undefined);

      expect(api.post).toHaveBeenCalledWith(
        expect.stringMatching(/\/updatePlanTask$/),
        {
          user_id: 'u-9',
          date: '2025-01-03',
          category: 'Hydration',
          task: 'Drink 8 glasses',
          done: true,
        }
      );

      expect(action.type).toBe('healthlog/updatePlanTask/fulfilled');
      expect(action.payload).toEqual({
        category: 'Hydration',
        task: 'Drink 8 glasses',
        done: true,
      });
    });
  });
});
