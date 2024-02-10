/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch:["<rootDir>/tests/**/*.test.ts"],
  verbose: true,
  forceExit: true,
  clearMocks : true,
  // coverageDirectory: 'coverage',
  // coverageReporters: ['lcov', 'text', 'text-summary'],
  // collectCoverage: true,
  // collectCoverageFrom: ['src/**/*.ts'], // Adjust the path based on your project structure
  // coverageReporters: ['json', 'lcov', 'text', 'clover'],
  // testResultsProcessor: 'jest-sonar-reporter',
  // coverageReporters: [],
  
};
  