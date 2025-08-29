// __tests__/unit/store/actions/appointmentActions.test.js

/**
 * appointmentActions.test.js
 *
 * What These Tests Cover:
 *
 * 1) Success path
 *    - Calls post() with correct URL and payload
 *    - Dispatches pending then fulfilled with the server response
 *
 * 2) Failure with error message
 *    - post() rejects with Error('msg'); rejected action.payload is that message
 *
 * 3) Failure without error message
 *    - post() rejects with an object missing `message`; uses default fallback text
 */

const mockPost = jest.fn();
jest.mock('src/utils/api', () => ({
  post: (...args) => mockPost(...args),
}));

jest.mock('src/utils/apiPaths', () => ({
  API_URL_APPOINTMENT: 'https://api.example.com/appointment',
}));

const { bookAppointment } = require('src/store/actions/appointmentActions');

describe('bookAppointment thunk', () => {
  const baseArgs = {
    date: '2025-01-15',
    time: '09:30',
    reason: 'Checkup',
    createdBy: 'user-1',
    chatId: 'chat-42',
  };

  const makeDispatch = () => {
    const actions = [];
    const dispatch = (action) => {
      actions.push(action);
      return action;
    };
    return { dispatch, actions, getState: () => ({}) };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('dispatches pending then fulfilled and calls post with correct URL and payload', async () => {
    // Thunk currently fulfills with an array payload
    const serverResponse = [];
    mockPost.mockResolvedValueOnce(serverResponse);

    const { dispatch, actions, getState } = makeDispatch();

    const thunk = bookAppointment(baseArgs);
    const finalAction = await thunk(dispatch, getState, undefined);

    expect(mockPost).toHaveBeenCalledWith(
      'https://api.example.com/appointment/ai-book',
      baseArgs
    );

    expect(actions).toHaveLength(2);
    expect(actions[0].type).toBe('appointment/bookAppointment/pending');
    expect(actions[1].type).toBe('appointment/bookAppointment/fulfilled');
    expect(actions[1].payload).toEqual(serverResponse);

    // The returned action from dispatching the thunk is the terminal action
    expect(finalAction.type).toBe('appointment/bookAppointment/fulfilled');
    expect(finalAction.payload).toEqual(serverResponse);
  });

  it('dispatches rejected with provided error message when post throws Error(message)', async () => {
    mockPost.mockRejectedValueOnce(new Error('Network down'));

    const { dispatch, actions, getState } = makeDispatch();

    const finalAction = await bookAppointment(baseArgs)(dispatch, getState, undefined);

    expect(actions).toHaveLength(2);
    expect(actions[0].type).toBe('appointment/bookAppointment/pending');
    expect(actions[1].type).toBe('appointment/bookAppointment/rejected');

    expect(finalAction.type).toBe('appointment/bookAppointment/rejected');
    expect(finalAction.payload).toBe('Network down');
  });

  it('falls back to default error text when thrown error has no message', async () => {
    mockPost.mockRejectedValueOnce({}); // no `message`

    const { dispatch, actions, getState } = makeDispatch();

    const finalAction = await bookAppointment(baseArgs)(dispatch, getState, undefined);

    expect(actions[0].type).toBe('appointment/bookAppointment/pending');
    expect(actions[1].type).toBe('appointment/bookAppointment/rejected');

    expect(finalAction.payload).toBe('Failed to book appointment');
  });
});
