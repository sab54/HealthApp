// __mocks__/react-native-swiper.js
const React = require('react');
const { View } = require('react-native');

function Swiper({ children, ...rest }) {
  return React.createElement(View, rest, children);
}

module.exports = Swiper;
module.exports.default = Swiper;
