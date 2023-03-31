const Jison = require("../tests/setup").Jison,
    RegExpLexer = require("../tests/setup").RegExpLexer;
Shared = require("../tests/extend-expect");
Jison.print = Shared.print;
afterEach(Shared.nothingPrinted);

describe("actions", () => {
  it("test Semantic action basic return",() => {
    var lexData = {
      rules: [
        ["x", "return 'x';"],
        ["y", "return 'y';"]
      ]
    };
    var grammar = {
      bnf: {
        "E"   :[ ["E x", "return 0"],
                 ["E y", "return 1"],
                 "" ]
      }
    };

    var parser = new Jison.Parser(grammar);
    parser.lexer = new RegExpLexer(lexData);

    expect(parser.parse('x')).toBe(0); // semantic action
    expect(parser.parse('y')).toBe(1); // semantic action
  });

  it("test return null",() => {
    var lexData = {
      rules: [
        ["x", "return 'x';"]
      ]
    };
    var grammar = {
      bnf: {
        "E"   :[ ["E x", "return null;"],
                 "" ]
      }
    };

    var parser = new Jison.Parser(grammar);
    parser.lexer = new RegExpLexer(lexData);

    expect(parser.parse('x')).toBe(null); // semantic action
  });

  it("test terminal semantic values are not null",() => {
    var lexData = {
      rules: [
        ["x", "return 'x';"],
        ["y", "return 'y';"]
      ]
    };
    var grammar = {
      bnf: {
        "E"   :[ ["E x", "return [$2 === 'x']"],
                 ["E y", "return [$2]"],
                 "" ]
      }
    };

    var parser = new Jison.Parser(grammar);
    parser.lexer = new RegExpLexer(lexData);

    expect(parser.parse('x')).toEqual([true]); // semantic action
    expect(parser.parse('y')).toEqual(['y']); // semantic action
  });

  it("test Semantic action stack lookup",() => {
    var lexData = {
      rules: [
        ["x", "return 'x';"],
        ["y", "return 'y';"]
      ]
    };
    var grammar = {
      bnf: {
        "pgm" :[ ["E", "return $1"] ],
        "E"   :[ ["B E", "return $1+$2"],
                 ["x", "$$ = 'EX'"] ],
        "B"   :[ ["y", "$$ = 'BY'"] ]
      }
    };

    var parser = new Jison.Parser(grammar);
    parser.lexer = new RegExpLexer(lexData);

    expect(parser.parse('x')).toBe("EX"); // return first token
    expect(parser.parse('yx')).toBe("BYEX"); // return first after reduction
  });

  it("test Semantic actions on nullable grammar",() => {
    var lexData = {
      rules: [
        ["x", "return 'x';"]
      ]
    };
    var grammar = {
      bnf: {
        "S" :[ ["A", "return $1"] ],
        "A" :[ ['x A', "$$ = $2+'x'" ],
               ['', "$$ = '->'" ] ]
      }
    };

    var parser = new Jison.Parser(grammar);
    parser.lexer = new RegExpLexer(lexData);

    expect(parser.parse('xx')).toBe("->xx"); // return first after reduction
  });

  it("test named semantic value",() => {
    var lexData = {
      rules: [
        ["x", "return 'x';"]
      ]
    };
    var grammar = {
      bnf: {
        "S" :[ ["A", "return $A"] ],
        "A" :[ ['x A', "$$ = $A+'x'" ],
               ['', "$$ = '->'" ] ]
      }
    };

    var parser = new Jison.Parser(grammar);
    parser.lexer = new RegExpLexer(lexData);

    expect(parser.parse('xx')).toBe("->xx"); // return first after reduction
  });

  it("test ambiguous named semantic value",() => {
    var lexData = {
      rules: [
        ["x", "return 'x';"],
        ["y", "return 'y';"]
      ]
    };
    var grammar = {
      operators: [["left", "y"]],
      bnf: {
        "S" :[ ["A", "return $A"] ],
        "A" :[ ['A y A', "$$ = $A2+'y'+$A1" ],
               ['x', "$$ = 'x'" ] ]
      }
    };

    var parser = new Jison.Parser(grammar);
    parser.lexer = new RegExpLexer(lexData);

    expect(parser.parse('xyx')).toBe("xyx"); // return first after reduction
  });

  it("test vars that look like named semantic values shouldn't be replaced",() => {
    var lexData = {
      rules: [
        ["x", "return 'x';"]
      ]
    };
    var grammar = {
      bnf: {
        "S" :[ ["A", "return $A"] ],
        "A" :[ ['x A', "var $blah = 'x', blah = 8; $$ = $A + $blah" ],
               ['', "$$ = '->'" ] ]
      }
    };

    var parser = new Jison.Parser(grammar);
    parser.lexer = new RegExpLexer(lexData);

    expect(parser.parse('xx')).toBe("->xx"); // return first after reduction
  });

  it("test previous semantic value lookup ($0)",() => {
    var lexData = {
      rules: [
        ["x", "return 'x';"],
        ["y", "return 'y';"]
      ]
    };
    var grammar = {
      bnf: {
        "S" :[ ["A B", "return $A + $B"] ],
        "A" :[ ['A x', "$$ = $A+'x'"], ['x', "$$ = $1"] ],
        "B" :[ ["y", "$$ = $0"] ],
      }
    };

    var parser = new Jison.Parser(grammar);
    parser.lexer = new RegExpLexer(lexData);

    expect(parser.parse('xxy')).toBe("xxxx"); // return first after reduction
  });


  it("test negative semantic value lookup ($-1)",() => {
    var lexData = {
      rules: [
        ["x", "return 'x';"],
        ["y", "return 'y';"],
        ["z", "return 'z';"]
      ]
    };
    var grammar = {
      bnf: {
        "S" :[ ["G A B", "return $G + $A + $B"] ],
        "G" :[ ['z', "$$ = $1"] ],
        "A" :[ ['A x', "$$ = $A+'x'"], ['x', "$$ = $1"] ],
        "B" :[ ["y", "$$ = $-1"] ],
      }
    };

    var parser = new Jison.Parser(grammar);
    parser.lexer = new RegExpLexer(lexData);

    expect(parser.parse('zxy')).toBe("zxz"); // return first after reduction
  });

  it("test Build AST",() => {
    var lexData = {
      rules: [
        ["x", "return 'x';"]
      ]
    };
    var grammar = {
      bnf: {
        "S" :[ ['A', "return $1;" ] ],
        "A" :[ ['x A', "$2.push(['ID',{value:'x'}]); $$ = $2;"],
               ['', "$$ = ['A',{}];"] ]
      }
    };

    var parser = new Jison.Parser(grammar);
    parser.lexer = new RegExpLexer(lexData);

    var expectedAST = ['A',{},
                       ['ID',{value:'x'}],
                       ['ID',{value:'x'}],
                       ['ID',{value:'x'}]];

    var r = parser.parse("xxx");
    expect(r).toEqual(expectedAST);
  });

  it("test 0+0 grammar",() => {
    var lexData2 = {
      rules: [
        ["0", "return 'ZERO';"],
        ["\\+", "return 'PLUS';"],
        ["$", "return 'EOF';"]
      ]
    };
    var grammar = {
      bnf: {
        "S" :[ [ "E EOF",    "return $1" ]],
        "E" :[ [ "E PLUS T", "$$ = ['+',$1,$3]"  ],
               [ "T",        "$$ = $1" ]  ],
        "T" :[ [ "ZERO",     "$$ = [0]" ] ]
      }
    };

    var parser = new Jison.Parser(grammar);
    parser.lexer = new RegExpLexer(lexData2);

    var expectedAST = ["+", ["+", [0], [0]], [0]];

    expect(parser.parse("0+0+0")).toEqual(expectedAST);
  });

  it("test implicit $$ = $1 action",() => {
    var lexData2 = {
      rules: [
        ["0", "return 'ZERO';"],
        ["\\+", "return 'PLUS';"],
        ["$", "return 'EOF';"]
      ]
    };
    var grammar = {
      bnf: {
        "S" :[ [ "E EOF",    "return $1" ]],
        "E" :[ [ "E PLUS T", "$$ = ['+',$1,$3]"  ],
               "T" ],
        "T" :[ [ "ZERO",     "$$ = [0]" ] ]
      }
    };

    var parser = new Jison.Parser(grammar);
    parser.lexer = new RegExpLexer(lexData2);

    var expectedAST = ["+", ["+", [0], [0]], [0]];

    expect(parser.parse("0+0+0")).toEqual(expectedAST);
  });

  it("test yytext",() => {
    var lexData = {
      rules: [
        ["x", "return 'x';"]
      ]
    };
    var grammar = {
      bnf: {
        "pgm" :[ ["Xexpr", "return $1;"] ],
        "Xexpr"   :[ ["x", "$$ = yytext;"] ]
      }
    };

    var parser = new Jison.Parser(grammar);
    parser.lexer = new RegExpLexer(lexData);

    expect(parser.parse('x')).toBe("x"); // return first token
  });

  it("test yyleng",() => {
    var lexData = {
      rules: [
        ["x", "return 'x';"]
      ]
    };
    var grammar = {
      bnf: {
        "pgm" :[ ["Xexpr", "return $1;"] ],
        "Xexpr"   :[ ["x", "$$ = yyleng;"] ]
      }
    };

    var parser = new Jison.Parser(grammar);
    parser.lexer = new RegExpLexer(lexData);

    expect(parser.parse('x')).toBe(1); // return first token
  });

  it("test yytext more",() => {
    var lexData = {
      rules: [
        ["x", "return 'x';"],
        ["y", "return 'y';"]
      ]
    };
    var grammar = {
      bnf: {
        "pgm" :[ ["expr expr", "return $1+$2;"] ],
        "expr"   :[ ["x", "$$ = yytext;"],
                    ["y", "$$ = yytext;"] ]
      }
    };

    var parser = new Jison.Parser(grammar);
    parser.lexer = new RegExpLexer(lexData);

    expect(parser.parse('xy')).toBe("xy"); // return first token
  });

  it("test action include",() => {
    var lexData = {
      rules: [
        ["y", "return 'y';"]
      ]
    };
    var grammar = {
      bnf: {
        "E"   :[ ["E y", "return test();"],
                 "" ]
      },
      actionInclude: function () {
        function test(val) {
          return 1;
        }
      }
    };

    var parser = new Jison.Parser(grammar);
    parser.lexer = new RegExpLexer(lexData);

    expect(parser.parse('y')).toBe(1); // semantic action
  });

  it("test next token not shifted if only one action", () => {
    var lexData = {
      rules: [
        ["\\(", "return '(';"],
        ["\\)", "return ')';"],
        ["y", "return yy.xed ? 'yfoo' : 'ybar';"]
      ]
    };
    var grammar = {
      bnf: {
        "prog" :[ 'e ybar' ],
        "esub" :[[ '(', "yy.xed = true;" ]],
        "e" :[[ 'esub yfoo )', "yy.xed = false;" ]]
      }
    };

    var parser = new Jison.Parser(grammar);
    parser.lexer = new RegExpLexer(lexData);
    expect(parser.parse('(y)y')).toParse("should parse correctly");
  });

  xit("test token array LIFO",() => {
    var lexData = {
      rules: [
        ["a", "return ['b','a'];"],
        ["c", "return 'c';"]
      ]
    };
    var grammar = {
      ebnf: {
        "pgm" :[ ["expr expr expr", "return $1+$2+$3;"] ],
        "expr"   :[ ["a", "$$ = 'a';"],
                    ["b", "$$ = 'b';"],
                    ["c", "$$ = 'c';"] ]
      },
      options: { 'token-stack': true }
    };

    var parser = new Jison.Parser(grammar);
    parser.lexer = new RegExpLexer(lexData);
    expect(parser.parse('ac')).toBe(["abc"]); // should return second token
  });

  it("test YYACCEPT",() => {
    var lexData = {
      rules: [
        ["x", "return 'x';"],
        ["y", "return 'y';"]
      ]
    };
    var grammar = {
      bnf: {
        "pgm" :[ ["E", "return $1"] ],
        "E"   :[ ["B E", "return $1+$2"],
                 ["x", "$$ = 'EX'"] ],
        "B"   :[ ["y", "YYACCEPT"] ]
      }
    };

    var parser = new Jison.Parser(grammar);
    parser.lexer = new RegExpLexer(lexData);

    expect(parser.parse('x')).toBe("EX"); // return first token
    expect(parser.parse('yx')).toBe(true); // return first after reduction
  });

  it("test YYABORT",() => {
    var lexData = {
      rules: [
        ["x", "return 'x';"],
        ["y", "return 'y';"]
      ]
    };
    var grammar = {
      bnf: {
        "pgm" :[ ["E", "return $1"] ],
        "E"   :[ ["B E", "return $1+$2"],
                 ["x", "$$ = 'EX'"] ],
        "B"   :[ ["y", "YYABORT"] ]
      }
    };

    var parser = new Jison.Parser(grammar);
    parser.lexer = new RegExpLexer(lexData);

    expect(parser.parse('x')).toBe("EX"); // return first token
    expect(parser.parse('yx')).toBe(false); // return first after reduction
  });

  xit("test parse params",() => {
    var lexData = {
      rules: [
        ["y", "return 'y';"]
      ]
    };
    var grammar = {
      bnf: {
        "E"   :[ ["E y", "return first + second;"],
                 "" ]
      },
      parseParams: ["first", "second"]
    };

    var parser = new Jison.Parser(grammar);
    parser.lexer = new RegExpLexer(lexData);

    expect(parser.parse('y', "foo", "bar")).toEqual("foobar"); // semantic action
  });

  it("test symbol aliases",() => {
    var lexData = {
      rules: [
        ["a", "return 'a';"],
        ["b", "return 'b';"],
        ["c", "return 'c';"]
      ]
    };
    var grammar = {
      bnf: {
        "pgm" :[ ["expr[alice] expr[bob] expr[carol]", "return $alice+$bob+$carol;"] ],
        "expr"   :[ ["a", "$$ = 'a';"],
                    ["b", "$$ = 'b';"],
                    ["c", "$$ = 'c';"] ]
      }
    };

    var parser = new Jison.Parser(grammar);
    parser.lexer = new RegExpLexer(lexData);
    expect(parser.parse('abc')).toBe("abc"); // should return original string
  });

  it("test symbol aliases in ebnf",() => {
    var lexData = {
      rules: [
        ["a", "return 'a';"],
        ["b", "return 'b';"],
        ["c", "return 'c';"]
      ]
    };
    var grammar = {
      ebnf: {
        "pgm" :[ ["expr[alice] (expr[bob] expr[carol])+", "return $alice+$2;"] ],
        "expr"   :[ ["a", "$$ = 'a';"],
                    ["b", "$$ = 'b';"],
                    ["c", "$$ = 'c';"] ]
      }
    };

    var parser = new Jison.Parser(grammar);
    parser.lexer = new RegExpLexer(lexData);
    expect(parser.parse('abc')).toBe("ab"); // should tolerate aliases in subexpression
  });
});
