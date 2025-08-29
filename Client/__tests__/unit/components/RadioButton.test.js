/**
 * src/components/__tests__/RadioButton.test.js
 *
 * What This Test File Covers:
 *
 * 1) Basic Rendering
 *    - Renders the provided label text.
 *
 * 2) Unselected State
 *    - No inner dot is rendered.
 *    - Outer ring uses radioBorder; background uses radioBackground.
 *
 * 3) Selected State
 *    - Inner dot is rendered with radioChecked color.
 *    - Outer ring uses radioChecked.
 *
 * 4) onPress Behaviour
 *    - Invokes onPress(value) when tapped.
 */

import React from 'react';
import { TouchableOpacity } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import RadioButton from 'src/components/RadioButton';

const themeColors = {
  radioChecked: '#0A84FF',
  radioBorder: '#CCCCCC',
  radioBackground: '#F4F4F4',
  text: '#111111',
};

const setup = (overrides = {}) =>
  render(
    <RadioButton
      label="Option A"
      value="A"
      selected={null}
      onPress={jest.fn()}
      themeColors={themeColors}
      {...overrides}
    />
  );

// Helper to flatten a style prop (StyleSheet arrays etc.)
const flatten = (style) => (Array.isArray(style) ? Object.assign({}, ...style) : style || {});

describe('RadioButton', () => {
  it('renders the label text', () => {
    const { getByText } = setup();
    expect(getByText('Option A')).toBeTruthy();
  });

  it('unselected: hides inner dot and applies border/background from theme', () => {
    const { toJSON } = setup({ selected: 'B' }); // not selected
    const json = toJSON();

    // Find the outer circle: View with width 20, height 20, borderWidth 2
    const stack = [];
    const walk = (node) => {
      if (!node || typeof node !== 'object') return;
      stack.push(node);
      if (node.children) node.children.forEach(walk);
    };
    walk(json);

    const outers = stack.filter((n) => {
      if (n.type !== 'View') return false;
      const s = flatten(n.props?.style);
      return s.width === 20 && s.height === 20 && s.borderWidth === 2;
    });
    expect(outers.length).toBeGreaterThan(0);

    const outerStyle = flatten(outers[0].props.style);
    expect(outerStyle.borderColor).toBe(themeColors.radioBorder);
    expect(outerStyle.backgroundColor).toBe(themeColors.radioBackground);

    // Inner dot (10x10) should NOT exist when unselected
    const innerDots = stack.filter((n) => {
      if (n.type !== 'View') return false;
      const s = flatten(n.props?.style);
      return s.width === 10 && s.height === 10 && s.borderRadius === 5;
    });
    expect(innerDots.length).toBe(0);
  });

  it('selected: shows inner dot and uses radioChecked for border and dot', () => {
    const { toJSON } = setup({ selected: 'A' }); // selected
    const json = toJSON();

    // Traverse
    const nodes = [];
    const walk = (n) => {
      if (!n || typeof n !== 'object') return;
      nodes.push(n);
      if (n.children) n.children.forEach(walk);
    };
    walk(json);

    const outers = nodes.filter((n) => {
      if (n.type !== 'View') return false;
      const s = flatten(n.props?.style);
      return s.width === 20 && s.height === 20 && s.borderWidth === 2;
    });
    expect(outers.length).toBeGreaterThan(0);
    const outerStyle = flatten(outers[0].props.style);
    expect(outerStyle.borderColor).toBe(themeColors.radioChecked);
    expect(outerStyle.backgroundColor).toBe(themeColors.radioBackground);

    const innerDots = nodes.filter((n) => {
      if (n.type !== 'View') return false;
      const s = flatten(n.props?.style);
      return s.width === 10 && s.height === 10 && s.borderRadius === 5;
    });
    expect(innerDots.length).toBe(1);
    const innerStyle = flatten(innerDots[0].props.style);
    expect(innerStyle.backgroundColor).toBe(themeColors.radioChecked);
  });

  it('calls onPress with its value when tapped', () => {
    const onPress = jest.fn();
    const { UNSAFE_getByType } = setup({ onPress });

    // Tap the touchable container
    const touchable = UNSAFE_getByType(TouchableOpacity);
    fireEvent.press(touchable);

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledWith('A');
  });
});
