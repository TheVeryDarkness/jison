const assert = require("assert"),
    lex    = new (require("../lib/lex-parser").LexParser),
    fs     = require('fs'),
    path   = require('path');

function read (p, file) {
    return fs.readFileSync(path.join(__dirname, "../tests", p, file), "utf8");
}

describe("lex-parser", () => {

  it("test lex grammar with macros", () => {
    const lexgrammar = 'D [0-9]\nID [a-zA-Z][a-zA-Z0-9]+\n%%\n\n{D}"ohhai" {print(9);}\n"{" return \'{\';';
    const expected = {
      macros: {"D": "[0-9]", "ID": "[a-zA-Z][a-zA-Z0-9]+"},
      rules: [
        ["{D}ohhai\\b", "print(9);"],
        ["\\{", "return '{';"]
      ]
    };

    expect(lex.parse(lexgrammar)).toEqual(expected);
  });

  it("test escaped chars", () => {
    const lexgrammar = '%%\n"\\n"+ {return \'NL\';}\n\\n+ {return \'NL2\';}\n\\s+ {/* skip */}';
    const expected = {
      rules: [
        ["\\\\n+", "return 'NL';"],
        ["\\n+", "return 'NL2';"],
        ["\\s+", "/* skip */"]
      ]
    };

    expect(lex.parse(lexgrammar)).toEqual(expected);
  });

  it("test advanced", () => {
    const lexgrammar = '%%\n$ {return \'EOF\';}\n. {/* skip */}\n"stuff"*/("{"|";") {/* ok */}\n(.+)[a-z]{1,2}"hi"*? {/* skip */}\n';
    const expected = {
      rules: [
        ["$", "return 'EOF';"],
        [".", "/* skip */"],
        ["stuff*(?=(\\{|;))", "/* ok */"],
        ["(.+)[a-z]{1,2}hi*?", "/* skip */"]
      ]
    };

    expect(lex.parse(lexgrammar)).toEqual(expected);
  });

  it("test [^\\]]", () => {
    const lexgrammar = '%%\n"["[^\\]]"]" {return true;}\n\'f"oo\\\'bar\'  {return \'baz2\';}\n"fo\\"obar"  {return \'baz\';}\n';
    const expected = {
      rules: [
        ["\\[[^\\]]\\]", "return true;"],
        ["f\"oo'bar\\b", "return 'baz2';"],
        ['fo"obar\\b', "return 'baz';"]
      ]
    };

    expect(lex.parse(lexgrammar)).toEqual(expected);
  });

  it("test multiline action", () => {
    const lexgrammar = '%%\n"["[^\\]]"]" %{\nreturn true;\n%}\n';
    const expected = {
      rules: [
        ["\\[[^\\]]\\]", "\nreturn true;\n"]
      ]
    };

    expect(lex.parse(lexgrammar)).toEqual(expected);
  });

  it("test multiline action with single braces", () => {
    const lexgrammar = '%%\n"["[^\\]]"]" {\nconst b={};return true;\n}\n';
    const expected = {
      rules: [
        ["\\[[^\\]]\\]", "\nconst b={};return true;\n"]
      ]
    };

    expect(lex.parse(lexgrammar)).toEqual(expected);
  });

  it("test multiline action with brace in a multi-line-comment", () => {
    const lexgrammar = '%%\n"["[^\\]]"]" {\nconst b={}; /* { */ return true;\n}\n';
    const expected = {
      rules: [
        ["\\[[^\\]]\\]", "\nconst b={}; /* { */ return true;\n"]
      ]
    };

    expect(lex.parse(lexgrammar)).toEqual(expected);
  });

  it("test multiline action with brace in a single-line-comment", () => {
    const lexgrammar = '%%\n"["[^\\]]"]" {\nconst b={}; // { \nreturn 2 / 3;\n}\n';
    const expected = {
      rules: [
        ["\\[[^\\]]\\]", "\nconst b={}; // { \nreturn 2 / 3;\n"]
      ]
    };

    expect(lex.parse(lexgrammar)).toEqual(expected);
  });

  it("test multiline action with braces in strings", () => {
    const lexgrammar = '%%\n"["[^\\]]"]" {\nconst b=\'{\' + "{"; // { \nreturn 2 / 3;\n}\n';
    const expected = {
      rules: [
        ["\\[[^\\]]\\]", "\nconst b='{' + \"{\"; // { \nreturn 2 / 3;\n"]
      ]
    };

    expect(lex.parse(lexgrammar)).toEqual(expected);
  });

  it("test multiline action with braces in regexp", () => {
    const lexgrammar = '%%\n"["[^\\]]"]" {\nconst b=/{/; // { \nreturn 2 / 3;\n}\n';
    const expected = {
      rules: [
        ["\\[[^\\]]\\]", "\nconst b=/{/; // { \nreturn 2 / 3;\n"]
      ]
    };

    expect(lex.parse(lexgrammar)).toEqual(expected);
  });

  it("test include", () => {
    const lexgrammar = '\nRULE [0-9]\n\n%{\n hi <stuff> \n%}\n%%\n"["[^\\]]"]" %{\nreturn true;\n%}\n';
    const expected = {
      macros: {"RULE": "[0-9]"},
      actionInclude: "\n hi <stuff> \n",
      rules: [
        ["\\[[^\\]]\\]", "\nreturn true;\n"]
      ]
    };

    expect(lex.parse(lexgrammar)).toEqual(expected);
  });

  it("test bnf lex grammar", () => {
    const lexgrammar = lex.parse(read('lex', 'bnf.jisonlex'));
    const expected = JSON.parse(read('lex', 'bnf.lex.json'));

    expect(lexgrammar).toEqual(expected);
  });

  it("test lex grammar bootstrap", () => {
    const lexgrammar = lex.parse(read('lex', 'lex_grammar.jisonlex'));
    const expected = JSON.parse(read('lex', 'lex_grammar.lex.json'));

    expect(lexgrammar).toEqual(expected);
  });

  it("test ANSI C lexical grammar", () => {
    const lexgrammar = lex.parse(read('lex','ansic.jisonlex'));

    assert.ok(lexgrammar);
  });

  it("test advanced", () => {
    const lexgrammar = '%%\n"stuff"*/!("{"|";") {/* ok */}\n';
    const expected = {
      rules: [
        ["stuff*(?!(\\{|;))", "/* ok */"],
      ]
    };

    expect(lex.parse(lexgrammar)).toEqual(expected);
  });

  it("test start conditions", () => {
    const lexgrammar = '%s TEST TEST2\n%x EAT\n%%\n'+
        '"enter-test" {this.begin(\'TEST\');}\n'+
        '<TEST,EAT>"x" {return \'T\';}\n'+
        '<*>"z" {return \'Z\';}\n'+
        '<TEST>"y" {this.begin(\'INITIAL\'); return \'TY\';}';
    const expected = {
      startConditions: {
        "TEST": 0,
        "TEST2": 0,
        "EAT": 1,
      },
      rules: [
        ["enter-test\\b", "this.begin('TEST');" ],
        [["TEST","EAT"], "x\\b", "return 'T';" ],
        [["*"], "z\\b", "return 'Z';" ],
        [["TEST"], "y\\b", "this.begin('INITIAL'); return 'TY';" ]
      ]
    };

    expect(lex.parse(lexgrammar)).toEqual(expected);
  });

  it("test no brace action", () => {
    const lexgrammar = '%%\n"["[^\\]]"]" return true;\n"x" return 1;';
    const expected = {
      rules: [
        ["\\[[^\\]]\\]", "return true;"],
        ["x\\b", "return 1;"]
      ]
    };

    expect(lex.parse(lexgrammar)).toEqual(expected);
  });

  it("test quote escape", () => {
    const lexgrammar = '%%\n\\"\\\'"x" return 1;';
    const expected = {
      rules: [
        ["\"'x\\b", "return 1;"]
      ]
    };

    expect(lex.parse(lexgrammar)).toEqual(expected);
  });

  /*
%%
\"\'\\\*\i return 1;
"a"\b return 2;
\cA {}
\012 {}
\xFF {}

{"l":{"l":{"l":{"l":{"literal":"\""},"r":{"literal":"'"}},"r":{"escapedChar":"\\"}},"r":{"escapedChar":"*"}},"r":{"literal":"i"}}
   */
  it("test escape things", () => {
    const lexgrammar = '%%\n\\"\\\'\\\\\\*\\i return 1;\n"a"\\b return 2;\n\\cA {}\n\\012 {}\n\\xFF {}';
    const expected = {
      rules: [
        ["\"'\\\\\\*i\\b", "return 1;"], // "'\\\*i\b
        ["a\\b", "return 2;"],           // a\b
        ["\\x01", ""],                   // \x01 -- not \cA
        ["\\n", ""],                     // \n -- not \x10
        ["\\xff", ""]                    // \xff
      ]
    };

    expect(lex.parse(lexgrammar)).toEqual(expected);
  });

  xit("test unicode encoding", () => { // need a start state for inside ""s
    const lexgrammar = '%%\n"\\u03c0" return 1;';
    const expected = {
      rules: [
        ["\\u03c0", "return 1;"]
      ]
    };

    expect(lex.parse(lexgrammar)).toEqual(expected);
  });

  it("test unicode", () => {
    const lexgrammar = '%%\n"π" return 1;'; // GREEK SMALL LETTER PI
    const expected = {
      rules: [
        ["\\u03c0", "return 1;"] // \uxxxx representation of pi
      ]
    };

    expect(lex.parse(lexgrammar)).toEqual(expected);
  });

  /*
%%
\'([^\\']+|\\(\n|.))*?\' return 1;
   */
  it("test bugs", () => {
    const lexgrammar = '%%\n\\\'([^\\\\\']+|\\\\(\\n|.))*?\\\' return 1;';
    const expected = {
      rules: [
        // '([^\\']+|\\(\n|.))*?'
        ["'([^\\\\']+|\\\\(\\n|.))*?'", "return 1;"]
      ]
    };

    expect(lex.parse(lexgrammar)).toEqual(expected);
  });

  it("test special groupings", () => {
    const lexgrammar = '%%\n(?:"foo"|"bar")\\(\\) return 1;';
    const expected = {
      rules: [
        ["(?:foo|bar)\\(\\)", "return 1;"]
      ]
    };

    expect(lex.parse(lexgrammar)).toEqual(expected);
  });

  it("test trailing code include", () => {
    const lexgrammar = '%%"foo"  {return bar;}\n%% const bar = 1;';
    const expected = {
      rules: [
        ['foo\\b', "return bar;"]
      ],
      moduleInclude: " const bar = 1;"
    };

    expect(lex.parse(lexgrammar)).toEqual(expected);
  });

  it("test empty or regex", () => {
    const lexgrammar = '%%\n(|"bar")("foo"|)(|) return 1;';
    const expected = {
      rules: [
        ["(|bar)(foo|)(|)", "return 1;"]
      ]
    };

    expect(lex.parse(lexgrammar)).toEqual(expected);
  });

  it("test options", () => {
    const lexgrammar = '%options flex\n%%\n"foo" return 1;';
    const expected = {
      rules: [
        ["foo", "return 1;"]
      ],
      options: {flex: true}
    };

    expect(lex.parse(lexgrammar)).toEqual(expected);
  });

  it("test unquoted string rules", () => {
    const lexgrammar = "%%\nfoo* return 1";
    const expected = {
      rules: [
        ["foo*", "return 1"]
      ]
    };

    expect(lex.parse(lexgrammar)).toEqual(expected);
  });

  it("test [^\\\\]", () => {
    const lexgrammar = '%%\n"["[^\\\\]"]" {return true;}\n\'f"oo\\\'bar\'  {return \'baz2\';}\n"fo\\"obar"  {return \'baz\';}\n';
    const expected = {
      rules: [
        ["\\[[^\\\\]\\]", "return true;"],
        ["f\"oo'bar\\b", "return 'baz2';"],
        ['fo"obar\\b', "return 'baz';"]
      ]
    };

    expect(lex.parse(lexgrammar)).toEqual(expected);
  });

  it("test comments", () => {
    const lexgrammar = "/* */ // foo\n%%\nfoo* return 1";
    const expected = {
      rules: [
        ["foo*", "return 1"]
      ]
    };

    expect(lex.parse(lexgrammar)).toEqual(expected);
  });

  it("test rules with trailing escapes", () => {
    const lexgrammar = '%%\n\\#[^\\n]*\\n {/* ok */}\n';
    const expected = {
      rules: [
        ["#[^\\n]*\\n", "/* ok */"],
      ]
    };

    expect(lex.parse(lexgrammar)).toEqual(expected);
  });

  it("test no brace action with surplus whitespace between rules", () => {
    const lexgrammar = '%%\n"a" return true;\n  \n"b" return 1;\n   \n';
    const expected = {
      rules: [
        ["a\\b", "return true;"],
        ["b\\b", "return 1;"]
      ]
    };

    expect(lex.parse(lexgrammar)).toEqual(expected);
  });

  it("test windows line endings", () => {
    const lexgrammar = '%%\r\n"["[^\\]]"]" %{\r\nreturn true;\r\n%}\r\n';
    const expected = {
      rules: [
        ["\\[[^\\]]\\]", "\r\nreturn true;\r\n"]
      ]
    };

    expect(lex.parse(lexgrammar)).toEqual(expected);
  });

  it("test braced action with surplus whitespace between rules", () => {
    const lexgrammar = '%%\n"a" %{  \nreturn true;\n%}  \n  \n"b" %{    return 1;\n%}  \n   \n';
    const expected = {
      rules: [
        ["a\\b", "  \nreturn true;\n"],
        ["b\\b", "    return 1;\n"]
      ]
    };

    expect(lex.parse(lexgrammar)).toEqual(expected);
  });
});
