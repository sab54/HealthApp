/**
 * chatSelectors.test.js
 *
 * What This Test File Covers:
 *
 * 1. selectTypingUsersByChatId
 *    - Returns empty array when chatId not found.
 *    - Returns array of users when present.
 *
 * 2. selectMessagesByChatId
 *    - Returns empty array when chatId not found.
 *    - Returns array of messages when present.
 *
 * 3. Memoization
 *    - Selector memoizes output when state slice does not change.
 */

import {
  selectTypingUsersByChatId,
  selectMessagesByChatId,
} from '@/store/selectors/chatSelectors';

describe('chatSelectors', () => {
  const baseState = {
    chat: {
      typingUsersByChatId: {
        c1: [{ id: 'u1', name: 'Alice' }],
      },
      messagesByChatId: {
        c1: [{ id: 'm1', content: 'Hi' }],
      },
    },
  };

  it('selectTypingUsersByChatId returns users or empty array', () => {
    const selector = selectTypingUsersByChatId('c1');
    expect(selector(baseState)).toEqual([{ id: 'u1', name: 'Alice' }]);

    const selectorEmpty = selectTypingUsersByChatId('cX');
    expect(selectorEmpty(baseState)).toEqual([]);
  });

  it('selectMessagesByChatId returns messages or empty array', () => {
    const selector = selectMessagesByChatId('c1');
    expect(selector(baseState)).toEqual([{ id: 'm1', content: 'Hi' }]);

    const selectorEmpty = selectMessagesByChatId('cX');
    expect(selectorEmpty(baseState)).toEqual([]);
  });

  it('memoizes when state slice is unchanged', () => {
    const selector = selectTypingUsersByChatId('c1');
    const first = selector(baseState);
    const second = selector(baseState);
    expect(first).toBe(second); // same reference due to memoization
  });
});
