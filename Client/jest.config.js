// jest.config.js
const baseConfig = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup/jest.setup.js'],
  moduleDirectories: ['node_modules'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^src/(.*)$': '<rootDir>/src/$1', 
    '^react-native-swiper$': '<rootDir>/__mock__/react-native-swiper.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native'
      + '|@react-native'
      + '|@react-native-community' 
      + '|react-native-reanimated'
      + '|@react-navigation'
      + '|expo(nent)?'
      + '|@expo(nent)?/.*'
      + '|expo-.*'
      + '|expo-modules-core'
      + '|react-native-gesture-handler'
      + '|react-native-safe-area-context'
      + ')/)',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};

module.exports = {
  rootDir: __dirname,
  projects: [
    {
      displayName: 'android',
      ...baseConfig,
    },
    {
      displayName: 'ios',
      ...baseConfig,
    },
        {
      displayName: 'node',
      ...baseConfig,
    },
  ],
};
