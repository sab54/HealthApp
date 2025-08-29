/**
 * Client/src/context/__tests__/ChatContext.test.js
 *
 * What This Test File Covers:
 *
 * 1) startNewChat
 *    - Creates a new chat with deterministic id, name, and two members.
 *
 * 2) sendMessage + simulateTyping
 *    - Adds a message, sets typing=true, then after 2s adds a bot reply and sets typing=false.
 *
 * 3) addReply
 *    - Appends a reply to an existing message.
 *
 * 4) addReaction
 *    - Appends a reaction to an existing message.
 */

import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { ChatProvider, ChatContext } from 'src/context/ChatContext';

jest.useFakeTimers();

// Deterministic uuid mock (counter lives INSIDE factory — no out-of-scope refs)
jest.mock('react-native-uuid', () => {
  let counter = 0;
  return {
    v4: jest.fn(() => {
      counter += 1;
      return `id-${counter}`;
    }),
  };
});

// Capture context synchronously using Context.Consumer (avoids async useEffect timing)
const Capture = ({ onCapture }) => (
  <ChatContext.Consumer>
    {(ctx) => {
      onCapture(ctx);
      return null;
    }}
  </ChatContext.Consumer>
);

describe('ChatContext', () => {
  let latest; // latest captured context
  const setLatest = (ctx) => {
    latest = ctx;
  };

  const renderWithProvider = () => {
    let renderer;
    act(() => {
      renderer = TestRenderer.create(
        <ChatProvider>
          <Capture onCapture={setLatest} />
        </ChatProvider>
      );
    });
    // After mount, latest is synchronously captured
    return renderer;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    latest = undefined;
  });

  it('startNewChat: creates a chat with two members and typing=false', () => {
    const renderer = renderWithProvider();

    act(() => {
      latest.startNewChat();
    });

    expect(latest.chats.length).toBe(1);

    const chat = latest.chats[0];
    expect(chat.id).toBe('id-1');          // chat id
    expect(chat.name).toBe('Group 1');
    expect(chat.members.length).toBe(2);
    expect(chat.members[0].id).toBe('id-2'); // member 1 id
    expect(chat.members[1].id).toBe('id-3'); // member 2 id
    expect(chat.typing).toBe(false);

    renderer.unmount();
  });

  it('sendMessage: adds message, sets typing=true, then bot reply after 2s and typing=false', () => {
    const renderer = renderWithProvider();

    act(() => {
      latest.startNewChat();
    });
    const chatId = latest.chats[0].id;

    act(() => {
      latest.sendMessage(chatId, 'Hello team');
    });

    // After sending:
    expect(latest.chats[0].messages.length).toBe(1);
    const myMsg = latest.chats[0].messages[0];
    expect(myMsg.text).toBe('Hello team');
    expect(latest.chats[0].typing).toBe(true);

    // Advance timers to trigger simulateTyping timeout
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(latest.chats[0].messages.length).toBe(2);
    const botMsg = latest.chats[0].messages[0];
    expect(botMsg.text).toBe('Got it!');
    expect(latest.chats[0].typing).toBe(false);

    renderer.unmount();
  });

  it('addReply: appends a reply to an existing message', () => {
    const renderer = renderWithProvider();

    act(() => {
      latest.startNewChat();
    });
    const chatId = latest.chats[0].id;

    act(() => {
      latest.sendMessage(chatId, 'Question?');
    });
    const messageId = latest.chats[0].messages[0].id;

    act(() => {
      latest.addReply(chatId, messageId, 'Answer');
    });

    const target = latest.chats[0].messages.find((m) => m.id === messageId);
    expect(target.replies.length).toBe(1);
    expect(target.replies[0].text).toBe('Answer');

    renderer.unmount();
  });

  it('addReaction: appends a reaction to an existing message', () => {
    const renderer = renderWithProvider();

    act(() => {
      latest.startNewChat();
    });
    const chatId = latest.chats[0].id;

    act(() => {
      latest.sendMessage(chatId, 'Status update');
    });
    const messageId = latest.chats[0].messages[0].id;

    act(() => {
      latest.addReaction(chatId, messageId, ':ok:'); // token text, no emoji
    });

    const target = latest.chats[0].messages.find((m) => m.id === messageId);
    expect(target.reactions.length).toBe(1);
    expect(target.reactions[0].emoji).toBe(':ok:');

    renderer.unmount();
  });
});
