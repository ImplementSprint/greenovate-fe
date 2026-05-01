const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  testEnvironment: "jest-environment-jsdom",
  roots: ["<rootDir>/tests/unit"],
  testPathIgnorePatterns: ["/node_modules/", "/.next/", "<rootDir>/tests/e2e/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverage: true,
  collectCoverageFrom: [
    "src/utils/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
  ],
  coverageReporters: ["json-summary", "text", "lcov"],
};

module.exports = createJestConfig(customJestConfig);
