exports.testLexParser = require("../../lexer-generator/tests/regexplexer.js"); // ./lexparser
console.log(exports)
if (require.main === module)
    process.exit(require("test").run(exports));
