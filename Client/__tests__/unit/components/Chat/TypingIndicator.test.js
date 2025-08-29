/**
 * Client/src/components/Chat/__tests__/TypingIndicator.test.js
 *
 * What This Test File Covers:
 *
 * 1) Basic Rendering
 *    - Renders default "Typing..." text and three animated dots.
 *
 * 2) Username Text Logic
 *    - 1 username: "<name> is typing..."
 *    - 2 usernames: "<name1> and <name2> are typing..."
 *    - 3+ usernames: "Multiple people are typing..."
 *
 * 3) Theming & Styles
 *    - Wrapper background uses theme.surface
 *    - Text color uses theme.text
 *    - Dots use theme.link for background and expected sizing
 *
 * 4) Animation Safety
 *    - Mocks Animated.* APIs so tests don't depend on native timing.
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Animated } from 'react-native';
import TypingIndicator from 'src/components/Chat/TypingIndicator';

// ---- Mock RN Animated APIs so no native work happens during tests ----
beforeAll(() => {
  jest.spyOn(Animated, 'timing').mockImplementation(() => ({ start: jest.fn() }));
  jest.spyOn(Animated, 'sequence').mockImplementation(() => ({ start: jest.fn() }));
  jest.spyOn(Animated, 'loop').mockImplementation(() => ({ start: jest.fn() }));
  jest.spyOn(Animated, 'delay').mockImplementation(() => ({ start: jest.fn() }));
});

afterAll(() => {
  jest.restoreAllMocks();
});

// ----- Helpers -----
const theme = {
  surface: '#ffffff',
  text: '#111111',
  link: '#5B8CFF',
};

const flatten = (style) =>
  Array.isArray(style) ? Object.assign({}, ...style) : (style || {});

const collectNodes = (json) => {
  const out = [];
  const walk = (n) => {
    if (!n || typeof n !== 'object') return;
    out.push(n);
    if (n.children) n.children.forEach(walk);
  };
  walk(json);
  return out;
};

describe('TypingIndicator', () => {
  it('renders default "Typing..." text and three dots', () => {
    const { toJSON, getByText } = render(<TypingIndicator theme={theme} />);

    // Text
    expect(getByText('Typing...')).toBeTruthy();

    // Find three Animated.View dots by style heuristic (width:8, height:8)
    const nodes = collectNodes(toJSON());
    const dots = nodes.filter((n) => {
      if (n.type !== 'View') return false; // Animated.View renders as View in test JSON
      const s = flatten(n.props?.style);
      return s.width === 8 && s.height === 8 && s.borderRadius === 4;
    });
    expect(dots.length).toBe(3);
  });

  it('shows "<name> is typing..." when one username is provided', () => {
    const { getByText } = render(
      <TypingIndicator theme={theme} usernames={['Alice']} />
    );
    expect(getByText('Alice is typing...')).toBeTruthy();
  });

  it('shows "<name1> and <name2> are typing..." when two usernames are provided', () => {
    const { getByText } = render(
      <TypingIndicator theme={theme} usernames={['Alice', 'Bob']} />
    );
    expect(getByText('Alice and Bob are typing...')).toBeTruthy();
  });

  it('shows "Multiple people are typing..." when three or more usernames are provided', () => {
    const { getByText } = render(
      <TypingIndicator theme={theme} usernames={['Alice', 'Bob', 'Cara']} />
    );
    expect(getByText('Multiple people are typing...')).toBeTruthy();
  });

  it('applies theme colors to wrapper, text, and dots', () => {
    const { toJSON } = render(<TypingIndicator theme={theme} />);
    const nodes = collectNodes(toJSON());

    // Wrapper container (first View with paddingHorizontal:16 and backgroundColor)
    const wrapper = nodes.find((n) => {
      if (n.type !== 'View') return false;
      const s = flatten(n.props?.style);
      return s.paddingHorizontal === 16 && s.backgroundColor === theme.surface;
    });
    expect(wrapper).toBeTruthy();

    // Text node has color: theme.text
    const textNode = nodes.find((n) => n.type === 'Text' && Array.isArray(n.children) && /typing/i.test(n.children.join('')));
    expect(textNode).toBeTruthy();
    const textStyle = flatten(textNode.props.style);
    expect(textStyle.color).toBe(theme.text);

    // Dots use theme.link as background
    const dots = nodes.filter((n) => {
      if (n.type !== 'View') return false;
      const s = flatten(n.props?.style);
      return s.width === 8 && s.height === 8 && s.borderRadius === 4;
    });
    expect(dots.length).toBe(3);
    dots.forEach((d) => {
      const s = flatten(d.props.style);
      expect(s.backgroundColor).toBe(theme.link);
    });
  });
});
