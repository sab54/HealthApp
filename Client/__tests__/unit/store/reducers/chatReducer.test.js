/**
 * chatReducer.test.js
 *
 * What This Test File Covers:
 *
 * 1. Initial & Basic Reducers
 *    - Returns initial state.
 *    - updateActiveChatsFromSocket accepts arrays only (non-array -> []).
 *    - setTypingUser adds uniquely; removeTypingUser removes.
 *
 * 2. Message Deduping
 *    - appendMessage adds when missing and ignores duplicates.
 *    - sendMessage.fulfilled also dedupes by id.
 *
 * 3. Pending Queue
 *    - queuePendingMessage creates a temp pending message and mirrors it into messages.
 *    - clearQueuedMessages removes the queued list for that chat.
 *
 * 4. Common Extra Reducers
 *    - startDirectMessage.fulfilled normalizes chat and unshifts when not existing.
 *    - createGroupChat.fulfilled adds group and clears draftGroupUsers.
 *    - deleteChat.fulfilled removes the chat and its messages.
 */

import reducer, {
  updateActiveChatsFromSocket,
  appendMessage,
  queuePendingMessage,
  clearQueuedMessages,
  setTypingUser,
  removeTypingUser,
} from '@/store/reducers/chatReducer';

import {
  fetchUserSuggestions,
  fetchActiveChats,
  startDirectMessage,
  createGroupChat,
  fetchMessages,
  sendMessage,
  deleteChat,
  markChatAsReadThunk,
  removeUserFromGroup,
  fetchChatById,
  createOrFetchChat,
  addUserToDraftGroup,
  removeUserFromDraftGroup,
  clearDraftGroupUsers,
} from '@/store/actions/chatActions';

describe('chatReducer', () => {
  const initial = {
    allUsers: [],
    draftGroupUsers: [],
    activeChats: [],
    messagesByChatId: {},
    lastReadByChatId: {},
    queuedMessagesByChatId: {},
    typingUsersByChatId: {},
    loading: false,
    error: null,
  };

  it('returns initial state and handles basic reducers (socket + typing users)', () => {
    // initial
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial);

    // updateActiveChatsFromSocket with array
    const chats = [{ id: 'c1' }, { id: 'c2' }];
    let state = reducer(initial, updateActiveChatsFromSocket(chats));
    expect(state.activeChats).toEqual(chats);

    // non-array payload -> []
    state = reducer(state, updateActiveChatsFromSocket(null));
    expect(state.activeChats).toEqual([]);

    // setTypingUser adds uniquely
    state = reducer(state, setTypingUser({ chatId: 'c1', user: { id: 'u1', name: 'A' } }));
    state = reducer(state, setTypingUser({ chatId: 'c1', user: { id: 'u1', name: 'A (dup)' } }));
    expect(state.typingUsersByChatId['c1']).toHaveLength(1);

    // removeTypingUser actually removes
    state = reducer(state, removeTypingUser({ chatId: 'c1', userId: 'u1' }));
    expect(state.typingUsersByChatId['c1']).toEqual([]);
  });

  it('dedupes messages for appendMessage and sendMessage.fulfilled', () => {
    const base = { ...initial };
    const msg = { id: 'm1', content: 'hello' };
    let state = reducer(base, appendMessage({ chatId: 'cA', message: msg }));
    // duplicate append ignored
    state = reducer(state, appendMessage({ chatId: 'cA', message: msg }));
    expect(state.messagesByChatId['cA']).toHaveLength(1);

    // sendMessage.fulfilled also dedupes
    state = reducer(
      state,
      { type: sendMessage.fulfilled.type, payload: { chatId: 'cA', message: msg } }
    );
    expect(state.messagesByChatId['cA']).toHaveLength(1);

    // new message id should be added
    const msg2 = { id: 'm2', content: 'world' };
    state = reducer(
      state,
      { type: sendMessage.fulfilled.type, payload: { chatId: 'cA', message: msg2 } }
    );
    expect(state.messagesByChatId['cA']).toHaveLength(2);
  });

  it('queues a pending message and clears queued list', () => {
    const fixedNow = 1700000000000;
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(fixedNow);

    let state = reducer(initial, queuePendingMessage({
      chatId: 'cQ',
      senderId: 'user-1',
      message: 'draft msg',
    }));

    // queued bucket created
    expect(state.queuedMessagesByChatId['cQ']).toHaveLength(1);
    const queued = state.queuedMessagesByChatId['cQ'][0];
    expect(queued.id).toBe(`temp-${fixedNow}`);
    expect(queued.status).toBe('pending');
    expect(queued.chat_id).toBe('cQ');
    expect(queued.sender).toEqual({ id: 'user-1' });

    // mirrored into messages as well
    expect(state.messagesByChatId['cQ']).toHaveLength(1);
    expect(state.messagesByChatId['cQ'][0].id).toBe(`temp-${fixedNow}`);

    // clearQueuedMessages removes the queued list (messages remain untouched)
    state = reducer(state, clearQueuedMessages('cQ'));
    expect(state.queuedMessagesByChatId['cQ']).toBeUndefined();
    expect(state.messagesByChatId['cQ']).toHaveLength(1);

    nowSpy.mockRestore();
  });

  it('handles common async flows (start DM, create group, delete chat)', () => {
    // startDirectMessage adds normalized chat at the front if not existing
    const dmPayload = {
      id: 'dm-1',
      members: [{ id: 'u1', name: 'A' }, { id: 'me', name: 'Me' }],
    };
    let state = reducer(
      initial,
      { type: startDirectMessage.fulfilled.type, payload: dmPayload, meta: { arg: 'me' } }
    );
    expect(state.activeChats[0]).toMatchObject({
      id: 'dm-1',
      chat_id: 'dm-1',
      members: expect.any(Array),
    });

    // createGroupChat adds if not exists and clears draftGroupUsers
    state = reducer(
      { ...state, draftGroupUsers: [{ id: 'u2' }] },
      {
        type: createGroupChat.fulfilled.type,
        payload: { id: 'g-1', chat_name: 'Team', members: [{ id: 'me' }, { id: 'u2' }] },
      }
    );
    expect(state.activeChats.find((c) => c.id === 'g-1' || c.chat_id === 'g-1')).toBeTruthy();
    expect(state.draftGroupUsers).toEqual([]);

    // seed messages then deleteChat removes chat and its messagesByChatId entry
    state = reducer(
      { ...state, messagesByChatId: { 'g-1': [{ id: 'm' }] } },
      { type: deleteChat.fulfilled.type, payload: 'g-1' }
    );
    expect(state.activeChats.some((c) => c.id === 'g-1' || c.chat_id === 'g-1')).toBe(false);
    expect(state.messagesByChatId['g-1']).toBeUndefined();
  });
});
