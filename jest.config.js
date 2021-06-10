module.exports = {
    roots: [
        "<rootDir>/tests"
    ],
    testRegex: 'tests/(.+)\\.test\\.(jsx|tsx?)$',
    transform: {
        "^.+\\.(ts|tsx)?$" : "ts-jest"
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}
