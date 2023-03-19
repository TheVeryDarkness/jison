ts-jison examples
=================

Use ts-jison to generate parsers from an example, e.g.:
    $ node ../lib/cli.js basic_lex.jison

## [js]s-calculator
Generate compile and execute the usual calculator demo from both javascript (no type annotations) and typescript sources.

See the [Makefile](Makefile) which has targets for
- **js-calculator-demo**
  - use [../lib/cli.js](../lib/cli.js) to generate `js-calculator.js` from [js-calculator.jison](examples/js-calculator.jison) (has no typescript types)
  - exectute `js-calculator.js` against [calculator.input.txt](examples/calculator.input.txt) and send output to STDOUT
- **ts-calculator-demo**
  - use [../lib/cli.js](../lib/cli.js) to generate `ts-calculator.ts` from [ts-calculator.jison](examples/ts-calculator.jison) (has typescript types)
  - use `tsc` to compile `ts-calculator.js` from `ts-calculator.ts`
  - exectute against [calculator.input.txt](examples/calculator.input.txt) and send output to STDOUT
- **ts-node-calculator-demo**
  - use [../lib/cli.js](../lib/cli.js) to generate `ts-calculator.ts` from [ts-calculator.jison](examples/ts-calculator.jison) (has typescript types)
  - use `ts-node` to exectute `ts-calculator.ts` against [calculator.input.txt](examples/calculator.input.txt) and send output to STDOUT

