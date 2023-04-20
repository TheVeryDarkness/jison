const Jison = require("../tests/setup").Jison,
      Lexer = require("../tests/setup").Lexer;
Shared = require("../tests/extend-expect");
Jison.print = Shared.print;
afterEach(Shared.nothingPrinted);

describe("errorlab", () => {
  it("test error caught", () => {
    var lexData = {
      rules: [
        {pattern: "x", action: "return 'x';"},
        {pattern: "y", action: "return 'y';"},
        {pattern: ".", action: "return 'ERR';"}
      ]
    };
    var grammar = {
      bnf: {
        "A" :['A x',
              'A y',
              [ 'A error', "return 'caught';" ],
              ''      ]
      }
    };

    var parser = new Jison.Parser(grammar, {type: "lr0"});
    parser.lexer = new Lexer(lexData);
    expect(parser.parse('xxy')).toParse("should parse");
    expect(parser.parse('xyg')).toBe("caught"); // should return 'caught'
  });

  it("test error recovery", () => {
    var lexData = {
      rules: [
        {pattern: "x", action: "return 'x';"},
        {pattern: "y", action: "return 'y';"},
        {pattern: ".", action: "return 'ERR';"}
      ]
    };
    var grammar = {
      bnf: {
        "A" :['A x',
              ['A y', "return 'recovery'"],
              'A error',
              ''      ]
      }
    };

    var parser = new Jison.Parser(grammar, {type: "lr0"});
    parser.lexer = new Lexer(lexData);
    expect(parser.parse('xxgy')).toBe("recovery"); // should return foo
  });

  it("test deep error recovery", () => {
    var lexData = {
      rules: [
        {pattern: "x", action: "return 'x';"},
        {pattern: "y", action: "return 'y';"},
        {pattern: "g", action: "return 'g';"},
        {pattern: ";", action: "return ';';"},
        {pattern: ".", action: "return 'ERR';"}
      ]
    };
    var grammar = {
      bnf: {
        "S" :['g A ;',
              ['g error ;', 'return "nested"']
             ],
        "A" :['A x',
              'x' ]
      }
    };

    var parser = new Jison.Parser(grammar, {type: "lr0"});
    parser.lexer = new Lexer(lexData);
    expect(parser.parse('gxxx;')).toParse("should parse");
    expect(parser.parse('gxxg;')).toBe("nested"); // should return nested
  });

  it("test no recovery", () => {
    var lexData = {
      rules: [
        {pattern: "x", action: "return 'x';"},
        {pattern: "y", action: "return 'y';"},
        {pattern: ".", action: "return 'ERR';"}
      ]
    };
    var grammar = {
      bnf: {
        "A" :['A x',
              ['A y', "return 'recovery'"],
              ''      ]
      }
    };

    var parser = new Jison.Parser(grammar, {type: "lr0"});
    parser.lexer = new Lexer(lexData);
    expect(() => { parser.parse('xxgy'); }).toThrow(/^Parsing halted while starting to recover from another error./);
  });

  it("test error after error recovery", () => {
    var lexData = {
      rules: [
        {pattern: "x", action: "return 'x';"},
        {pattern: "y", action: "return 'y';"},
        {pattern: "g", action: "return 'g';"},
        {pattern: ".", action: "return 'ERR';"}
      ]
    };
    var grammar = {
      bnf: {
        "S" :['g A y',
              ['g error y', 'return "nested"']
             ],
        "A" :['A x',
              'x' ]
      }
    };

    var parser = new Jison.Parser(grammar, {type: "lr0"});
    parser.lexer = new Lexer(lexData);
    expect(() => { parser.parse('gxxx;'); }).toThrow(/^Parsing halted while starting to recover from another error./)
  });

  it("test throws error despite recovery rule",() => {
    var lexData2 = {
      rules: [
        {pattern: "0", action: "return 'ZERO';"},
        {pattern: "\\+", action: "return 'PLUS';"},
        {pattern: ";", action: "return ';';"},
        {pattern: ".", action: "return 'INVALID'"},
        {pattern: "$", action: "return 'EOF';"}
      ]
    };
    var grammar = {
      bnf: {
        "S" :[ [ "Exp EOF",    "return $1" ]],
        "Exp" :[ [ "E ;",    "$$ = $1;" ],
                 [ "E error", "$$ = $1;" ]],
        "E" :[ [ "E PLUS T", "$$ = ['+',$1,$3]"  ],
               [ "T",        "$$ = $1" ]  ],
        "T" :[ [ "ZERO",     "$$ = [0]" ] ]
      }
    };

    var parser = new Jison.Parser(grammar, {debug: true});
    expect().printed([
  `Processing grammar.`,
  `$accept(0)`,
  `$end(1)`,
  `error(2)`,
  `S(3)`,
  `Exp(4)`,
  `EOF(5)`,
  `E(6)`,
  `;(7)`,
  `PLUS(8)`,
  `T(9)`,
  `ZERO(10)`,
  `
Item sets
------`,
  `
item set 0 
$accept -> .S $end #lookaheads= $end
S -> .Exp EOF
Exp -> .E ;
Exp -> .E error
E -> .E PLUS T
E -> .T
T -> .ZERO 
transitions ->  {\"S\":1,\"Exp\":2,\"E\":3,\"T\":4,\"ZERO\":5}`,
  `
item set 1 
$accept -> S .$end #lookaheads= $end 
transitions ->  {}`,
  `
item set 2 
S -> Exp .EOF 
transitions ->  {\"EOF\":6}`,
  `
item set 3 
Exp -> E .;
Exp -> E .error
E -> E .PLUS T 
transitions ->  {\";\":7,\"error\":8,\"PLUS\":9}`,
  `
item set 4 
E -> T . 
transitions ->  {}`,
  `
item set 5 
T -> ZERO . 
transitions ->  {}`,
  `
item set 6 
S -> Exp EOF . 
transitions ->  {}`,
  `
item set 7 
Exp -> E ; . 
transitions ->  {}`,
  `
item set 8 
Exp -> E error . 
transitions ->  {}`,
  `
item set 9 
E -> E PLUS .T
T -> .ZERO 
transitions ->  {\"T\":10,\"ZERO\":5}`,
  `
item set 10 
E -> E PLUS T . 
transitions ->  {}`,
  `11 states.`,
  `Building lookahead grammar.`,
  `Computing lookaheads.`,
  `Building parse table.`,
  `Done.`,]);
    parser.lexer = new Lexer(lexData2);

    var expectedAST = ["+", ["+", [0], [0]], [0]];

    expect(() => { (parser.parse("0+0+0>"), expectedAST); }).toThrow();
  });

  it("test correct AST after error recovery abrupt end",() => {
    var lexData2 = {
      rules: [
        {pattern: "0", action: "return 'ZERO';"},
        {pattern: "\\+", action: "return 'PLUS';"},
        {pattern: ";", action: "return ';';"},
        {pattern: "$", action: "return 'EOF';"},
        {pattern: ".", action: "return 'INVALID';"}
      ]
    };
    var grammar = {
      bnf: {
        "S" :[ [ "Exp EOF",    "return $1" ]],
        "Exp" :[ [ "E ;",    "$$ = $1;" ],
                 [ "E error", "$$ = $1;" ]],
        "E" :[ [ "E PLUS T", "$$ = ['+',$1,$3]"  ],
               [ "T",        "$$ = $1" ]  ],
        "T" :[ [ "ZERO",     "$$ = [0]" ] ]
      }
    };

    var parser = new Jison.Parser(grammar);
    parser.lexer = new Lexer(lexData2);

    var expectedAST = ["+", ["+", [0], [0]], [0]];

    expect(parser.parse("0+0+0")).toEqual(expectedAST);
  });


  it("test bison error recovery example",() => {
    var lexData2 = {
      rules: [
        {pattern: "0", action: "return 'ZERO';"},
        {pattern: "\\+", action: "return 'PLUS';"},
        {pattern: ";", action: "return ';';"},
        {pattern: "$", action: "return 'EOF';"},
        {pattern: ".", action: "return 'INVALID';"}
      ]
    };
    var grammar = {
      bnf: {
        "S" :[ [ "stmt stmt EOF",    "return $1" ]],
        "stmt" :[ [ "E ;",    "$$ = $1;" ],
                  [ "error ;", "$$ = $1;" ]],
        "E" :[ [ "E PLUS T", "$$ = ['+',$1,$3]"  ],
               [ "T",        "$$ = $1" ]  ],
        "T" :[ [ "ZERO",     "$$ = [0]" ] ]
      }
    };

    var parser = new Jison.Parser(grammar);
    parser.lexer = new Lexer(lexData2);

    expect(parser.parse("0+0++++>;0;")).toParse("should recover");
  });
});
