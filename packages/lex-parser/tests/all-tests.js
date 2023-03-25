exports.testLexParser = require("../../lexer-generator/tests/regexplexer.js"); // ./lexparser

if (require.main === module)
    process.exit(require("test").run(exports));
