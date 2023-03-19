ts-jison
=====

This is a fork of Zach Carter <zach@carter.name>'s [jison module](https://www.npmjs.com/package/jison) tweaked to use just enough templates to make typescript compilers tollerate the generated parser.

Status:
=====

This works (I'm using it in a few javascript and typescritp projects) and runs the original tests. If you want to geek about this, ping ericP on discord or ericprud on gitter.

Components:
=====
* [@ts-jison/parser-generator](http://github.com/ericprud/ts-jison/tree/main/packages/parser-generator) - A lightly-typescriptified version of jison
* [@ts-jison/lexer-generator](http://github.com/ericprud/ts-jison/tree/main/packages/lexer-generator) - A lightly-typescriptified version of jison-lex
* [@ts-jison/parser](http://github.com/ericprud/ts-jison/tree/main/packages/parser) - runtime library for parsers
* [@ts-jison/lexer](http://github.com/ericprud/ts-jison/tree/main/packages/lexer) - runtime library for lexers
* [@ts-jison/common](http://github.com/ericprud/ts-jison/tree/main/packages/common) - functions needed by parser and lexer

## Example grammar:
This example parses and executes mathematical expressions:
``` antlr
%{
function hexlify (str:string): string { // elide TS types for js-compatibility
  return str.split('').map(ch => '0x' + ch.charCodeAt(0).toString(16)).join(', ')
}
%}

%lex
%no-break-if          (.*[^a-z] | '') 'return' ([^a-z].* | '') // elide trailing 'break;'

%%

\s+                   if (yy.trace) yy.trace(`skipping whitespace ${hexlify(yytext)}`)
[0-9]+("."[0-9]+)?\b  return 'NUMBER'
"-"                   return '-'
"+"                   return '+'
"("                   return '('
")"                   return ')'
<<EOF>>               return 'EOF'
.                     return 'INVALID'

/lex

%left '+' '-'
%left UMINUS
%start expr

%%

expr: e EOF                 { if (yy.trace)
                                yy.trace('returning', $1);
                              return $1; } ; // return e

e   : e '+' e               {$$ = $1+$3;}
    | e '-' e               {$$ = $1-$3;}
    | '-' e %prec UMINUS    {$$ = -$2;}
    | '(' e ')'             {$$ = $2;}
    | NUMBER                {$$ = Number(yytext);} ;
```
See [packages/parser-generator/examples/](packages/parser-generator/examples/) for examples and [scripts](packages/parser-generator/package.json) for invocation.


## Example compilation:
Convert the .jison file to a TS file:
``` shell
ts-jison -t typescript -n TsCalc -n TsCalc -o ts-calculator.ts ts-calculator.jison
```

Convert the .jison file to a JS file:
``` shell
ts-jison -n TsCalc -n TsCalc -o js-calculator.js js-calculator.jison
```

## Example invocation:
``` typescript
const ParserAndLexer = require('./ts-calculator');

  const txt = ``;
  const res = new ParserAndLexer.TsCalcParser().parse(txt);
  console.log(txt.trim(), '=', res);
```
or for JS:
``` typescript
const ParserAndLexer = require('./js-calculator');
```

## Docs
See [parser-generator docs](http://github.com/ericprud/ts-jison/tree/main/packages/parser-generator) for more details.


How to contribute
-----------------

See [CONTRIBUTING.md](https://github.com/zaach/jison/blob/main/CONTRIBUTING.md) for contribution guidelines, how to run the tests, etc.

Projects using Jison
------------------

View them on the [wiki](https://github.com/zaach/jison/wiki/ProjectsUsingJison), or add your own.


Contributors
------------
[Githubbers](http://github.com/zaach/jison/contributors)

Special thanks to Jarred Ligatti, Manuel E. Bermúdez 

Please see the [license](LICENSE) in this directory.

  [1]: http://dinosaur.compilertools.net/bison/bison_4.html

