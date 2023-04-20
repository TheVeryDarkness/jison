const Jison = require("../tests/setup").Jison,
    Lexer = require("../tests/setup").Lexer;
Shared = require("../tests/extend-expect");
Jison.print = Shared.print;
afterEach(Shared.nothingPrinted);

const lexData = {
    rules: [
      {pattern: "x", action: "return 'x';"},
      {pattern: "y", action: "return 'y';"}
    ]
};

describe("slr", () => {
  it("test left-recursive nullable grammar", () => {

    var grammar = {
      tokens: [ 'x' ],
      startSymbol: "A",
      bnf: {
        "A" :[ 'A x',
               ''      ]
      }
    };

    var gen = new Jison.Generator(grammar, {type: "slr"});
    var parser = gen.createParser();
    parser.lexer = new Lexer(lexData);

    expect(parser.parse('xxx')).toParse("parse 3 x's");
    expect(parser.parse("x")).toParse("parse single x");
    expect(() => { parser.parse("y"); }).toThrow(/^Parse error on line 1/);
    expect(gen.conflicts).toBe(0);
  });

  it("test right-recursive nullable grammar", () => {

    var grammar = {
      tokens: [ 'x' ],
      startSymbol: "A",
      bnf: {
        "A" :[ 'x A',
               ''      ]
      }
    };

    var gen = new Jison.Generator(grammar, {type: "slr"});
    var parser = gen.createParser();
    parser.lexer = new Lexer(lexData);

    expect(parser.parse('xxx')).toParse("parse 3 x's");
    expect(gen.table.length).toBe(4);
    expect(gen.conflicts).toBe(0);
    expect(gen.nullable('A')).toBe(true);
  });
});
