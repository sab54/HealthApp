module.exports = {
  projects: [
    {
      displayName: 'ios',
      preset: 'jest-expo',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/**/*.test.js'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    },
    {
      displayName: 'android',
      preset: 'jest-expo',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/**/*.test.js'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    },
    // {
    //   displayName: 'web',
    //   preset: 'jest-expo/web',
    //   testEnvironment: 'jsdom',
    //   testMatch: ['<rootDir>/**/*.test.js'],
    //   setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    //   moduleNameMapper: {
    //     '^react-native$': 'react-native-web'
    //   }
    // },
    {
      displayName: 'node',
      preset: 'jest-expo',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/**/*.test.js'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    }
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
