const {Jison, Lexer} = require("../../parser-generator/tests/setup");
const ebnf = require("../ebnf-transform");
Shared = require("../../parser-generator/tests/extend-expect");

function testParse(top, strings) {
  return function() {
    var grammar = {
      "lex": {
        "rules": [
          {pattern: "\\s+", action: ''},
          {pattern: "[A-Za-z]+", action: "return 'word';"},
          {pattern: ",", action: "return ',';"},
          {pattern: "$", action: "return 'EOF';"}
        ]
      },
      "start": "top",
      "bnf": ebnf.transform({"top": [top]})
    };
    strings = (typeof(strings) === 'string' ? [strings] : strings);
    strings.forEach(function(string) {
      expect(new Parser(grammar).parse(string)).toBe(true);
    });
  };
}

function testBadParse(top, strings) {
  return function() {
    var grammar = {
      "lex": {
        "rules": [
          {pattern: "\\s+", action: ''},
          {pattern: "[A-Za-z]+", action: "return 'word';"},
          {pattern: ",", action: "return ',';"},
          {pattern: "$", action: "return 'EOF';"}
        ]
      },
      "start": "top",
      "ebnf": {"top": [top]}
    };
    strings = (typeof(strings) === 'string' ? [strings] : strings);
    strings.forEach(function(string) {
      expect(() => { new Parser(grammar).parse(string); }).toThrow();
    });
  };
}

function testAlias(top, obj, str) {
  return function() {
    var grammar = {
      "lex": {
        "rules": [
          {pattern: "\\s+", action: ''},
          {pattern: "[A-Za-z]+", action: "return 'word';"},
          {pattern: ",", action: "return ',';"},
          {pattern: "$", action: "return 'EOF';"}
        ]
      },
      "start": "top",
      "bnf": ebnf.transform({"top": [top]})
    };
    expect(grammar['bnf'], obj).toEqual(obj);
    expect(new Parser(grammar).parse(str)).toBe(true);
  };
}

describe("bnf", () => {
  it("test idempotent transform", () => {
    const first = {
      "nodelist": [["", "$$ = [];"], ["nodelist node", "$1.push($2);"]]
    };
    const second = ebnf.transform(JSON.parse(JSON.stringify(first)));
    expect(second).toEqual(first);
  });
  it("test repeat (*) on empty string", () => { testParse("word* EOF", ""); });
  it("test repeat (*) on single word", () => { testParse("word* EOF", "oneword"); });
  it("test repeat (*) on multiple words", () => { testParse("word* EOF", "multiple words"); });
  it("test repeat (+) on empty string", () => { testBadParse("word+ EOF", ""); });
  it("test repeat (+) on single word", () => { testParse("word+ EOF", "oneword"); });
  it("test repeat (+) on multiple words", () => { testParse("word+ EOF", "multiple words"); });
  it("test option (?) on empty string", () => { testParse("word? EOF", ""); });
  it("test option (?) on single word", () => { testParse("word? EOF", "oneword"); });
  it("test group () on simple phrase", () => { testParse("(word word) EOF", "two words"); });
  it("test group () with multiple options on first option", () => { testParse("((word word) | word) EOF", "hi there"); });
  it("test group () with multiple options on second option", () => { testParse("((word word) | word) EOF", "hi"); });
  it("test complex expression ( *, ?, () )", () => { testParse("(word (',' word)*)? EOF ", ["", "hi", "hi, there"]); });
  it("test named repeat (*)", () => { testAlias(
    "word*[bob] EOF",
    { top: [ 'bob EOF' ],
      bob: [ [ '', '$$ = [];' ], [ 'bob word', '$1.push($2);' ] ] }, "word"); });
  it("test named repeat (+)", () => { testAlias(
    "word+[bob] EOF",
    { top: [ 'bob EOF' ],
      bob: [ [ 'word', '$$ = [$1];' ], [ 'bob word', '$1.push($2);' ] ] }, "wordy word"); });
  it("test named group ()", () => { testAlias(
    "word[alice] (',' word)*[bob] EOF",
    {"top":["word[alice] bob EOF"],"bob":[["","$$ = [];"],["bob , word","$1.push($2);"]]},
    "one, two"); });
  it("test named option (?)", () => { testAlias(
    "word[alex] word?[bob] EOF",
    { top: [ 'word[alex] bob EOF' ], bob: [ '', 'word' ] },
    "oneor two"); });
  it("test named complex expression (())", () => { testAlias(
    "word[alpha] (word[alex] (word[bob] word[carol] ',')+[david] word ',')*[enoch] EOF",
    {"top":["word[alpha] enoch EOF"],"david":[["word[bob] word[carol] ,","$$ = [$1];"],["david word[bob] word[carol] ,","$1.push($2);"]],
     "enoch":[["","$$ = [];"],["enoch word[alex] david word ,","$1.push($2);"]]},
    "one two three four, five,"); });
});
