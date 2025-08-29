/**
 * Client/src/components/__tests__/Footer.test.js
 *
 * What This Test File Covers:
 *
 * 1) Basic Rendering
 *    - Renders the "Designed by Sunidhi" text.
 *
 * 2) Theme Application (Background)
 *    - Applies container backgroundColor from theme.footerBackground.
 *
 * 3) Theme Application (Text Color)
 *    - Applies text color from theme.text.
 *
 * 4) Snapshot
 *    - Captures a stable snapshot of the rendered tree.
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import Footer from 'src/components/Footer';

const themeA = {
  footerBackground: '#101010',
  text: '#FFFFFF',
};

const themeB = {
  footerBackground: '#EEEEEE',
  text: '#222222',
};

// Helper to flatten potential style arrays into a single object
const flatten = (style) =>
  Array.isArray(style) ? Object.assign({}, ...style) : style || {};

// Walk a JSON tree returned by toJSON() and collect nodes
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

describe('Footer', () => {
  it('renders the footer text', () => {
    const { getByText } = render(<Footer theme={themeA} />);
    expect(getByText('Designed by Sunidhi')).toBeTruthy();
  });

  it('applies container background from theme.footerBackground', () => {
    const { toJSON, rerender } = render(<Footer theme={themeA} />);
    const jsonA = toJSON();
    const nodesA = collectNodes(jsonA);

    // First View is the container
    const containerA = nodesA.find((n) => n.type === 'View');
    const containerStyleA = flatten(containerA.props.style);
    expect(containerStyleA.backgroundColor).toBe(themeA.footerBackground);

    // Change theme and assert new background color
    rerender(<Footer theme={themeB} />);
    const jsonB = toJSON();
    const nodesB = collectNodes(jsonB);
    const containerB = nodesB.find((n) => n.type === 'View');
    const containerStyleB = flatten(containerB.props.style);
    expect(containerStyleB.backgroundColor).toBe(themeB.footerBackground);
  });

  it('applies text color from theme.text', () => {
    const { toJSON, rerender } = render(<Footer theme={themeA} />);
    const jsonA = toJSON();
    const nodesA = collectNodes(jsonA);

    const textNodeA = nodesA.find((n) => n.type === 'Text');
    const textStyleA = flatten(textNodeA.props.style);
    expect(textStyleA.color).toBe(themeA.text);

    rerender(<Footer theme={themeB} />);
    const jsonB = toJSON();
    const nodesB = collectNodes(jsonB);

    const textNodeB = nodesB.find((n) => n.type === 'Text');
    const textStyleB = flatten(textNodeB.props.style);
    expect(textStyleB.color).toBe(themeB.text);
  });

  it('matches snapshot', () => {
    const tree = render(<Footer theme={themeA} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
