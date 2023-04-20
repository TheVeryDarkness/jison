const Jison = require("../tests/setup").Jison,
    Lexer = require("../tests/setup").Lexer;
Shared = require("../tests/extend-expect");
Jison.print = Shared.print;
afterEach(Shared.nothingPrinted);

describe("lr1", () => {
  it("test xx nullable grammar", () => {
    var lexData = {
      rules: [
        {pattern: "x", action: "return 'x';"},
        {pattern: "y", action: "return 'y';"}
      ]
    };
    var grammar = {
      tokens: [ 'x' ],
      startSymbol: "A",
      bnf: {
        "A" :[ 'A x',
               ''      ]
      }
    };

    var parser = new Jison.Parser(grammar, {type: "lr"});
    parser.lexer = new Lexer(lexData);

    expect(parser.parse("xxx")).toParse("parse");
    expect(parser.parse("x")).toParse("parse single x");
    expect(() => { parser.parse("+"); }).toThrow(/^Lexical error on line 1. Unrecognized text./);
  });

  it("test LR parse", () => {
    var lexData2 = {
      rules: [
        {pattern: "0", action: "return 'ZERO';"},
        {pattern: "\\+", action: "return 'PLUS';"}
      ]
    };
    var grammar = {
      tokens: [ "ZERO", "PLUS"],
      startSymbol: "E",
      bnf: {
        "E" :[ "E PLUS T",
               "T"      ],
        "T" :[ "ZERO" ]
      }
    };
    var parser = new Jison.Parser(grammar, {type: "lr"});
    parser.lexer = new Lexer(lexData2);

    expect(parser.parse("0+0+0")).toParse("parse");
  });

  it("test basic JSON grammar", () => {
    var grammar = {
      "lex": {
        "macros": {
          "digit": "[0-9]"
        },
        "rules": [
          {pattern: "\\s+", action: "/* skip whitespace */"},
          {pattern: "{digit}+(\\.{digit}+)?", action: "return 'NUMBER';"},
          {pattern: "\"[^\"]*", action: function(){
            if(yytext.charAt(yyleng-1) == '\\') {
              // remove escape
              yytext = yytext.substr(0,yyleng-2);
              this.more();
            } else {
              yytext = yytext.substr(1); // swallow start quote
              this.input(); // swallow end quote
              return "STRING";
            }
          }},
          {pattern: "\\{", action: "return '{'"},
          {pattern: "\\}", action: "return '}'"},
          {pattern: "\\[", action: "return '['"},
          {pattern: "\\]", action: "return ']'"},
          {pattern: ",", action: "return ','"},
          {pattern: ":", action: "return ':'"},
          {pattern: "true\\b", action: "return 'TRUE'"},
          {pattern: "false\\b", action: "return 'FALSE'"},
          {pattern: "null\\b", action: "return 'NULL'"}
        ]
      },

      "tokens": "STRING NUMBER { } [ ] , : TRUE FALSE NULL",
      "bnf": {
        "JsonThing": [ "JsonObject",
                       "JsonArray" ],

        "JsonObject": [ "{ JsonPropertyList }",
                        "{ }" ],

        "JsonPropertyList": [ "JsonProperty",
                              "JsonPropertyList , JsonProperty" ],

        "JsonProperty": [ "StringLiteral : JsonValue" ],

        "JsonArray": [ "[ JsonValueList ]" ,
                       "[ ]" ],

        "JsonValueList": [ "JsonValue",
                           "JsonValueList , JsonValue" ],

        "JsonValue": [ "StringLiteral",
                       "NumericalLiteral",
                       "JsonObject",
                       "JsonArray",
                       "TRUE",
                       "FALSE",
                       "NULL" ],

        "StringLiteral": [ "STRING" ],

        "NumericalLiteral": [ "NUMBER" ]
      },
    };

    var parser = new Jison.Parser(grammar, {type: "lr"});
    expect(parser.parse(`{ }`)).toBe(true);
    expect(parser.parse(`{ "foo": "Bar" }`)).toBe(true);
    expect(parser.parse(`{ "array": [1,2,3.004,4] }`)).toBe(true);
    expect(parser.parse(`{ "empty array": [] }`)).toBe(true);
    expect(parser.parse(`{ "empty array ws": [\n\t ] }`)).toBe(true);
    expect(parser.parse(`{ "deep array": [ [ [ 1,2,3 ] ] ] }`)).toBe(true);
    expect(parser.parse(`{ "foo": "Bar", "array": [1] }`)).toBe(true);
    expect(parser.parse(`{ "hi": 42 }`)).toBe(true);
    expect(parser.parse(`{ "false": false }`)).toBe(true);
    expect(parser.parse(`{ "true":true }`)).toBe(true);
    expect(parser.parse(`{ "null": null }`)).toBe(true);
    expect(parser.parse(`{ "obj": {"ha":"ho"} }`)).toBe(true);
    expect(parser.parse(`{ "string": "string\\"sgfg" }`)).toBe(true);
    expect(() => parser.parse(`{ { "a": 1 }: "val" }`)).toThrow(/Expecting '}', 'STRING', got '{'/);
    expect(() => parser.parse(`{ "a": 1, }`)).toThrow(/Expecting 'STRING', got '}'/);
    expect(() => parser.parse(`{ null: "null" }`)).toThrow(/Expecting '}', 'STRING', got 'NULL'/);
    expect(() => parser.parse(`{ "unterminated string": "string }`)).toThrow(/Expecting '}', ',', got '1'/);
    expect(() => parser.parse(`{ "unterminated escaped string": "string\\"sgfg }`)).toThrow(/Expecting '}', ',', got '1'/);
  });

  it("test compilers test grammar", () => {
    var lexData = {
      rules: [
        {pattern: "x", action: "return 'x';"}
      ]
    };
    var grammar = {
      tokens: [ 'x' ],
      startSymbol: "S",
      bnf: {
        "S" :[ 'A' ],
        "A" :[ 'B A', '' ],
        "B" :[ '', 'x' ]
      }
    };

    var parser = new Jison.Parser(grammar, {type: "lr"});
    expect().printed([
  `Conflict in grammar: multiple actions possible when lookahead token is $end in state 0
- reduce by rule: B -> 
- reduce by rule: A -> `,
  `Conflict in grammar: multiple actions possible when lookahead token is x in state 0
- reduce by rule: B -> 
- shift token (then go to state 4)`,
  `Conflict in grammar: multiple actions possible when lookahead token is $end in state 3
- reduce by rule: B -> 
- reduce by rule: A -> `,
  `Conflict in grammar: multiple actions possible when lookahead token is x in state 3
- reduce by rule: B -> 
- shift token (then go to state 4)`,
  `
States with conflicts:`,
  `State 0`,
  `  $accept -> .S $end #lookaheads= $end
  S -> .A #lookaheads= $end
  A -> .B A #lookaheads= $end
  A -> . #lookaheads= $end
  B -> . #lookaheads= $end x
  B -> .x #lookaheads= $end x`,
  `State 3`,
  `  A -> B .A #lookaheads= $end
  A -> .B A #lookaheads= $end
  A -> . #lookaheads= $end
  B -> . #lookaheads= $end x
  B -> .x #lookaheads= $end x`]);
    parser.lexer = new Lexer(lexData);

    expect(parser.parse("xxx")).toParse("parse");
  });

  it("test compilers test grammar 2", () => {
    var grammar = "%% n : a b ; a : | a x ; b : | b x y ;";

    var parser = new Jison.Generator(grammar, {type: "lr"});
    expect().printed([
  `Conflict in grammar: multiple actions possible when lookahead token is x in state 2
- reduce by rule: b -> 
- shift token (then go to state 4)`,
  `
States with conflicts:`,
  `State 2`,
  `  n -> a .b #lookaheads= $end
  a -> a .x #lookaheads= $end x
  a -> a .x #lookaheads= x
  b -> . #lookaheads= $end
  b -> .b x y #lookaheads= $end
  b -> . #lookaheads= x
  b -> .b x y #lookaheads= x`]);
    expect(parser.conflicts).toBe(1);
  });

  it("test nullables", () => {
    var lexData = {
      rules: [
        {pattern: "x", action: "return 'x';"},
        {pattern: "y", action: "return 'y';"},
        {pattern: "z", action: "return 'z';"},
        {pattern: ";", action: "return ';';"}
      ]
    };
    var grammar = {
      tokens: [ ';', 'x', 'y', 'z' ],
      startSymbol: "S",
      bnf: {
        "S" :[ 'A ;' ],
        "A" :[ 'B C' ],
        "B" :[ 'x' ],
        "C" :[ 'y', 'D' ],
        "D" :[ 'F' ],
        "F" :[ '', 'F z' ],
      }
    };

    var parser = new Jison.Parser(grammar, {type: "lr"});
    parser.lexer = new Lexer(lexData);

    expect(parser.parse("x;")).toParse("parse");
  });
});
