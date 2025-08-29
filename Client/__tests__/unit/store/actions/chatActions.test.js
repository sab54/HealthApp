// __tests__/unit/store/actions/chatActions.test.js

/**
 * chatActions.test.js
 *
 * What These Tests Cover (4):
 *
 * 1) fetchActiveChats (success)
 * 2) fetchUserSuggestions (filters out current user)
 * 3) sendMessage (success)
 * 4) flushQueuedMessages (process + clear)
 *
 * Notes:
 * - The chatReducer mock defines its own jest.fn action creators INSIDE the factory,
 *   so we avoid out-of-scope variable references. We then require the mocked module
 *   to assert call counts/args.
 */

const mockGet = jest.fn();
const mockPost = jest.fn();
const mockDel = jest.fn();

jest.mock('src/utils/api', () => ({
  get: (...args) => mockGet(...args),
  post: (...args) => mockPost(...args),
  del: (...args) => mockDel(...args),
}));

jest.mock('src/utils/apiPaths.js', () => ({
  API_URL_CHAT: 'https://api.example.com/chat',
  API_URL_USERS: 'https://api.example.com/users',
}));

// Define reducer action creators inside the factory to avoid out-of-scope refs
jest.mock('src/store/reducers/chatReducer', () => {
  return {
    appendMessage: jest.fn((payload) => ({ type: 'chat/appendMessage', payload })),
    clearQueuedMessages: jest.fn((chatId) => ({ type: 'chat/clearQueuedMessages', payload: chatId })),
    markChatAsRead: jest.fn((payload) => ({ type: 'chat/markChatAsRead', payload })),
  };
});

// Import the mocked reducer so we can assert on its jest.fn calls
const chatReducer = require('src/store/reducers/chatReducer');

const {
  fetchActiveChats,
  fetchUserSuggestions,
  sendMessage,
  flushQueuedMessages,
} = require('src/store/actions/chatActions');

const makeHarness = (state = {}) => {
  const actions = [];
  const dispatch = (action) => {
    actions.push(action);
    return action;
  };
  const getState = () => state;
  return { dispatch, getState, actions };
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('chatActions thunks', () => {
  it('fetchActiveChats: calls GET with current user and fulfills with array', async () => {
    const state = { auth: { user: { id: 101 } } };
    const { dispatch, getState, actions } = makeHarness(state);

    mockGet.mockResolvedValueOnce({ data: [{ id: 1 }, { id: 2 }] });

    const final = await fetchActiveChats()(dispatch, getState, undefined);

    expect(mockGet).toHaveBeenCalledWith('https://api.example.com/chat/list/101');

    expect(actions[0].type).toBe('chat/fetchActiveChats/pending');
    expect(actions[1].type).toBe('chat/fetchActiveChats/fulfilled');
    expect(actions[1].payload).toEqual([{ id: 1 }, { id: 2 }]);

    expect(final.type).toBe('chat/fetchActiveChats/fulfilled');
    expect(final.payload).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('fetchUserSuggestions: encodes query and filters out current user', async () => {
    const state = { auth: { user: { id: 7 } } };
    const { dispatch, getState, actions } = makeHarness(state);

    const serverUsers = [{ id: 7, name: 'self' }, { id: 8, name: 'other' }];
    mockGet.mockResolvedValueOnce({ data: serverUsers });

    const search = 'dr. who?';
    const final = await fetchUserSuggestions(search)(dispatch, getState, undefined);

    expect(mockGet).toHaveBeenCalledWith(
      `https://api.example.com/users/suggestions?q=${encodeURIComponent(search)}`
    );

    expect(actions[0].type).toBe('chat/fetchUserSuggestions/pending');
    expect(actions[1].type).toBe('chat/fetchUserSuggestions/fulfilled');
    expect(actions[1].payload).toEqual([{ id: 8, name: 'other' }]);

    expect(final.payload).toEqual([{ id: 8, name: 'other' }]);
  });

  it('sendMessage: posts payload and returns normalized message', async () => {
    mockPost.mockResolvedValueOnce({ message_id: 'm-99' });

    const { dispatch, getState, actions } = makeHarness({});
    const args = { chatId: 22, senderId: 5, message: 'Hello', message_type: 'text' };

    const final = await sendMessage(args)(dispatch, getState, undefined);

    expect(mockPost).toHaveBeenCalledWith(
      'https://api.example.com/chat/22/messages',
      { sender_id: 5, message: 'Hello', message_type: 'text' }
    );

    expect(actions[0].type).toBe('chat/sendMessage/pending');
    expect(actions[1].type).toBe('chat/sendMessage/fulfilled');

    expect(final.payload.chatId).toBe(22);
    expect(final.payload.message).toMatchObject({
      id: 'm-99',
      chat_id: 22,
      sender: { id: 5 },
      content: 'Hello',
      message_type: 'text',
    });
    expect(typeof final.payload.message.timestamp).toBe('string');
  });

  it('flushQueuedMessages: sends queued, dispatches appendMessage for each, then clears', async () => {
    const chatId = 55;
    const state = {
      chat: {
        queuedMessagesByChatId: {
          [chatId]: [
            { sender_id: 1, content: 'A', message_type: 'text' },
            { sender_id: 2, content: 'B', message_type: 'text' },
          ],
        },
      },
    };
    const { dispatch, getState } = makeHarness(state);

    mockPost
      .mockResolvedValueOnce({ message_id: 'm1' })
      .mockResolvedValueOnce({ message_id: 'm2' });

    await flushQueuedMessages(chatId)(dispatch, getState, undefined);

    expect(mockPost).toHaveBeenNthCalledWith(
      1,
      'https://api.example.com/chat/55/messages',
      { sender_id: 1, message: 'A', message_type: 'text' }
    );
    expect(mockPost).toHaveBeenNthCalledWith(
      2,
      'https://api.example.com/chat/55/messages',
      { sender_id: 2, message: 'B', message_type: 'text' }
    );

    // Assert the mocked action creators were invoked with constructed messages
    expect(chatReducer.appendMessage).toHaveBeenCalledTimes(2);
    expect(chatReducer.appendMessage).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        chatId,
        message: expect.objectContaining({ id: 'm1', content: 'A', sender: { id: 1 } }),
      })
    );
    expect(chatReducer.appendMessage).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        chatId,
        message: expect.objectContaining({ id: 'm2', content: 'B', sender: { id: 2 } }),
      })
    );

    expect(chatReducer.clearQueuedMessages).toHaveBeenCalledWith(chatId);
  });
});
