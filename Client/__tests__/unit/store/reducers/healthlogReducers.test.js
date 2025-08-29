/**
 * healthlogReducer.test.js
 *
 * What This Test File Covers:
 *
 * 1. Initial & Basic Reducers
 *    - Returns initial state.
 *    - clearError clears all error flags.
 *    - resetMood resets all mood/today state and loading flags.
 *
 * 2. Symptoms Reducers
 *    - addSymptom unshifts and dedupes by `symptom`.
 *    - setTodaySymptoms replaces the list.
 *
 * 3. Mood Thunks Lifecycle
 *    - fetchTodayMood: pending/fulfilled/rejected update flags and fields.
 *    - submitMood: fulfilled mirrors fetchTodayMood mapping `recovered_at` to null when missing.
 *
 * 4. Plan & Recovery Flows
 *    - markSymptomRecovered.fulfilled updates the matching symptom.
 *    - fetchPlan.fulfilled maps `severity` -> `severity_level`.
 *    - updatePlanTask.fulfilled toggles `done` for the matching task.
 */

import reducer, {
  clearError,
  resetMood,
  addSymptom,
  setTodaySymptoms,
} from '@/store/reducers/healthlogReducers';

import {
  fetchTodayMood,
  submitMood,
  markSymptomRecovered,
  fetchPlan,
  updatePlanTask,
} from '@/store/actions/healthlogActions';

describe('healthlogReducer', () => {
  const initial = {
    moodToday: null,
    sleepToday: null,
    energyToday: null,
    todaySymptoms: [],
    planToday: [],
    loadingFetchTodayMood: false,
    loadingSubmitMood: false,
    loadingMarkRecovered: false,
    loadingPlan: false,
    errorFetchTodayMood: null,
    errorSubmitMood: null,
    errorMarkRecovered: null,
    errorPlan: null,
  };

  it('returns initial state; clearError and resetMood work', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial);

    const withErrors = {
      ...initial,
      errorFetchTodayMood: 'e1',
      errorSubmitMood: 'e2',
      errorMarkRecovered: 'e3',
      errorPlan: 'e4',
    };
    let state = reducer(withErrors, clearError());
    expect(state.errorFetchTodayMood).toBeNull();
    expect(state.errorSubmitMood).toBeNull();
    expect(state.errorMarkRecovered).toBeNull();
    expect(state.errorPlan).toBeNull();

    const dirty = {
      ...state,
      moodToday: 5,
      sleepToday: 7,
      energyToday: 6,
      todaySymptoms: [{ symptom: 'Headache' }],
      planToday: [{ category: 'Rest', task: 'Nap', done: false }],
      loadingFetchTodayMood: true,
      loadingSubmitMood: true,
      loadingMarkRecovered: true,
      loadingPlan: true,
      errorSubmitMood: 'x',
    };
    state = reducer(dirty, resetMood());
    expect(state).toEqual(initial);
  });

  it('handles addSymptom (dedupe) and setTodaySymptoms (replace)', () => {
    let state = reducer(initial, addSymptom({ symptom: 'Nausea', severity: 2 }));
    expect(state.todaySymptoms).toEqual([{ symptom: 'Nausea', severity: 2 }]);

    // duplicate by `symptom` should not add
    state = reducer(state, addSymptom({ symptom: 'Nausea', severity: 3 }));
    expect(state.todaySymptoms).toHaveLength(1);

    // setTodaySymptoms replaces the entire list
    const nextList = [{ symptom: 'Cough', severity: 1 }];
    state = reducer(state, setTodaySymptoms(nextList));
    expect(state.todaySymptoms).toEqual(nextList);
  });

  it('handles fetchTodayMood lifecycle and submitMood.fulfilled mapping', () => {
    // pending
    let state = reducer(initial, { type: fetchTodayMood.pending.type });
    expect(state.loadingFetchTodayMood).toBe(true);
    expect(state.errorFetchTodayMood).toBeNull();

    // fulfilled sets fields and maps symptoms recovered_at to null when missing
    const payload = {
      mood: 4,
      sleep: 7,
      energy: 5,
      symptoms: [
        { symptom: 'Headache' }, // no recovered_at
        { symptom: 'Nausea', recovered_at: '2024-01-01T00:00:00Z' },
      ],
    };
    state = reducer(state, { type: fetchTodayMood.fulfilled.type, payload });
    expect(state.loadingFetchTodayMood).toBe(false);
    expect(state.moodToday).toBe(4);
    expect(state.sleepToday).toBe(7);
    expect(state.energyToday).toBe(5);
    expect(state.todaySymptoms).toEqual([
      { symptom: 'Headache', recovered_at: null },
      { symptom: 'Nausea', recovered_at: '2024-01-01T00:00:00Z' },
    ]);

    // rejected sets error
    state = reducer(state, {
      type: fetchTodayMood.rejected.type,
      payload: 'Failed',
    });
    expect(state.loadingFetchTodayMood).toBe(false);
    expect(state.errorFetchTodayMood).toBe('Failed');

    // submitMood.fulfilled mirrors fulfilled mapping
    const submitPayload = {
      mood: 3,
      sleep: 6,
      energy: 6,
      symptoms: [{ symptom: 'Cough' }],
    };
    state = reducer(state, { type: submitMood.fulfilled.type, payload: submitPayload });
    expect(state.loadingSubmitMood).toBe(false);
    expect(state.errorSubmitMood).toBeNull();
    expect(state.moodToday).toBe(3);
    expect(state.todaySymptoms).toEqual([{ symptom: 'Cough', recovered_at: null }]);
  });

  it('updates recovery and plan flows (markSymptomRecovered, fetchPlan map, updatePlanTask)', () => {
    // seed symptoms
    let state = {
      ...initial,
      todaySymptoms: [
        { symptom: 'Cough', recovered_at: null },
        { symptom: 'Fever', recovered_at: null },
      ],
    };

    // markSymptomRecovered.fulfilled
    state = reducer(state, {
      type: markSymptomRecovered.fulfilled.type,
      payload: { symptom: 'Cough', recovered_at: '2024-01-02T10:00:00Z' },
    });
    expect(state.todaySymptoms.find(s => s.symptom === 'Cough')?.recovered_at)
      .toBe('2024-01-02T10:00:00Z');

    // fetchPlan.fulfilled maps severity -> severity_level
    const planPayload = {
      plan: [
        { category: 'Rest', task: 'Nap', severity: 1, done: false },
        { category: 'Hydration', task: 'Drink water', severity: 2, done: false },
      ],
    };
    state = reducer(state, { type: fetchPlan.fulfilled.type, payload: planPayload });
    expect(state.loadingPlan).toBe(false);
    expect(state.errorPlan).toBeNull();
    expect(state.planToday).toEqual([
      { category: 'Rest', task: 'Nap', severity: 1, done: false, severity_level: 1 },
      { category: 'Hydration', task: 'Drink water', severity: 2, done: false, severity_level: 2 },
    ]);

    // updatePlanTask.fulfilled toggles done for matching item
    state = reducer(state, {
      type: updatePlanTask.fulfilled.type,
      payload: { category: 'Rest', task: 'Nap', done: true },
    });
    const restTask = state.planToday.find(t => t.category === 'Rest' && t.task === 'Nap');
    expect(restTask?.done).toBe(true);
  });
});
