const RegExpLexer = require("../lib/regexp-lexer");
const { JisonLexer } = require('@ts-jison/lexer');
Shared = require("../../parser-generator/tests/extend-expect");
JisonLexer.print = Shared.print;
afterEach(Shared.nothingPrinted);

describe("lexer-generator-test", () => {
  it("test character classes", () => {
    const dict = {
      rules: [
        {pattern: "x", action: "return 'X';"},
        {pattern: "\\{[^}]*\\}", action: "yytext = yytext.substr(1, yyleng-2); return 'ACTION';"},
        {pattern: "$", action: "return 'EOF';"}
      ]
    };

    const input = 'x{code}x';

    const lexer = new RegExpLexer(dict, input);
    expect(lexer.lex()).toEqual("X");
    expect(lexer.lex()).toEqual("ACTION");
    expect(lexer.lex()).toEqual("X");
    expect(lexer.lex()).toEqual("EOF");
  });

  it("test basic matchers", () => {
    const dict = {
      rules: [
        {pattern: "x", action: "return 'X';"},
        {pattern: "y", action: "return 'Y';"},
        {pattern: "$", action: "return 'EOF';"}
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
        {pattern: "x", action: "return yy.x;"},
        {pattern: "y", action: "return 'Y';"},
        {pattern: "$", action: "return 'EOF';"}
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
        {pattern: "x", action: "return 'X';"},
        {pattern: "y", action: "return 'Y';"},
        {pattern: "$", action: "return 'EOF';"}
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
        {pattern: "x", action: "return 'X';"},
        {pattern: "y", action: "return 'Y';"},
        {pattern: "$", action: "return 'EOF';"}
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
        {pattern: "x", action: "return 'X';"},
        {pattern: "y", action: "return 'Y';"},
        {pattern: "{digit}+", action: "return 'NAT';"},
        {pattern: "$", action: "return 'EOF';"}
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
        {pattern: "-", action: "return '-';"},
        {pattern: "{hex}+", action: "return 'HEX';"},
        {pattern: "$", action: "return 'EOF';"}
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
        "dot": ".", // not escaped 'cause it only appears in a character class
        "digit_": "{digit}[_{dot}-]{digit}",
        "digit2": "{digit}{digit}",
        "digit3": "{digit2}{digit}"
      },
      rules: [
        {pattern: "x", action: "return 'X';"},
        {pattern: "y", action: "return 'Y';"},
        {pattern: "{digit_}", action: "return ['N.N', yytext];"},
        {pattern: "{digit3}", action: "return 'NNN';"},
        {pattern: "{digit2}", action: "return 'NN';"},
        {pattern: "{digit}", action: "return 'N';"},
        {pattern: "$", action: "return 'EOF';"}
      ]
    };

    const input = "x0.0x1_1x2-2x1y42y123";

    const lexer = new RegExpLexer(dict, input);
    expect(lexer.lex()).toEqual("X");
    expect(lexer.lex()).toEqual(["N.N", "0.0"]);
    expect(lexer.lex()).toEqual("X");
    expect(lexer.lex()).toEqual(["N.N", "1_1"]);
    expect(lexer.lex()).toEqual("X");
    expect(lexer.lex()).toEqual(["N.N", "2-2"]);
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
        {pattern: "-", action: "return '-';"},
        {pattern: "{col}", action: "return 'HEX';"},
        {pattern: "$", action: "return 'EOF';"}
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
        {pattern: "x", action: "return included ? 'Y' : 'N';"},
        {pattern: "$", action: "return 'EOF';"}
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
        {pattern: "x", action: "return 'X';"},
        {pattern: "y", action: "return 'Y';"},
        {pattern: "\\s+", action: "/* skip whitespace */"},
        {pattern: "$", action: "return 'EOF';"}
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
        {pattern: "for\\b", action: "return 'FOR';"},
        {pattern: "if\\b", action: "return 'IF';"},
        {pattern: "[a-z]+", action: "return 'IDENTIFIER';"},
        {pattern: "\\s+", action: "/* skip whitespace */"},
        {pattern: "$", action: "return 'EOF';"}
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
        {pattern: "x", action: "yytext = 'hi der'; return 'X';"}
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
        {pattern: "\\s+", action: "/* skip whitespace */"},
        {pattern: "x", action: "return 'x';"},
        {pattern: "y", action: "return 'y';"}
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
        {pattern: "\\s+", action: "/* skip whitespace */"},
        {pattern: "x", action: "return 'x';"},
        {pattern: "y", action: "return 'y';"}
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
        {pattern: "x", action: "return 'X';"},
        {pattern: '"[^"]*', action: function () {
          if(yytext.charAt(yyleng-1) == '\\') {
            this.more();
          } else {
            yytext += this.input(); // swallow end quote
            return "STRING";
          }
        }},
        {pattern: "$", action: "return 'EOF';"}
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
        {pattern: "x", action: "return 'X';"},
        {pattern: "y", action: "return 'Y';"},
        {pattern: "$", action: "return 'EOF';"}
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
        {pattern: "x", action: "return 'X';"},
        {pattern: "y", action: "return 'Y';"},
        {pattern: "$", action: "return 'EOF';"}
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
        {pattern: "x", action: "return 'X';"},
        {pattern: "y", action: "return 'Y';"},
        {pattern: "$", action: "return 'EOF';"}
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
        {pattern: "x", action: "return 'X';"},
        {pattern: '"[^"]*', action: function () {
          if(yytext.charAt(yyleng-1) == '\\') {
            this.more();
          } else {
            yytext += this.input(); // swallow end quote
            return "STRING";
          }
        }},
        {pattern: "$", action: "return 'EOF';"}
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
        {pattern: "x", action: "return 'X';"},
        {pattern: "y", action: "return 'Y';"},
        {pattern: "$", action: "return 'EOF';"}
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

  xit("test AMD module generator", () => { // TODO
    const dict = {
      rules: [
        {pattern: "x", action: "return 'X';"},
        {pattern: "y", action: "return 'Y';"},
        {pattern: "$", action: "return 'EOF';"}
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
          {pattern: "\\/\\/.*", action: "/* ignore comment */"},
          {pattern: "main\\b", action: "return 'MAIN';"},
          {pattern: "class\\b", action: "return 'CLASS';"},
          {pattern: "extends\\b", action: "return 'EXTENDS';"},
          {pattern: "nat\\b", action: "return 'NATTYPE';"},
          {pattern: "if\\b", action: "return 'IF';"},
          {pattern: "else\\b", action: "return 'ELSE';"},
          {pattern: "for\\b", action: "return 'FOR';"},
          {pattern: "printNat\\b", action: "return 'PRINTNAT';"},
          {pattern: "readNat\\b", action: "return 'READNAT';"},
          {pattern: "this\\b", action: "return 'THIS';"},
          {pattern: "new\\b", action: "return 'NEW';"},
          {pattern: "var\\b", action: "return 'VAR';"},
          {pattern: "null\\b", action: "return 'NUL';"},
          {pattern: "{digit}+", action: "return 'NATLITERAL';"},
          {pattern: "{id}", action: "return 'ID';"},
          {pattern: "==", action: "return 'EQUALITY';"},
          {pattern: "=", action: "return 'ASSIGN';"},
          {pattern: "\\+", action: "return 'PLUS';"},
          {pattern: "-", action: "return 'MINUS';"},
          {pattern: "\\*", action: "return 'TIMES';"},
          {pattern: ">", action: "return 'GREATER';"},
          {pattern: "\\|\\|", action: "return 'OR';"},
          {pattern: "!", action: "return 'NOT';"},
          {pattern: "\\.", action: "return 'DOT';"},
          {pattern: "\\{", action: "return 'LBRACE';"},
          {pattern: "\\}", action: "return 'RBRACE';"},
          {pattern: "\\(", action: "return 'LPAREN';"},
          {pattern: "\\)", action: "return 'RPAREN';"},
          {pattern: ";", action: "return 'SEMICOLON';"},
          {pattern: "\\s+", action: "/* skip whitespace */"},
          {pattern: ".", action: "print('Illegal character');throw 'Illegal character';"},
          {pattern: "$", action: "return 'ENDOFFILE';"}
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
        {pattern: "enter-test", action: "this.begin('TEST');"},
        {start: ["TEST"], pattern: "x", action: "return 'T';"},
        {start: ["TEST"], pattern: "y", action: "this.begin('INITIAL'); return 'TY';"},
        {pattern: "x", action: "return 'X';"},
        {pattern: "y", action: "return 'Y';"},
        {pattern: "$", action: "return 'EOF';"}
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
        {pattern: "\\/\\/", action: "this.begin('EAT');"},
        {start: ["EAT"], pattern: ".", action: ""},
        {start: ["EAT"], pattern: "\\n", action: "this.begin('INITIAL');"},
        {pattern: "x", action: "return 'X';"},
        {pattern: "y", action: "return 'Y';"},
        {pattern: "$", action: "return 'EOF';"}
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
        {pattern: "\\/\\/", action: "this.begin('EAT');"},
        {start: ["EAT"], pattern: ".", action: ""},
        {start: ["EAT"], pattern: "\\n", action: "this.popState();"},
        {pattern: "x", action: "return 'X';"},
        {pattern: "y", action: "return 'Y';"},
        {pattern: "$", action: "return 'EOF';"}
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
        {pattern: "\\/\\/", action: "this.begin('EAT');"},
        {start: ["EAT"], pattern: ".", action: ""},
        {pattern: "x", action: "return 'X';"},
        {pattern: "y", action: "return 'Y';"},
        {start: ["*"], pattern: "$", action: "return 'EOF';"}
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
        {pattern: "\\/\\/", action: "this.begin('EAT');"},
        {start: ["EAT"], pattern: ".", action: "if (YYSTATE==='EAT') return 'E';"},
        {pattern: "x", action: "if (YY_START==='INITIAL') return 'X';"},
        {pattern: "y", action: "return 'Y';"},
        {start: ["*"], pattern: "$", action: "return 'EOF';"}
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
        {pattern: "\\u2713", action: "return 'CHECK';"},
        {pattern: "\\u03c0", action: "return 'PI';"},
        {pattern: "y", action: "return 'Y';"}
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
        {pattern: "π", action: "return 'PI';"},
        {pattern: "y", action: "return 'Y';"}
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
        {pattern: ".", action: "return 'DOT';"},
        {pattern: "cat", action: "return 'CAT';"}
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
        {pattern: "cat", action: "return 'CAT';"}
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
        {pattern: "cat", action: "this.less(2); return 'CAT';"},
        {pattern: "t", action: "return 'T';"}
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
        {pattern: "U", action: "this.begin('UN');return 'U';"},
        {start: ["UN"], pattern: "$", action: "this.unput('X')"},
        {start: ["UN"], pattern: "X", action: "this.popState();return 'X';"},
        {pattern: "$", action: "return 'EOF'"}
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
        {pattern: "x", action: "return 'X';"}
      ],
      options: {flex: true}
    };
    const input = "xyx";

    const logSpy = jest.spyOn(global.console, 'log').mockImplementation(() => { });
    const lexer = new RegExpLexer(dict);
    lexer.setInput(input);

    expect(lexer.lex()).toEqual("X");
    expect(logSpy).toHaveBeenCalledTimes(0);
    expect(lexer.lex()).toEqual("X");
    expect(logSpy.mock.calls).toContainEqual(['y']);

    logSpy.mockRestore();
  });

  it("test pipe precedence", () => {
    const dict = {
      rules: [
        {pattern: "x|y", action: "return 'X_Y';"},
        {pattern: ".", action:   "return 'N';"}
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
        {pattern: "x+", action: "return 'X';"},
        {pattern: ".", action:   "return 'N';"}
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
        {pattern: "x+", action: "return 'X';"},
        {pattern: "y\\n", action: "this.unput('\\n'); return 'Y';"},
        {pattern: "\\ny", action: "this.unput('y'); return 'BR';"},
        {pattern: "y", action: "return 'Y';"},
        {pattern: ".", action:   "return 'N';"}
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
        {pattern: "x+", action: "return 'X';"},
        {pattern: "y\\ny\\n", action: "this.unput('\\n'); return 'YY';"},
        {pattern: "\\ny", action: "this.unput('y'); return 'BR';"},
        {pattern: "y", action: "return 'Y';"},
        {pattern: ".", action:   "return 'N';"}
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
        {pattern: "[A-Z]+([0-9]+)", action: "if (this.matches[0].length) this.reject(); else return 'ID';"},
        {pattern: "[A-Z]+", action: "return 'WORD';"},
        {pattern: "[0-9]+", action: "return 'NUM';"}
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
        {pattern: "[A-Z]+([0-9]+)", action: "if (this.matches[0].length) this.reject(); else return 'ID';"},
        {pattern: "[A-Z]+", action: "return 'WORD';"},
        {pattern: "[0-9]+", action: "return 'NUM';"}
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
        {pattern: "cat4", action: "this.unput('4'); return 'CAT';"},
        {pattern: "4", action: "return 'NUMBER';"},
        {pattern: "$", action: "return 'EOF';"}
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
