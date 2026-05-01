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
  coverageReporters: ["json-summary", "text", "lcov"],
  collectCoverage: true,
};

module.exports = createJestConfig(customJestConfig);
