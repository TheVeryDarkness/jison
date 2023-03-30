const RegExpLexer = require("../lib/regexp-lexer");
const { JisonLexer } = require('@ts-jison/lexer');

describe("", () => {
  it("test basic matchers", () => {
    const dict = {
      rules: [
        ["x", "return 'X';" ],
        ["y", "return 'Y';" ],
        ["$", "return 'EOF';" ]
      ]
    };

    const input = "xxyx";

    const lexer = new RegExpLexer(dict, input);
    expect(lexer.lex()).toEqual("X");
    expect(lexer.lex()).toEqual("X");
    expect(lexer.lex()).toEqual("Y");
    expect(lexer.lex()).toEqual("X");
    expect(lexer.lex()).toEqual("EOF");
  });

  it("test set yy", () => {
    const dict = {
      rules: [
        ["x", "return yy.x;" ],
        ["y", "return 'Y';" ],
        ["$", "return 'EOF';" ]
      ]
    };

    const input = "xxyx";

    const lexer = new RegExpLexer(dict);
    lexer.setInput(input, { x: 'EX' });
    expect(lexer.lex()).toEqual("EX");
  });

  it("test set input after", () => {
    const dict = {
      rules: [
        ["x", "return 'X';" ],
        ["y", "return 'Y';" ],
        ["$", "return 'EOF';" ]
      ]
    };

    const input = "xxyx";

    const lexer = new RegExpLexer(dict);
    lexer.setInput(input);

    expect(lexer.lex()).toEqual("X");
    expect(lexer.lex()).toEqual("X");
    expect(lexer.lex()).toEqual("Y");
    expect(lexer.lex()).toEqual("X");
    expect(lexer.lex()).toEqual("EOF");
  });

  it("test unrecognized char", () => {
    const dict = {
      rules: [
        ["x", "return 'X';" ],
        ["y", "return 'Y';" ],
        ["$", "return 'EOF';" ]
      ]
    };

    const input = "xa";

    const lexer = new RegExpLexer(dict, input);
    expect(lexer.lex()).toEqual("X");
    expect(() => {
      lexer.lex();
    }).toThrow("Lexical error on line 1. Unrecognized text.");
  });

  it("test macro", () => {
    const dict = {
      macros: {
        "digit": "[0-9]"
      },
      rules: [
        ["x", "return 'X';" ],
        ["y", "return 'Y';" ],
        ["{digit}+", "return 'NAT';" ],
        ["$", "return 'EOF';" ]
      ]
    };

    const input = "x12234y42";

    const lexer = new RegExpLexer(dict, input);
    expect(lexer.lex()).toEqual("X");
    expect(lexer.lex()).toEqual("NAT");
    expect(lexer.lex()).toEqual("Y");
    expect(lexer.lex()).toEqual("NAT");
    expect(lexer.lex()).toEqual("EOF");
  });

  it("test macro precedence", () => {
    const dict = {
      macros: {
        "hex": "[0-9]|[a-f]"
      },
      rules: [
        ["-", "return '-';" ],
        ["{hex}+", "return 'HEX';" ],
        ["$", "return 'EOF';" ]
      ]
    };

    const input = "129-abfe-42dc-ea12";

    const lexer = new RegExpLexer(dict, input);
    expect(lexer.lex()).toEqual("HEX");
    expect(lexer.lex()).toEqual("-");
    expect(lexer.lex()).toEqual("HEX");
    expect(lexer.lex()).toEqual("-");
    expect(lexer.lex()).toEqual("HEX");
    expect(lexer.lex()).toEqual("-");
    expect(lexer.lex()).toEqual("HEX");
    expect(lexer.lex()).toEqual("EOF");
  });

  it("test nested macros",  () => {
    const dict = {
      macros: {
        "digit": "[0-9]",
        "2digit": "{digit}{digit}",
        "3digit": "{2digit}{digit}"
      },
      rules: [
        ["x", "return 'X';" ],
        ["y", "return 'Y';" ],
        ["{3digit}", "return 'NNN';" ],
        ["{2digit}", "return 'NN';" ],
        ["{digit}", "return 'N';" ],
        ["$", "return 'EOF';" ]
      ]
    };

    const input = "x1y42y123";

    const lexer = new RegExpLexer(dict, input);
    expect(lexer.lex()).toEqual("X");
    expect(lexer.lex()).toEqual("N");
    expect(lexer.lex()).toEqual("Y");
    expect(lexer.lex()).toEqual("NN");
    expect(lexer.lex()).toEqual("Y");
    expect(lexer.lex()).toEqual("NNN");
    expect(lexer.lex()).toEqual("EOF");
  });

  it("test nested macro precedence", () => {
    const dict = {
      macros: {
        "hex": "[0-9]|[a-f]",
        "col": "#{hex}+"
      },
      rules: [
        ["-", "return '-';" ],
        ["{col}", "return 'HEX';" ],
        ["$", "return 'EOF';" ]
      ]
    };

    const input = "#129-#abfe-#42dc-#ea12";

    const lexer = new RegExpLexer(dict, input);
    expect(lexer.lex()).toEqual("HEX");
    expect(lexer.lex()).toEqual("-");
    expect(lexer.lex()).toEqual("HEX");
    expect(lexer.lex()).toEqual("-");
    expect(lexer.lex()).toEqual("HEX");
    expect(lexer.lex()).toEqual("-");
    expect(lexer.lex()).toEqual("HEX");
    expect(lexer.lex()).toEqual("EOF");
  });

  it("test action include", () => {
    const dict = {
      rules: [
        ["x", "return included ? 'Y' : 'N';" ],
        ["$", "return 'EOF';" ]
      ],
      actionInclude: "const included = true;"
    };

    const input = "x";

    const lexer = new RegExpLexer(dict, input);
    expect(lexer.lex()).toEqual("Y");
    expect(lexer.lex()).toEqual("EOF");
  });

  it("test ignored", () => {
    const dict = {
      rules: [
        ["x", "return 'X';" ],
        ["y", "return 'Y';" ],
        ["\\s+", "/* skip whitespace */" ],
        ["$", "return 'EOF';" ]
      ]
    };

    const input = "x x   y x";

    const lexer = new RegExpLexer(dict, input);
    expect(lexer.lex()).toEqual("X");
    expect(lexer.lex()).toEqual("X");
    expect(lexer.lex()).toEqual("Y");
    expect(lexer.lex()).toEqual("X");
    expect(lexer.lex()).toEqual("EOF");
  });

  it("test disambiguate", () => {
    const dict = {
      rules: [
        ["for\\b", "return 'FOR';" ],
        ["if\\b", "return 'IF';" ],
        ["[a-z]+", "return 'IDENTIFIER';" ],
        ["\\s+", "/* skip whitespace */" ],
        ["$", "return 'EOF';" ]
      ]
    };

    const input = "if forever for for";

    const lexer = new RegExpLexer(dict, input);
    expect(lexer.lex()).toEqual("IF");
    expect(lexer.lex()).toEqual("IDENTIFIER");
    expect(lexer.lex()).toEqual("FOR");
    expect(lexer.lex()).toEqual("FOR");
    expect(lexer.lex()).toEqual("EOF");
  });

  it("test yytext overwrite", () => {
    const dict = {
      rules: [
        ["x", "yytext = 'hi der'; return 'X';" ]
      ]
    };

    const input = "x";

    const lexer = new RegExpLexer(dict, input);
    lexer.lex();
    expect(lexer.yytext).toEqual("hi der");
  });

  it("test yylineno", () => {
    const dict = {
      rules: [
        ["\\s+", "/* skip whitespace */" ],
        ["x", "return 'x';" ],
        ["y", "return 'y';" ]
      ]
    };

    const input = "x\nxy\n\n\nx";

    const lexer = new RegExpLexer(dict, input);
    expect(lexer.yylineno).toEqual(0);
    expect(lexer.lex()).toEqual("x");
    expect(lexer.lex()).toEqual("x");
    expect(lexer.yylineno).toEqual(1);
    expect(lexer.lex()).toEqual("y");
    expect(lexer.yylineno).toEqual(1);
    expect(lexer.lex()).toEqual("x");
    expect(lexer.yylineno).toEqual(4);
  });

  it("test yylloc", () => {
    const dict = {
      rules: [
        ["\\s+", "/* skip whitespace */" ],
        ["x", "return 'x';" ],
        ["y", "return 'y';" ]
      ]
    };

    const input = "x\nxy\n\n\nx";

    const lexer = new RegExpLexer(dict, input);
    expect(lexer.lex()).toEqual("x");
    expect(lexer.yylloc.first_column).toEqual(0);
    expect(lexer.yylloc.last_column).toEqual(1);
    expect(lexer.lex()).toEqual("x");
    expect(lexer.yylloc.first_line).toEqual(2);
    expect(lexer.yylloc.last_line).toEqual(2);
    expect(lexer.yylloc.first_column).toEqual(0);
    expect(lexer.yylloc.last_column).toEqual(1);
    expect(lexer.lex()).toEqual("y");
    expect(lexer.yylloc.first_line).toEqual(2);
    expect(lexer.yylloc.last_line).toEqual(2);
    expect(lexer.yylloc.first_column).toEqual(1);
    expect(lexer.yylloc.last_column).toEqual(2);
    expect(lexer.lex()).toEqual("x");
    expect(lexer.yylloc.first_line).toEqual(5);
    expect(lexer.yylloc.last_line).toEqual(5);
    expect(lexer.yylloc.first_column).toEqual(0);
    expect(lexer.yylloc.last_column).toEqual(1);
  });

  it("test more()", () => {
    const dict = {
      rules: [
        ["x", "return 'X';" ],
        ['"[^"]*', function(){
          if(yytext.charAt(yyleng-1) == '\\') {
            this.more();
          } else {
            yytext += this.input(); // swallow end quote
            return "STRING";
          }
        } ],
        ["$", "return 'EOF';" ]
      ]
    };

    const input = 'x"fgjdrtj\\"sdfsdf"x';

    const lexer = new RegExpLexer(dict, input);
    expect(lexer.lex()).toEqual("X");
    expect(lexer.lex()).toEqual("STRING");
    expect(lexer.lex()).toEqual("X");
    expect(lexer.lex()).toEqual("EOF");
  });

  it("test defined token returns", () => {
    const tokens = {"2":"X", "3":"Y", "4":"EOF"};
    const dict = {
      rules: [
        ["x", "return 'X';" ],
        ["y", "return 'Y';" ],
        ["$", "return 'EOF';" ]
      ]
    };

    const input = "xxyx";

    const lexer = new RegExpLexer(dict, input, tokens);

    expect(lexer.lex()).toEqual(2);
    expect(lexer.lex()).toEqual(2);
    expect(lexer.lex()).toEqual(3);
    expect(lexer.lex()).toEqual(2);
    expect(lexer.lex()).toEqual(4);
  });

  it("test module generator from constructor", () => {
    const dict = {
      rules: [
        ["x", "return 'X';" ],
        ["y", "return 'Y';" ],
        ["$", "return 'EOF';" ]
      ],
      options: { makeGenerators: true, template: "javascript" }
    };

    const input = "xxyx";

    const lexerSource = "const [JisonLexer] = arguments;\n\n"
        + RegExpLexer.generate(dict);
    const ctor = new Function(lexerSource)(JisonLexer);
    const generated = new ctor();
    generated.setInput(input);

    expect(generated.lex()).toEqual("X");
    expect(generated.lex()).toEqual("X");
    expect(generated.lex()).toEqual("Y");
    expect(generated.lex()).toEqual("X");
    expect(generated.lex()).toEqual("EOF");
  });

  it("test module generator", () => {
    const dict = {
      rules: [
        ["x", "return 'X';" ],
        ["y", "return 'Y';" ],
        ["$", "return 'EOF';" ]
      ]
    };

    const input = "xxyx";

    const lexer_ = new RegExpLexer(dict, undefined, undefined, { makeGenerators: true });
    const lexerSource = "const [JisonLexer] = arguments;\n\n"
        + lexer_.generateModule();
    const ctor = new Function(lexerSource)(JisonLexer);
    const generated = new ctor();
    generated.setInput(input);

    expect(generated.lex()).toEqual("X");
    expect(generated.lex()).toEqual("X");
    expect(generated.lex()).toEqual("Y");
    expect(generated.lex()).toEqual("X");
    expect(generated.lex()).toEqual("EOF");
  });

  it("test generator with more complex lexer", () => {
    const dict = {
      rules: [
        ["x", "return 'X';" ],
        ['"[^"]*', function(){
          if(yytext.charAt(yyleng-1) == '\\') {
            this.more();
          } else {
            yytext += this.input(); // swallow end quote
            return "STRING";
          }
        } ],
        ["$", "return 'EOF';" ]
      ]
    };

    const input = 'x"fgjdrtj\\"sdfsdf"x';

    const lexer_ = new RegExpLexer(dict, undefined, undefined, { makeGenerators: true });
    const lexerSource = "const [JisonLexer] = arguments;\n\n"
        + lexer_.generateModule();
    const ctor = new Function(lexerSource)(JisonLexer);
    const generated = new ctor();
    generated.setInput(input);

    expect(generated.lex()).toEqual("X");
    expect(generated.lex()).toEqual("STRING");
    expect(generated.lex()).toEqual("X");
    expect(generated.lex()).toEqual("EOF");
  });

  it("test commonjs module generator", () => {
    const dict = {
      rules: [
        ["x", "return 'X';" ],
        ["y", "return 'Y';" ],
        ["$", "return 'EOF';" ]
      ]
    };

    const input = "xxyx";

    const lexer_ = new RegExpLexer(dict, undefined, undefined, { makeGenerators: true });
    const lexerSource = "const [module, JisonLexer] = arguments;\n\n"
        + lexer_.generateCommonJSModule();
    const exports = {};
    const myModule = { exports: {} };
    new Function(lexerSource)(myModule, JisonLexer);
    const generated = new myModule.exports();
    generated.setInput(input);

    expect(generated.lex()).toEqual("X");
    expect(generated.lex()).toEqual("X");
    expect(generated.lex()).toEqual("Y");
    expect(generated.lex()).toEqual("X");
    expect(generated.lex()).toEqual("EOF");
  });

  if (false) it("test amd module generator", () => { // TODO
    const dict = {
      rules: [
        ["x", "return 'X';" ],
        ["y", "return 'Y';" ],
        ["$", "return 'EOF';" ]
      ]
    };

    const input = "xxyx";

    const lexer_ = new RegExpLexer(dict, undefined, undefined, { makeGenerators: true });
    const lexerSource = lexer_.generateAMDModule();

    let lexer;
    const define = function (_, fn) {
      lexer = fn();
    };

    eval(lexerSource);
    lexer.setInput(input);

    expect(lexer.lex()).toEqual("X");
    expect(lexer.lex()).toEqual("X");
    expect(lexer.lex()).toEqual("Y");
    expect(lexer.lex()).toEqual("X");
    expect(lexer.lex()).toEqual("EOF");
  });

  it("test DJ lexer", () => {
    const dict = {
      "lex": {
        "macros": {
          "digit": "[0-9]",
          "id": "[a-zA-Z][a-zA-Z0-9]*"
        },

        "rules": [
          ["\\/\\/.*",       "/* ignore comment */"],
          ["main\\b",     "return 'MAIN';"],
          ["class\\b",    "return 'CLASS';"],
          ["extends\\b",  "return 'EXTENDS';"],
          ["nat\\b",      "return 'NATTYPE';"],
          ["if\\b",       "return 'IF';"],
          ["else\\b",     "return 'ELSE';"],
          ["for\\b",      "return 'FOR';"],
          ["printNat\\b", "return 'PRINTNAT';"],
          ["readNat\\b",  "return 'READNAT';"],
          ["this\\b",     "return 'THIS';"],
          ["new\\b",      "return 'NEW';"],
          ["var\\b",      "return 'VAR';"],
          ["null\\b",     "return 'NUL';"],
          ["{digit}+",   "return 'NATLITERAL';"],
          ["{id}",       "return 'ID';"],
          ["==",         "return 'EQUALITY';"],
          ["=",          "return 'ASSIGN';"],
          ["\\+",        "return 'PLUS';"],
          ["-",          "return 'MINUS';"],
          ["\\*",        "return 'TIMES';"],
          [">",          "return 'GREATER';"],
          ["\\|\\|",     "return 'OR';"],
          ["!",          "return 'NOT';"],
          ["\\.",        "return 'DOT';"],
          ["\\{",        "return 'LBRACE';"],
          ["\\}",        "return 'RBRACE';"],
          ["\\(",        "return 'LPAREN';"],
          ["\\)",        "return 'RPAREN';"],
          [";",          "return 'SEMICOLON';"],
          ["\\s+",       "/* skip whitespace */"],
          [".",          "print('Illegal character');throw 'Illegal character';"],
          ["$",          "return 'ENDOFFILE';"]
        ]
      }
    };

    const input = "class Node extends Object { \
                      const nat value    const nat value;\
                      const Node next;\
                      const nat index;\
                    }\
\
                    class List extends Object {\
                      const Node start;\
\
                      Node prepend(Node startNode) {\
                        startNode.next = start;\
                        start = startNode;\
                      }\
\
                      nat find(nat index) {\
                        const nat value;\
                        const Node node;\
\
                        for(node = start;!(node == null);node = node.next){\
                          if(node.index == index){\
                            value = node.value;\
                          } else { 0; };\
                        };\
\
                        value;\
                      }\
                    }\
\
                    main {\
                      const nat index;\
                      const nat value;\
                      const List list;\
                      const Node startNode;\
\
                      index = readNat();\
                      list = new List;\
\
                      for(0;!(index==0);0){\
                        value = readNat();\
                        startNode = new Node;\
                        startNode.index = index;\
                        startNode.value = value;\
                        list.prepend(startNode);\
                        index = readNat();\
                      };\
\
                      index = readNat();\
\
                      for(0;!(index==0);0){\
                        printNat(list.find(index));\
                        index = readNat();\
                      };\
                    }";

    const lexer = new RegExpLexer(dict.lex);
    lexer.setInput(input);
    let tok;
    while (tok = lexer.lex(), tok!==1) {
      expect(typeof tok).toEqual("string");
    }
  });

  it("test instantiation from string", () => {
    const dict = "%%\n'x' {return 'X';}\n'y' {return 'Y';}\n<<EOF>> {return 'EOF';}";

    const input = "x";

    const lexer = new RegExpLexer(dict);
    lexer.setInput(input);

    expect(lexer.lex()).toEqual("X");
    expect(lexer.lex()).toEqual("EOF");
  });

  it("test inclusive start conditions", () => {
    const dict = {
      startConditions: {
        "TEST": 0,
      },
      rules: [
        ["enter-test", "this.begin('TEST');" ],
        [["TEST"], "x", "return 'T';" ],
        [["TEST"], "y", "this.begin('INITIAL'); return 'TY';" ],
        ["x", "return 'X';" ],
        ["y", "return 'Y';" ],
        ["$", "return 'EOF';" ]
      ]
    };
    const input = "xenter-testxyy";

    const lexer = new RegExpLexer(dict);
    lexer.setInput(input);

    expect(lexer.lex()).toEqual("X");
    expect(lexer.lex()).toEqual("T");
    expect(lexer.lex()).toEqual("TY");
    expect(lexer.lex()).toEqual("Y");
    expect(lexer.lex()).toEqual("EOF");
  });

  it("test exclusive start conditions", () => {
    const dict = {
      startConditions: {
        "EAT": 1,
      },
      rules: [
        ["\\/\\/", "this.begin('EAT');" ],
        [["EAT"], ".", "" ],
        [["EAT"], "\\n", "this.begin('INITIAL');" ],
        ["x", "return 'X';" ],
        ["y", "return 'Y';" ],
        ["$", "return 'EOF';" ]
      ]
    };
    const input = "xy//yxteadh//ste\ny";

    const lexer = new RegExpLexer(dict);
    lexer.setInput(input);

    expect(lexer.lex()).toEqual("X");
    expect(lexer.lex()).toEqual("Y");
    expect(lexer.lex()).toEqual("Y");
    expect(lexer.lex()).toEqual("EOF");
  });

  it("test pop start condition stack", () => {
    const dict = {
      startConditions: {
        "EAT": 1,
      },
      rules: [
        ["\\/\\/", "this.begin('EAT');" ],
        [["EAT"], ".", "" ],
        [["EAT"], "\\n", "this.popState();" ],
        ["x", "return 'X';" ],
        ["y", "return 'Y';" ],
        ["$", "return 'EOF';" ]
      ]
    };
    const input = "xy//yxteadh//ste\ny";

    const lexer = new RegExpLexer(dict);
    lexer.setInput(input);

    expect(lexer.lex()).toEqual("X");
    expect(lexer.lex()).toEqual("Y");
    expect(lexer.lex()).toEqual("Y");
    expect(lexer.lex()).toEqual("EOF");
  });


  it("test star start condition", () => {
    const dict = {
      startConditions: {
        "EAT": 1,
      },
      rules: [
        ["\\/\\/", "this.begin('EAT');" ],
        [["EAT"], ".", "" ],
        ["x", "return 'X';" ],
        ["y", "return 'Y';" ],
        [["*"],"$", "return 'EOF';" ]
      ]
    };
    const input = "xy//yxteadh//stey";

    const lexer = new RegExpLexer(dict);
    lexer.setInput(input);

    expect(lexer.lex()).toEqual("X");
    expect(lexer.lex()).toEqual("Y");
    expect(lexer.lex()).toEqual("EOF");
  });

  it("test start condition constants", () => {
    const dict = {
      startConditions: {
        "EAT": 1,
      },
      rules: [
        ["\\/\\/", "this.begin('EAT');" ],
        [["EAT"], ".", "if (YYSTATE==='EAT') return 'E';" ],
        ["x", "if (YY_START==='INITIAL') return 'X';" ],
        ["y", "return 'Y';" ],
        [["*"],"$", "return 'EOF';" ]
      ]
    };
    const input = "xy//y";

    const lexer = new RegExpLexer(dict);
    lexer.setInput(input);

    expect(lexer.lex()).toEqual("X");
    expect(lexer.lex()).toEqual("Y");
    expect(lexer.lex()).toEqual("E");
    expect(lexer.lex()).toEqual("EOF");
  });

  it("test unicode encoding", () => {
    const dict = {
      rules: [
        ["\\u2713", "return 'CHECK';" ],
        ["\\u03c0", "return 'PI';" ],
        ["y", "return 'Y';" ]
      ]
    };
    const input = "\u2713\u03c0y";

    const lexer = new RegExpLexer(dict);
    lexer.setInput(input);

    expect(lexer.lex()).toEqual("CHECK");
    expect(lexer.lex()).toEqual("PI");
    expect(lexer.lex()).toEqual("Y");
  });

  it("test unicode", () => {
    const dict = {
      rules: [
        ["π", "return 'PI';" ],
        ["y", "return 'Y';" ]
      ]
    };
    const input = "πy";

    const lexer = new RegExpLexer(dict);
    lexer.setInput(input);

    expect(lexer.lex()).toEqual("PI");
    expect(lexer.lex()).toEqual("Y");
  });

  it("test longest match returns", () => {
    const dict = {
      rules: [
        [".", "return 'DOT';" ],
        ["cat", "return 'CAT';" ]
      ],
      options: {flex: true}
    };
    const input = "cat!";

    const lexer = new RegExpLexer(dict);
    lexer.setInput(input);

    expect(lexer.lex()).toEqual("CAT");
    expect(lexer.lex()).toEqual("DOT");
  });

  it("test case insensitivity", () => {
    const dict = {
      rules: [
        ["cat", "return 'CAT';" ]
      ],
      options: {'case-insensitive': true}
    };
    const input = "Cat";

    const lexer = new RegExpLexer(dict);
    lexer.setInput(input);

    expect(lexer.lex()).toEqual("CAT");
  });

  it("test less", () => {
    const dict = {
      rules: [
        ["cat", "this.less(2); return 'CAT';" ],
        ["t", "return 'T';" ]
      ],
    };
    const input = "cat";

    const lexer = new RegExpLexer(dict);
    lexer.setInput(input);

    expect(lexer.lex()).toEqual("CAT");
    expect(lexer.lex()).toEqual("T");
  });

  it("test EOF unput", () => {
    const dict = {
      startConditions: {
        "UN": 1,
      },
      rules: [
        ["U", "this.begin('UN');return 'U';" ],
        [["UN"],"$", "this.unput('X')" ],
        [["UN"],"X", "this.popState();return 'X';" ],
        ["$", "return 'EOF'" ]
      ]
    };
    const input = "U";

    const lexer = new RegExpLexer(dict);
    lexer.setInput(input);

    expect(lexer.lex()).toEqual("U");
    expect(lexer.lex()).toEqual("X");
    expect(lexer.lex()).toEqual("EOF");
  });

  it("test flex mode default rule", () => {
    const dict = {
      rules: [
        ["x", "return 'X';" ]
      ],
      options: {flex: true}
    };
    const input = "xyx";

    const lexer = new RegExpLexer(dict);
    lexer.setInput(input);

    expect(lexer.lex()).toEqual("X");
    expect(lexer.lex()).toEqual("X");
  });

  it("test pipe precedence", () => {
    const dict = {
      rules: [
        ["x|y", "return 'X_Y';" ],
        [".",   "return 'N';"]
      ]
    };
    const input = "xny";

    const lexer = new RegExpLexer(dict);
    lexer.setInput(input);

    expect(lexer.lex()).toEqual("X_Y");
    expect(lexer.lex()).toEqual("N");
    expect(lexer.lex()).toEqual("X_Y");
  });

  it("test ranges", () => {
    const dict = {
      rules: [
        ["x+", "return 'X';" ],
        [".",   "return 'N';"]
      ],
      options: {ranges: true}
    };
    const input = "xxxyy";

    const lexer = new RegExpLexer(dict);
    lexer.setInput(input);

    expect(lexer.lex()).toEqual("X");
    expect(lexer.yylloc.range).toEqual([0, 3]);
  });

  it("test unput location", () => {
    const dict = {
      rules: [
        ["x+", "return 'X';" ],
        ["y\\n", "this.unput('\\n'); return 'Y';" ],
        ["\\ny", "this.unput('y'); return 'BR';" ],
        ["y", "return 'Y';" ],
        [".",   "return 'N';"]
      ],
      options: {ranges: true}
    };
    const input = "xxxy\ny";

    const lexer = new RegExpLexer(dict);
    lexer.setInput(input);
    // console.log(lexer.rules);

    expect(lexer.next()).toEqual("X");
    expect(lexer.yylloc).toEqual({first_line: 1,
                                  first_column: 0,
                                  last_line: 1,
                                  last_column: 3,
                                  range: [0, 3]});
    expect(lexer.next()).toEqual("Y");
    expect(lexer.yylloc).toEqual({first_line: 1,
                                  first_column: 3,
                                  last_line: 1,
                                  last_column: 4,
                                  range: [3, 4]});
    expect(lexer.next()).toEqual("BR");
    expect(lexer.yylloc).toEqual({first_line: 1,
                                  first_column: 4,
                                  last_line: 2,
                                  last_column: 0,
                                  range: [4, 5]});
    expect(lexer.next()).toEqual("Y");
    expect(lexer.yylloc).toEqual({first_line: 2,
                                  first_column: 0,
                                  last_line: 2,
                                  last_column: 1,
                                  range: [5, 6]});

  });

  it("test unput location again", () => {
    const dict = {
      rules: [
        ["x+", "return 'X';" ],
        ["y\\ny\\n", "this.unput('\\n'); return 'YY';" ],
        ["\\ny", "this.unput('y'); return 'BR';" ],
        ["y", "return 'Y';" ],
        [".",   "return 'N';"]
      ],
      options: {ranges: true}
    };
    const input = "xxxy\ny\ny";

    const lexer = new RegExpLexer(dict);
    lexer.setInput(input);
    // console.log(lexer.rules);

    expect(lexer.next()).toEqual("X");
    expect(lexer.yylloc).toEqual({first_line: 1,
                                  first_column: 0,
                                  last_line: 1,
                                  last_column: 3,
                                  range: [0, 3]});
    expect(lexer.next()).toEqual("YY");
    expect(lexer.yylloc).toEqual({first_line: 1,
                                  first_column: 3,
                                  last_line: 2,
                                  last_column: 1,
                                  range: [3, 6]});
    expect(lexer.next()).toEqual("BR");
    expect(lexer.yylloc).toEqual({first_line: 2,
                                  first_column: 1,
                                  last_line: 3,
                                  last_column: 0,
                                  range: [6, 7]});
    expect(lexer.next()).toEqual("Y");
    expect(lexer.yylloc).toEqual({first_line: 3,
                                  first_column: 0,
                                  last_line: 3,
                                  last_column: 1,
                                  range: [7, 8]});

  });

  it("test backtracking lexer reject() method", () => {
    const dict = {
      rules: [
        ["[A-Z]+([0-9]+)", "if (this.matches[1].length) this.reject(); else return 'ID';" ],
        ["[A-Z]+", "return 'WORD';" ],
        ["[0-9]+", "return 'NUM';" ]
      ],
      options: {backtrack_lexer: true}
    };
    const input = "A5";

    const lexer = new RegExpLexer(dict);
    lexer.setInput(input);

    expect(lexer.lex()).toEqual("WORD");
    expect(lexer.lex()).toEqual("NUM");
  });

  it("test lexer reject() exception when not in backtracking mode", () => {
    const dict = {
      rules: [
        ["[A-Z]+([0-9]+)", "if (this.matches[1].length) this.reject(); else return 'ID';" ],
        ["[A-Z]+", "return 'WORD';" ],
        ["[0-9]+", "return 'NUM';" ]
      ],
      options: {backtrack_lexer: false}
    };
    const input = "A5";

    const lexer = new RegExpLexer(dict);
    lexer.setInput(input);

    expect(() => { lexer.lex(); }).toThrow(Error); // !!!
    // function(err) {
    //   return (err instanceof Error) && /You can only invoke reject/.test(err);
    // });
  });

  it("test yytext state after unput", () => {
    const dict = {
      rules: [
        ["cat4", "this.unput('4'); return 'CAT';" ],
        ["4", "return 'NUMBER';" ],
        ["$", "return 'EOF';"]
      ]
    };

    const input = "cat4";

    const lexer = new RegExpLexer(dict);
    lexer.setInput(input);
    expect(lexer.lex()).toEqual("CAT");
    /*the yytext should be 'cat' since we unput '4' from 'cat4' */
    expect(lexer.yytext).toEqual("cat");
    expect(lexer.lex()).toEqual("NUMBER");
    expect(lexer.lex()).toEqual("EOF");
  });
});
