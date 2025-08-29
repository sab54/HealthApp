// __tests__/unit/store/index.test.js

/**
 * store.index.test.js
 *
 * What These Tests Cover:
 * 1) Store Initialization
 * 2) Slice-Scoped Dispatch (auth)
 * 3) Unknown Action is no-op
 * 4) Multiple Slice Updates independently
 *
 * Notes:
 * - We use jest.isolateModules() to re-require a fresh store instance
 *   for each test, avoiding state bleed without needing the root reducer.
 */

const { configureStore } = require('@reduxjs/toolkit');

// Deterministic mock reducer factory
const makeReducer = (marker, type) => (state = { marker, v: 0 }, action) =>
  action.type === type ? { ...state, v: state.v + 1 } : state;

// IMPORTANT: Match your actual tree: src/store/...
// Mock each reducer BEFORE requiring the store module
jest.mock('../../../src/store/reducers/loginReducer', () =>
  makeReducer('auth', 'AUTH_PING')
);
jest.mock('../../../src/store/reducers/registrationReducer', () =>
  makeReducer('registration', 'REG_PING')
);
jest.mock('../../../src/store/reducers/emergencyReducer', () =>
  makeReducer('emergency', 'EMERGENCY_PING')
);
jest.mock('../../../src/store/reducers/weatherReducer', () =>
  makeReducer('weather', 'WEATHER_PING')
);
jest.mock('../../../src/store/reducers/chatReducer', () =>
  makeReducer('chat', 'CHAT_PING')
);
jest.mock('../../../src/store/reducers/settingsReducer', () =>
  makeReducer('settings', 'SETTINGS_PING')
);
jest.mock('../../../src/store/reducers/healthlogReducers', () =>
  makeReducer('healthlog', 'HEALTHLOG_PING')
);
jest.mock('../../../src/store/reducers/appointmentReducers', () =>
  makeReducer('appointment', 'APPT_PING')
);
jest.mock('../../../src/store/reducers/themeReducer', () =>
  makeReducer('theme', 'THEME_PING')
);

// Helper to obtain a fresh store instance each test
const getFreshStore = () => {
  let freshStore;
  jest.isolateModules(() => {
    // Require inside isolateModules so Jest instantiates a new module graph
    const { store } = require('../../../src/store/index');
    freshStore = store;
  });
  return freshStore;
};

describe('Redux Store (src/store/index.js)', () => {
  let store;

  beforeEach(() => {
    store = getFreshStore();
  });

  it('initializes with all expected slice keys and default state', () => {
    const state = store.getState();

    expect(Object.keys(state).sort()).toEqual(
      [
        'auth',
        'registration',
        'theme',
        'settings',
        'healthlog',
        'weather',
        'chat',
        'appointment',
        'emergency',
      ].sort()
    );

    expect(state.auth).toEqual({ marker: 'auth', v: 0 });
    expect(state.registration).toEqual({ marker: 'registration', v: 0 });
    expect(state.theme).toEqual({ marker: 'theme', v: 0 });
    expect(state.settings).toEqual({ marker: 'settings', v: 0 });
    expect(state.healthlog).toEqual({ marker: 'healthlog', v: 0 });
    expect(state.weather).toEqual({ marker: 'weather', v: 0 });
    expect(state.chat).toEqual({ marker: 'chat', v: 0 });
    expect(state.appointment).toEqual({ marker: 'appointment', v: 0 });
    expect(state.emergency).toEqual({ marker: 'emergency', v: 0 });
  });

  it('routes dispatch only to the intended slice (auth)', () => {
    const before = store.getState();

    store.dispatch({ type: 'AUTH_PING' });
    const after = store.getState();

    expect(after.auth.v).toBe(before.auth.v + 1);

    expect(after.registration).toEqual(before.registration);
    expect(after.theme).toEqual(before.theme);
    expect(after.settings).toEqual(before.settings);
    expect(after.healthlog).toEqual(before.healthlog);
    expect(after.weather).toEqual(before.weather);
    expect(after.chat).toEqual(before.chat);
    expect(after.appointment).toEqual(before.appointment);
    expect(after.emergency).toEqual(before.emergency);
  });

  it('unknown actions do not mutate state', () => {
    const before = store.getState();
    store.dispatch({ type: 'SOME_UNKNOWN_ACTION' });
    const after = store.getState();
    expect(after).toEqual(before);
  });

  it('updates multiple slices independently when their actions are dispatched', () => {
    const before = store.getState();

    store.dispatch({ type: 'WEATHER_PING' });
    store.dispatch({ type: 'CHAT_PING' });

    const after = store.getState();

    expect(after.weather.v).toBe(before.weather.v + 1);
    expect(after.chat.v).toBe(before.chat.v + 1);

    expect(after.auth).toEqual(before.auth);
    expect(after.registration).toEqual(before.registration);
    expect(after.theme).toEqual(before.theme);
    expect(after.settings).toEqual(before.settings);
    expect(after.healthlog).toEqual(before.healthlog);
    expect(after.appointment).toEqual(before.appointment);
    expect(after.emergency).toEqual(before.emergency);
  });
});
