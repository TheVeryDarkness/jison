module.exports = {
    testRegex: ".*(/test/.*|(\\.|/)test)\\.js$",
    // testRegex: "(/test/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
    // testRegex: "__tests__/parseAndPrint-test.ts$",
    // "testMatch": [__dirname + "packages/*/test/*-test.js"],
    testPathIgnorePatterns: ["/dist/", "/node_modules/"],
    coveragePathIgnorePatterns: [ "dist" ],
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    collectCoverage: true,
    preset: 'ts-jest',
};
const wilNeed = {
    transform999: {
        "^.+\\.tsx?$": "ts-jest",
    },
};
