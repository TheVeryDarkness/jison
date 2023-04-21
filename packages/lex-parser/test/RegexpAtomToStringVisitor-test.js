const {LexRegexpParser} = require('../lib/lex-regexp-parser');

const {RegexpAtom} = require('../lib/RegexpAtom');
const {RegexpAtomToJs} = require('../lib/RegexpAtomToStringVisitor');

const G = {
  capture: "capture", simplify: "simplify", preserve: "preserve"
};

function test (input, g, output) {
  it(g + ' ' + input, () => {
    expect(RegexpAtomToJs.serialize(new LexRegexpParser().parse(input), g, true)).toBe(output);
  });
}

describe('RegexpAtomToStringVisitor', () => {
  if (true) {
  // Concat
  test("[a-z][a-z0-9]+", G.preserve, "[a-z][a-z0-9]+");
  test("(([a-z])([a-z0-9]+))", G.preserve, "(?:(?:[a-z])(?:[a-z0-9]+))");
  test("([a-z][a-z0-9])+", G.preserve, "(?:[a-z][a-z0-9])+");

  test("[a-z][a-z0-9]+", G.capture, "[a-z][a-z0-9]+");
  test("(([a-z])([a-z0-9]+))", G.capture, "(([a-z])([a-z0-9]+))");
  test("([a-z][a-z0-9])+", G.capture, "([a-z][a-z0-9])+");

  test("[a-z][a-z0-9]+", G.simplify, "[a-z][a-z0-9]+");
  test("(([a-z])([a-z0-9]+))", G.simplify, "[a-z][a-z0-9]+");
  test("([a-z][a-z0-9])+", G.simplify, "(?:[a-z][a-z0-9])+");

  // Choice
  test("[a-z]|[a-z0-9]+", G.preserve, "[a-z]|[a-z0-9]+");
  test("(([a-z])|([a-z0-9]+))", G.preserve, "(?:(?:[a-z])|(?:[a-z0-9]+))");
  test("([a-z]|[a-z0-9])+", G.preserve, "(?:[a-z]|[a-z0-9])+");

  test("[a-z]|[a-z0-9]+", G.capture, "[a-z]|[a-z0-9]+");
  test("(([a-z])|([a-z0-9]+))", G.capture, "(([a-z])|([a-z0-9]+))");
  test("([a-z]|[a-z0-9])+", G.capture, "([a-z]|[a-z0-9])+");

  test("[a-z]|[a-z0-9]+", G.simplify, "[a-z]|[a-z0-9]+");
  test("(([a-z])|([a-z0-9]+))", G.simplify, "[a-z]|[a-z0-9]+");
  test("([a-z]|[a-z0-9])+", G.simplify, "(?:[a-z]|[a-z0-9])+");

  // SpecialGroup
  test("[a-z](?=[a-z0-9]+)", G.preserve, "[a-z](?=[a-z0-9]+)");
  test("(([a-z])(?!([a-z0-9]+)))", G.preserve, "(?:(?:[a-z])(?!(?:[a-z0-9]+)))");
  test("([a-z](?=[a-z0-9])+)", G.preserve, "(?:[a-z](?=[a-z0-9])+)");

  test("[a-z](?![a-z0-9]+)", G.capture, "[a-z](?![a-z0-9]+)");
  test("(([a-z])(?=([a-z0-9]+)))", G.capture, "(([a-z])(?=([a-z0-9]+)))");
  test("([a-z](?=[a-z0-9])+)", G.capture, "([a-z](?=[a-z0-9])+)");

  test("[a-z](?=[a-z0-9]+)", G.simplify, "[a-z](?=[a-z0-9]+)");
  test("(([a-z])(?=([a-z0-9]+)))", G.simplify, "[a-z](?=[a-z0-9]+)");
  test("([a-z](?![a-z0-9])+)", G.simplify, "[a-z](?![a-z0-9])+");

  // Empty
  test("|[a-z0-9]+", G.preserve, "|[a-z0-9]+");
  test("[a-z]|", G.preserve, "[a-z]|");
  test("(|([a-z0-9]+))", G.preserve, "(?:|(?:[a-z0-9]+))");
  test("(([a-z])|)", G.preserve, "(?:(?:[a-z])|)");
  test("(|[a-z0-9])+", G.preserve, "(?:|[a-z0-9])+");
  test("([a-z]|)+", G.preserve, "(?:[a-z]|)+");

  test("|[a-z0-9]+", G.capture, "|[a-z0-9]+");
  test("[a-z]|", G.capture, "[a-z]|");
  test("(|([a-z0-9]+))", G.capture, "(|([a-z0-9]+))");
  test("(([a-z])|)", G.capture, "(([a-z])|)");
  test("(|[a-z0-9])+", G.capture, "(|[a-z0-9])+");
  test("([a-z]|)+", G.capture, "([a-z]|)+");

  test("|[a-z0-9]+", G.simplify, "|[a-z0-9]+");
  test("[a-z]|", G.simplify, "[a-z]|");
  test("(|([a-z0-9]+))", G.simplify, "|[a-z0-9]+");
  test("(([a-z])|)", G.simplify, "[a-z]|");
  test("(|[a-z0-9])+", G.simplify, "(?:|[a-z0-9])+");
  test("([a-z]|)+", G.simplify, "(?:[a-z]|)+");

  // LookAhead
  test("[a-z]/[a-z0-9]+", G.preserve, "[a-z](?=[a-z0-9]+)");
  test("(([a-z])/([a-z0-9]+))", G.preserve, "(?:(?:[a-z])(?=(?:[a-z0-9]+)))");
  test("([a-z]/[a-z0-9])+", G.preserve, "(?:[a-z](?=[a-z0-9]))+");

  test("[a-z]/[a-z0-9]+", G.capture, "[a-z](?=[a-z0-9]+)");
  test("(([a-z])/([a-z0-9]+))", G.capture, "(([a-z])(?=([a-z0-9]+)))");
  test("([a-z]/[a-z0-9])+", G.capture, "([a-z](?=[a-z0-9]))+");

  test("[a-z]/[a-z0-9]+", G.simplify, "[a-z](?=[a-z0-9]+)");
  test("(([a-z])/([a-z0-9]+))", G.simplify, "[a-z](?=[a-z0-9]+)");
  test("([a-z]/[a-z0-9])+", G.simplify, "(?:[a-z](?=[a-z0-9]))+");

  // LookBehind
  test("[a-z]/![a-z0-9]+", G.preserve, "[a-z](?![a-z0-9]+)");
  test("(([a-z])/!([a-z0-9]+))", G.preserve, "(?:(?:[a-z])(?!(?:[a-z0-9]+)))");
  test("([a-z]/![a-z0-9])+", G.preserve, "(?:[a-z](?![a-z0-9]))+");

  test("[a-z]/![a-z0-9]+", G.capture, "[a-z](?![a-z0-9]+)");
  test("(([a-z])/!([a-z0-9]+))", G.capture, "(([a-z])(?!([a-z0-9]+)))");
  test("([a-z]/![a-z0-9])+", G.capture, "([a-z](?![a-z0-9]))+");

  test("[a-z]/![a-z0-9]+", G.simplify, "[a-z](?![a-z0-9]+)");
  test("(([a-z])/!([a-z0-9]+))", G.simplify, "[a-z](?![a-z0-9]+)");
  test("([a-z]/![a-z0-9])+", G.simplify, "(?:[a-z](?![a-z0-9]))+");

  // Wildcard
  test(".[a-z0-9]+", G.preserve, ".[a-z0-9]+");
  test("[a-z].+", G.preserve, "[a-z].+");
  test("((.)([a-z0-9]+))", G.preserve, "(?:(?:.)(?:[a-z0-9]+))");
  test("(([a-z])(.+))", G.preserve, "(?:(?:[a-z])(?:.+))");
  test("(.[a-z0-9])+", G.preserve, "(?:.[a-z0-9])+");
  test("([a-z].)+", G.preserve, "(?:[a-z].)+");

  test(".[a-z0-9]+", G.capture, ".[a-z0-9]+");
  test("[a-z].+", G.capture, "[a-z].+");
  test("((.)([a-z0-9]+))", G.capture, "((.)([a-z0-9]+))");
  test("(([a-z])(.+))", G.capture, "(([a-z])(.+))");
  test("(.[a-z0-9])+", G.capture, "(.[a-z0-9])+");
  test("([a-z].)+", G.capture, "([a-z].)+");

  test(".[a-z0-9]+", G.simplify, ".[a-z0-9]+");
  test("[a-z].+", G.simplify, "[a-z].+");
  test("((.)([a-z0-9]+))", G.simplify, ".[a-z0-9]+");
  test("(([a-z])(.+))", G.simplify, "[a-z].+");
  test("(.[a-z0-9])+", G.simplify, "(?:.[a-z0-9])+");
  test("([a-z].)+", G.simplify, "(?:[a-z].)+");

  // Begin
  test("^[a-z][a-z0-9]+", G.preserve, "^[a-z][a-z0-9]+");
  test("^(([a-z])([a-z0-9]+))", G.capture, "^(([a-z])([a-z0-9]+))");
  test("^([a-z][a-z0-9])+", G.simplify, "^(?:[a-z][a-z0-9])+");

  // End
  test("[a-z][a-z0-9]+$", G.preserve, "[a-z][a-z0-9]+$");
  test("(([a-z])([a-z0-9]+))$", G.capture, "(([a-z])([a-z0-9]+))$");
  test("([a-z][a-z0-9])+$", G.simplify, "(?:[a-z][a-z0-9])+$");

  // Reference
  test("{REF}[a-z0-9]+", G.preserve, "{REF}[a-z0-9]+");
  test("[a-z]{REF}", G.preserve, "[a-z]{REF}");
  test("({REF}([a-z0-9]+))", G.preserve, "(?:{REF}(?:[a-z0-9]+))");
  test("(([a-z]){REF})", G.preserve, "(?:(?:[a-z]){REF})");
  test("({REF}[a-z0-9])+", G.preserve, "(?:{REF}[a-z0-9])+");
  test("([a-z]{REF})+", G.preserve, "(?:[a-z]{REF})+");

  test("{REF}[a-z0-9]+", G.capture, "{REF}[a-z0-9]+");
  test("[a-z]{REF}", G.capture, "[a-z]{REF}");
  test("({REF}([a-z0-9]+))", G.capture, "({REF}([a-z0-9]+))");
  test("(([a-z]){REF})", G.capture, "(([a-z]){REF})");
  test("({REF}[a-z0-9])+", G.capture, "({REF}[a-z0-9])+");
  test("([a-z]{REF})+", G.capture, "([a-z]{REF})+");

  test("{REF}[a-z0-9]+", G.simplify, "{REF}[a-z0-9]+");
  test("[a-z]{REF}", G.simplify, "[a-z]{REF}");
  test("({REF}([a-z0-9]+))", G.simplify, "{REF}[a-z0-9]+");
  test("(([a-z]){REF})", G.simplify, "[a-z]{REF}");
  test("({REF}[a-z0-9])+", G.simplify, "(?:{REF}[a-z0-9])+");
  test("([a-z]{REF})+", G.simplify, "(?:[a-z]{REF})+");

  it('Reference !debug', () => {
    expect(() => {RegexpAtomToJs.serialize(new LexRegexpParser().parse("{REF}[a-z0-9]+"), G.preserve, false);}).toThrow(/Reference.visit\(\) should never be called/);
  });
// TODO: \\b
  // Literal
  test("'abc'[a-z0-9]+", G.preserve, "abc[a-z0-9]+");
  test("[a-z]'abc'", G.preserve, "[a-z]abc\\b");
  test("('abc'([a-z0-9]+))", G.preserve, "(?:abc(?:[a-z0-9]+))");
  test("(([a-z])'abc')", G.preserve, "(?:(?:[a-z])abc)");
  test("('abc'[a-z0-9])+", G.preserve, "(?:abc[a-z0-9])+");
  test("([a-z]'abc')+", G.preserve, "(?:[a-z]abc)+");

  test("'abc'[a-z0-9]+", G.capture, "abc[a-z0-9]+");
  test("[a-z]'abc'", G.capture, "[a-z]abc\\b");
  test("('abc'([a-z0-9]+))", G.capture, "(abc([a-z0-9]+))");
  test("(([a-z])'abc')", G.capture, "(([a-z])abc)");
  test("('abc'[a-z0-9])+", G.capture, "(abc[a-z0-9])+");
  test("([a-z]'abc')+", G.capture, "([a-z]abc)+");

  test("'abc'[a-z0-9]+", G.simplify, "abc[a-z0-9]+");
  test("[a-z]'abc'", G.simplify, "[a-z]abc\\b");
  test("('abc'([a-z0-9]+))", G.simplify, "abc[a-z0-9]+");
  test("(([a-z])'abc')", G.simplify, "[a-z]abc");
  test("('abc'[a-z0-9])+", G.simplify, "(?:abc[a-z0-9])+");
  test("([a-z]'abc')+", G.simplify, "(?:[a-z]abc)+");
  }
  // Operator
  test(`\\/*(.|\\n|\\r)*?`, G.simplify, `\\/*(?:.|\\n|\\r)*?`);
  test(`\\n`, G.simplify, `\\n`);
});
