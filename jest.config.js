module.exports = {
    roots: ['<rootDir>/src'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    testRegex: '.*\.spec\.tsx?$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    coverageReporters: ['json', 'lcovonly', 'text', 'clover'],
    coveragePathIgnorePatterns: ['.mock.ts', '.mock.js']
};
