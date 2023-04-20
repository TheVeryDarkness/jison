const Jison = require("../tests/setup").Jison,
    Lexer = require("../tests/setup").Lexer;
const { JisonParser } = require('@ts-jison/parser');
Shared = require("../tests/extend-expect");
Jison.print = Shared.print;
afterEach(Shared.nothingPrinted);

const lexData = {
    rules: [
      {pattern: "x", action: "return 'x';"},
      {pattern: "y", action: "return 'y';"}
    ]
};

describe("lr0", () => {
  it("test left-recursive nullable grammar", () => {

    const grammar = {
      tokens: [ 'x' ],
      startSymbol: "A",
      bnf: {
        "A" :[ 'A x',
               ''      ]
      }
    };

    const parser = new Jison.Parser(grammar, {type: "lr0"});
    parser.lexer = new Lexer(lexData);

    expect(parser.parse('xxx')).toParse("parse 3 x's");
    expect(parser.parse("x")).toParse("parse single x");
    expect(() => { parser.parse("y"); }).toThrow("Parsing halted while starting to recover from another error.");
  });

  it("test right-recursive nullable grammar", () => {

    const grammar = {
      tokens: [ 'x' ],
      startSymbol: "A",
      bnf: {
        "A" :[ 'x A',
               ''      ]
      }
    };

    const gen = new Jison.Generator(grammar, {type: "lr0"});
    expect().printed([
  `Conflict in grammar: multiple actions possible when lookahead token is x in state 0
- reduce by rule: A -> 
- shift token (then go to state 2)`,
  `Conflict in grammar: multiple actions possible when lookahead token is x in state 2
- reduce by rule: A -> 
- shift token (then go to state 2)`,
  `
States with conflicts:`,
  `State 0`,
  `  $accept -> .A $end #lookaheads= $end
  A -> .x A
  A -> .`,
  `State 2`,
  `  A -> x .A
  A -> .x A
  A -> .`,
]
    );

    expect(gen.table.length).toBe(4);
    expect(gen.conflicts).toBe(2);
  });

  it("test 0+0 grammar", () => {
    const lexData2 = {
      rules: [
        {pattern: "0", action: "return 'ZERO';"},
        {pattern: "\\+", action: "return 'PLUS';"}
      ]
    };
    const grammar = {
      tokens: [ "ZERO", "PLUS"],
      startSymbol: "E",
      bnf: {
        "E" :[ "E PLUS T",
               "T"      ],
        "T" :[ "ZERO" ]
      }
    };

    const parser = new Jison.Parser(grammar, {type: "lr0"});
    parser.lexer = new Lexer(lexData2);

    expect(parser.parse("0+0+0")).toParse("parse");
    expect(parser.parse("0")).toParse("parse single 0");

    expect(() => { parser.parse("+"); }).toThrow(/^Parse error on line 1/);
  });
});
