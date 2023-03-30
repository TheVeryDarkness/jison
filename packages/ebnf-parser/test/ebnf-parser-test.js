const assert = require("assert"),
     bnf = require("../ebnf-parser"),
     ebnf = require("../ebnf-transform");

function testParse (top, strings) {
  const expected = {
    "bnf": ebnf.transform({"top": [top]})
  };
  const grammar = "%ebnf\n%%\ntop : "+top+";";
  expect(bnf.parse(grammar)).toEqual(expected);
}

describe("ebnf-parser", () => {
  it("test idempotent transform", () => {
    const first = {
      "nodelist": [["", "$$ = [];"], ["nodelist node", "$1.push($2);"]]
    };
    const second = ebnf.transform(JSON.parse(JSON.stringify(first)));
    assert.deepEqual(second, first);
  });
  it("test repeat (*) on empty string", () => testParse("word* EOF", ""));
  it("test repeat (*) on single word", () => testParse("word* EOF", "oneword"));
  it("test repeat (*) on multiple words", () => testParse("word* EOF", "multiple words"));
  it("test repeat (+) on single word", () => testParse("word+ EOF", "oneword"));
  it("test repeat (+) on multiple words", () => testParse("word+ EOF", "multiple words"));
  it("test option (?) on empty string", () => testParse("word? EOF", ""));
  it("test option (?) on single word", () => testParse("word? EOF", "oneword"));
  it("test group () on simple phrase", () => testParse("(word word) EOF", "two words"));
  it("test group () with multiple options on first option", () => testParse("((word word) | word) EOF", "hi there"));
  it("test group () with multiple options on second option", () => testParse("((word word) | word) EOF", "hi"));
  it("test complex expression ( *, ?, () )", () => testParse("(word (',' word)*)? EOF", ["", "hi", "hi, there"]));
});
