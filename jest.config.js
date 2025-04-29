/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/utils/test-setup.ts'],
  transform: {
    '^.+\\.(ts)$': 'ts-jest',
  },
  testMatch: ['**/src/tests/**/*.(spec|test).ts'],
};
