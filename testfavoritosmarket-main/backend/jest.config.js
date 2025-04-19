module.exports = {
  testEnvironment: 'node',
  setupFiles: ['./.jest/setEnvVars.js'],
  modulePathIgnorePatterns: ['<rootDir>/frontend'],
  testTimeout: 10000,
  verbose: true
};
