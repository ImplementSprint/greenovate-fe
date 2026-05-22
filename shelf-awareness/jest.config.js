const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  roots: ['<rootDir>/tests', '<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '<rootDir>/tests/e2e/'],
  modulePathIgnorePatterns: ['<rootDir>/.next/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/src/components/Logo.tsx',
    '<rootDir>/src/lib/csvParser.ts',
    '<rootDir>/src/lib/public-env.ts',
  ],
  coverageReporters: ['text', 'lcov', 'json-summary'],
};

module.exports = createJestConfig(customJestConfig);
