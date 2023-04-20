const assert = require("assert"),
    lex    = new (require("../lib/lex-parser").LexParser),
    fs     = require('fs'),
    path   = require('path');

function read (p, file) {
    return fs.readFileSync(path.join(__dirname, "../tests", p, file), "utf8");
}

const {RegexpAtom} = require('../lib/RegexpAtom');
const {RegexpAtomToJs} = require('../lib/RegexpAtomToStringVisitor');

function stringifyRules (ret) {
  if ('macros' in ret)
    for (const label in ret.macros)
      ret.macros[label] = RegexpAtomToJs.serialize(ret.macros[label], !(ret.options && ret.options.flex) , 'preserve', true);
  if ('rules' in ret)
    ret.rules = ret.rules.map(
      rule => ({
        start: rule.start,
        pattern: rule.pattern ? RegexpAtomToJs.serialize(rule.pattern, 'preserve', true) : undefined,
        action: rule.action,
      })
    );
  return ret;
}

describe("lex-parser", () => {

  it("test lex grammar with macros", () => {
    const lexgrammar = `
D [0-9]
ID [a-zA-Z][a-zA-Z0-9]+
%%

{D}"ohhai" {print(9);}
"{" return '{';
`;
    const expected = {
      macros: {"D": "[0-9]", "ID": "[a-zA-Z][a-zA-Z0-9]+"},
      rules: [
        {pattern: "{D}ohhai\\b", action: "print(9);"},
        {pattern: "\\{", action: "return '{';"}
      ]
    };

    expect(stringifyRules(lex.parse(lexgrammar))).toEqual(expected);
  });

  it("test escaped chars", () => {
    const lexgrammar = `
%%
"\\n"+ {return 'NL';}
\\n+ {return 'NL2';}
\\s+ {/* skip */}`;
    const expected = {
      rules: [
        {pattern: "\\\\n+", action: "return 'NL';"},
        {pattern: "\\n+", action: "return 'NL2';"},
        {pattern: "\\s+", action: "/* skip */"}
      ]
    };

    expect(stringifyRules(lex.parse(lexgrammar))).toEqual(expected);
  });

  it("test advanced", () => {
    const lexgrammar = `
%%
$ {return 'EOF';}
. {/* skip */}
"stuff"*/("{"|";") {/* ok */}
(.+)[a-z]{1,2}"hi"*? {/* skip */}

`;
    const expected = {
      rules: [
        {pattern: "$", action: "return 'EOF';"},
        {pattern: ".", action: "/* skip */"},
        {pattern: "stuff*(?=(\\{|;))", action: "/* ok */"},
        {pattern: "(.+)[a-z]{1,2}hi*?", action: "/* skip */"}
      ]
    };

    expect(stringifyRules(lex.parse(lexgrammar))).toEqual(expected);
  });

  it("test [^\\]]", () => {
    const lexgrammar = `
%%
"["[^\\]]"]" {return true;}
'f"oo\\'bar'  {return 'baz2';}
"fo\\"obar"  {return 'baz';}
`;
    const expected = {
      rules: [
        {pattern: "\\[[^\\]]\\]", action: "return true;"},
        {pattern: "f\"oo'bar\\b", action: "return 'baz2';"},
        {pattern: 'fo"obar\\b', action: "return 'baz';"}
      ]
    };

    expect(stringifyRules(lex.parse(lexgrammar))).toEqual(expected);
  });

  it("test multiline action", () => {
    const lexgrammar = `
%%
"["[^\\]]"]" %{
return true;
%}
`;
    const expected = {
      rules: [
        {pattern: "\\[[^\\]]\\]", action: "\nreturn true;\n"}
      ]
    };

    expect(stringifyRules(lex.parse(lexgrammar))).toEqual(expected);
  });

  it("test multiline action with single braces", () => {
    const lexgrammar = `
%%
"["[^\\]]"]" {
const b={};return true;
}
`;
    const expected = {
      rules: [
        {pattern: "\\[[^\\]]\\]", action: "\nconst b={};return true;\n"}
      ]
    };

    expect(stringifyRules(lex.parse(lexgrammar))).toEqual(expected);
  });

  it("test multiline action with brace in a multi-line-comment", () => {
    const lexgrammar = `
%%
"["[^\\]]"]" {
const b={}; /* { */ return true;
}
`;
    const expected = {
      rules: [
        {pattern: "\\[[^\\]]\\]", action: "\nconst b={}; /* { */ return true;\n"}
      ]
    };

    expect(stringifyRules(lex.parse(lexgrammar))).toEqual(expected);
  });

  it("test multiline action with brace in a single-line-comment", () => {
    const lexgrammar = `
%%
"["[^\\]]"]" {
const b={}; // { 
return 2 / 3;
}
`;
    const expected = {
      rules: [
        {pattern: "\\[[^\\]]\\]", action: "\nconst b={}; // { \nreturn 2 / 3;\n"}
      ]
    };

    expect(stringifyRules(lex.parse(lexgrammar))).toEqual(expected);
  });

  it("test multiline action with braces in strings", () => {
    const lexgrammar = `
%%
"["[^\\]]"]" {
const b='{' + "{"; // { 
return 2 / 3;
}
`;
    const expected = {
      rules: [
        {pattern: "\\[[^\\]]\\]", action: "\nconst b='{' + \"{\"; // { \nreturn 2 / 3;\n"}
      ]
    };

    expect(stringifyRules(lex.parse(lexgrammar))).toEqual(expected);
  });

  it("test multiline action with braces in regexp", () => {
    const lexgrammar = `
%%
"["[^\\]]"]" {
const b=/{/; // { 
return 2 / 3;
}
`;
    const expected = {
      rules: [
        {pattern: "\\[[^\\]]\\]", action: "\nconst b=/{/; // { \nreturn 2 / 3;\n"}
      ]
    };

    expect(stringifyRules(lex.parse(lexgrammar))).toEqual(expected);
  });

  it("test include", () => {
    const lexgrammar = `
RULE [0-9]

%{
 hi <stuff> 
%}
%%
"["[^\\]]"]" %{
return true;
%}
`;
    const expected = {
      macros: {"RULE": "[0-9]"},
      actionInclude: "\n hi <stuff> \n",
      rules: [
        {pattern: "\\[[^\\]]\\]", action: "\nreturn true;\n"}
      ]
    };

    expect(stringifyRules(lex.parse(lexgrammar))).toEqual(expected);
  });

  it("test bnf lex grammar", () => {
    const lexgrammar = lex.parse(read('lex', 'bnf.jisonlex'));
    const expected = JSON.parse(read('lex', 'bnf.lex.json'));

    expect(stringifyRules(lexgrammar)).toEqual(expected);
  });

  it("test lex grammar bootstrap", () => {
    const lexgrammar = lex.parse(read('lex', 'lex_grammar.jisonlex'));
    const expected = JSON.parse(read('lex', 'lex_grammar.lex.json'));

    expect(stringifyRules(lexgrammar)).toEqual(expected);
  });

  it("test ANSI C lexical grammar", () => {
    const lexgrammar = lex.parse(read('lex','ansic.jisonlex'));

    assert.ok(lexgrammar);
  });

  it("test advanced", () => {
    const lexgrammar = `
%%
"stuff"*/!("{"|";") {/* ok */}
`;
    const expected = {
      rules: [
        {pattern: "stuff*(?!(\\{|;))", action: "/* ok */"},
      ]
    };

    expect(stringifyRules(lex.parse(lexgrammar))).toEqual(expected);
  });

  it("test start conditions", () => {
    const lexgrammar = `
%s TEST TEST2
%x EAT
%%
"enter-test" {this.begin('TEST');}
<TEST,EAT>"x" {return 'T';}
<*>"z" {return 'Z';}
<TEST>"y" {this.begin('INITIAL'); return 'TY';}
`;
    const expected = {
      startConditions: {
        "TEST": 0,
        "TEST2": 0,
        "EAT": 1,
      },
      rules: [
        {pattern: "enter-test\\b", action: "this.begin('TEST');"},
        {start: ["TEST","EAT"], pattern: "x\\b", action: "return 'T';" },
        {start: ["*"], pattern: "z\\b", action: "return 'Z';" },
        {start: ["TEST"], pattern: "y\\b", action: "this.begin('INITIAL'); return 'TY';" }
      ]
    };

    expect(stringifyRules(lex.parse(lexgrammar))).toEqual(expected);
  });

  it("test no brace action", () => {
    const lexgrammar = `
%%
"["[^\\]]"]" return true;
"x" return 1;
`;
    const expected = {
      rules: [
        {pattern: "\\[[^\\]]\\]", action: "return true;"},
        {pattern: "x\\b", action: "return 1;"}
      ]
    };

    expect(stringifyRules(lex.parse(lexgrammar))).toEqual(expected);
  });

  it("test quote escape", () => {
    const lexgrammar = `
%%
\\"\\'"x" return 1;
`;
    const expected = {
      rules: [
        {pattern: "\"'x\\b", action: "return 1;"}
      ]
    };

    expect(stringifyRules(lex.parse(lexgrammar))).toEqual(expected);
  });

  it("test escape things", () => {
    const lexgrammar = `
%%
\\"\\'\\\\\\*\\i return 1;
"a"\\b return 2;
\\cA {}
\\012 {}
\\xFF {}
`;
    const expected = {
      rules: [
        {pattern: "\"'\\\\\\*i\\b", action: "return 1;"}, // "'\\\*i\b
        {pattern: "a\\b", action: "return 2;"},           // a\b
        {pattern: "\\x01", action: ""},                   // \x01 -- not \cA
        {pattern: "\\n", action: ""},                     // \n -- not \x10
        {pattern: "\\xff", action: ""}                    // \xff
      ]
    };

    expect(stringifyRules(lex.parse(lexgrammar))).toEqual(expected);
  });

  xit("test unicode encoding", () => { // need a start state for inside ""s
    const lexgrammar = `
%%
"\\u03c0" return 1;`;
    const expected = {
      rules: [
        {pattern: "\\u03c0", action: "return 1;"}
      ]
    };

    expect(stringifyRules(lex.parse(lexgrammar))).toEqual(expected);
  });

  it("test unicode", () => {
    const lexgrammar = `
%%
"π" return 1;`; // GREEK SMALL LETTER PI
    const expected = {
      rules: [
        {pattern: "\\u03c0", action: "return 1;"} // \uxxxx representation of pi
      ]
    };

    expect(stringifyRules(lex.parse(lexgrammar))).toEqual(expected);
  });

  it("test bugs", () => {
    const lexgrammar = `
%%
\\\'([^\\\\\']+|\\\\(\\n|.))*?\\\' return 1;`;
    const expected = {
      rules: [
        {pattern: "'([^\\\\']+|\\\\(\\n|.))*?'", action: "return 1;"}
      ]
    };

    expect(stringifyRules(lex.parse(lexgrammar))).toEqual(expected);
  });

  it("test special groupings", () => {
    const lexgrammar = `
%%
(?:"foo"|"bar")\\(\\) return 1;`;
    const expected = {
      rules: [
        {pattern: "(?:foo|bar)\\(\\)", action: "return 1;"}
      ]
    };

    expect(stringifyRules(lex.parse(lexgrammar))).toEqual(expected);
  });

  it("test trailing code include", () => {
    const lexgrammar = `
%%"foo"  {return bar;}
%% const bar = 1;`;
    const expected = {
      rules: [
        {pattern: 'foo\\b', action: "return bar;"}
      ],
      moduleInclude: " const bar = 1;"
    };

    expect(stringifyRules(lex.parse(lexgrammar))).toEqual(expected);
  });

  it("test empty or regex", () => {
    const lexgrammar = `
%%
(|"bar")("foo"|)(|) return 1;`;
    const expected = {
      rules: [
        {pattern: "(|bar)(foo|)(|)", action: "return 1;"}
      ]
    };

    expect(stringifyRules(lex.parse(lexgrammar))).toEqual(expected);
  });

  it("test options", () => {
    const lexgrammar = `
%options flex
%%
"foo" return 1;`;
    const expected = {
      rules: [
        {pattern: "foo", action: "return 1;"}
      ],
      options: {flex: true}
    };

    expect(stringifyRules(lex.parse(lexgrammar))).toEqual(expected);
  });

  it("test unquoted string rules", () => {
    const lexgrammar = `
%%
foo* return 1`;
    const expected = {
      rules: [
        {pattern: "foo*", action: "return 1"}
      ]
    };

    expect(stringifyRules(lex.parse(lexgrammar))).toEqual(expected);
  });

  it("test [^\\\\]", () => {
    const lexgrammar = `
%%
"["[^\\\\]"]" {return true;}
\'f"oo\\\'bar\'  {return \'baz2\';}
"fo\\"obar"  {return \'baz\';}
`;
    const expected = {
      rules: [
        {pattern: "\\[[^\\\\]\\]", action: "return true;"},
        {pattern: "f\"oo'bar\\b", action: "return 'baz2';"},
        {pattern: 'fo"obar\\b', action: "return 'baz';"}
      ]
    };

    expect(stringifyRules(lex.parse(lexgrammar))).toEqual(expected);
  });

  it("test comments", () => {
    const lexgrammar = `
/* */ // foo
%%
foo* return 1`;
    const expected = {
      rules: [
        {pattern: "foo*", action: "return 1"}
      ]
    };

    expect(stringifyRules(lex.parse(lexgrammar))).toEqual(expected);
  });

  it("test rules with trailing escapes", () => {
    const lexgrammar = `
%%
\\#[^\\n]*\\n {/* ok */}
`;
    const expected = {
      rules: [
        {pattern: "#[^\\n]*\\n", action: "/* ok */"},
      ]
    };

    expect(stringifyRules(lex.parse(lexgrammar))).toEqual(expected);
  });

  it("test no brace action with surplus whitespace between rules", () => {
    const lexgrammar = `
%%
"a" return true;
  
"b" return 1;
   
`;
    const expected = {
      rules: [
        {pattern: "a\\b", action: "return true;"},
        {pattern: "b\\b", action: "return 1;"}
      ]
    };

    expect(stringifyRules(lex.parse(lexgrammar))).toEqual(expected);
  });

  it("test windows line endings", () => {
    const lexgrammar = '%%\r\n"["[^\\]]"]" %{\r\nreturn true;\r\n%}\r\n';
    const expected = {
      rules: [
        {pattern: "\\[[^\\]]\\]", action: "\r\nreturn true;\r\n"}
      ]
    };

    expect(stringifyRules(lex.parse(lexgrammar))).toEqual(expected);
  });

  it("test braced action with surplus whitespace between rules", () => {
    const lexgrammar = `
%%
"a" %{  
return true;
%}  
  
"b" %{    return 1;
%}  
   
`;
    const expected = {
      rules: [
        {pattern: "a\\b", action: "  \nreturn true;\n"},
        {pattern: "b\\b", action: "    return 1;\n"}
      ]
    };

    expect(stringifyRules(lex.parse(lexgrammar))).toEqual(expected);
  });
});
