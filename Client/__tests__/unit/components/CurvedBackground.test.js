/**
 * Client/src/components/__tests__/CurvedBackground.test.js
 *
 * What This Test File Covers:
 *
 * 1) Basic Rendering
 *    - Renders container and the mocked LinearGradient.
 *
 * 2) Transform (translateY)
 *    - Applies translateY value to the Animated.View container.
 *
 * 3) Layers Presence & Key Styles
 *    - Renders lavender glow and white core with expected dimensions/position.
 *
 * 4) Snapshot
 *    - Captures a stable snapshot of the rendered tree.
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import CurvedBackground from 'src/components/CurvedBackground';

// Mock expo-linear-gradient to avoid native issues and to allow prop inspection
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { ...props, testID: 'linear-gradient' }, children);
  },
}));

// Helper: flatten RN style arrays / objects
const flatten = (style) =>
  Array.isArray(style) ? Object.assign({}, ...style) : style || {};

// Traverse to collect all nodes from toJSON()
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

describe('CurvedBackground', () => {
  it('renders container and LinearGradient', () => {
    const { toJSON, getByTestId } = render(<CurvedBackground translateY={0} />);
    const json = toJSON();
    expect(json).toBeTruthy();

    // Mocked gradient is a View with testID
    const gradient = getByTestId('linear-gradient');
    expect(gradient).toBeTruthy();

    // Ensure gradient props carry expected config
    expect(gradient.props.colors).toEqual(['#e6e6fa', '#ffffff']);
    expect(gradient.props.start).toEqual({ x: 0.5, y: 0.5 });
    expect(gradient.props.end).toEqual({ x: 0.5, y: 1 });
  });

  it('applies translateY transform on the container', () => {
    const translateY = 30;
    const { toJSON } = render(<CurvedBackground translateY={translateY} />);
    const json = toJSON();
    const nodes = collectNodes(json);

    // Root container is the first View node in the tree
    const container = nodes.find((n) => n.type === 'View');
    const style = flatten(container.props.style);

    // transform is an array like [{ translateY: <value> }]
    expect(Array.isArray(style.transform)).toBe(true);
    const firstTransform = style.transform[0] || {};
    expect(firstTransform.translateY).toBe(translateY);
  });

  it('renders lavender glow and white core with expected sizes and positions', () => {
    const { toJSON } = render(<CurvedBackground translateY={0} />);
    const nodes = collectNodes(toJSON());

    // Find candidates by style heuristics
    const views = nodes.filter((n) => n.type === 'View');

    // Lavender glow: width 320, height 320, top 40, left 40, opacity 0.5, backgroundColor '#e6e6fa'
    const lavender = views.find((n) => {
      const s = flatten(n.props.style);
      return (
        s.width === 320 &&
        s.height === 320 &&
        s.top === 40 &&
        s.left === 40 &&
        s.opacity === 0.5 &&
        s.backgroundColor === '#e6e6fa'
      );
    });
    expect(lavender).toBeTruthy();

    // White core: width 200, height 200, top 100, left 100, opacity 0.8, backgroundColor '#ffffff'
    const whiteCore = views.find((n) => {
      const s = flatten(n.props.style);
      return (
        s.width === 200 &&
        s.height === 200 &&
        s.top === 100 &&
        s.left === 100 &&
        s.opacity === 0.8 &&
        s.backgroundColor === '#ffffff'
      );
    });
    expect(whiteCore).toBeTruthy();
  });

  it('matches snapshot', () => {
    const tree = render(<CurvedBackground translateY={10} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
