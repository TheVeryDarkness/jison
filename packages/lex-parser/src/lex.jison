%lex


NAME              [a-zA-Z_][a-zA-Z0-9_-]*
BR                \r\n|\n|\r
OCTAL             [0-7]{1,3}
STR_ESCAPE        [rfntv]
REGEXP_ASSERTIONS [sSbBwWdD]
OPERATORS         [\\*+()${}|[\]\/.^?]
HEX               [0-9A-F]{2}
UNICODE           [0-9a-fA-F]{4}
CONTROL_CHARS     [A-Z]

%s indented trail rules
%x code start_condition options conditions action

%%

<action>"/*"(.|\n|\r)*?"*/"           return 'ACTION_BODY';
<action>"//".*                        return 'ACTION_BODY';
<action>"/"[^ /]*?['"{}'][^ ]*?"/"    return 'ACTION_BODY'; // regexp with braces or quotes (and no spaces)
<action>\"("\\\\"|'\"'|[^"])*\"       return 'ACTION_BODY';
<action>"'"("\\\\"|"\'"|[^'])*"'"     return 'ACTION_BODY';
<action>[/"'][^{}/"']+                return 'ACTION_BODY';
<action>[^{}/"']+                     return 'ACTION_BODY';
<action>"{"                           yy.depth++; return '{'
<action>"}"                           yy.depth == 0 ? this.begin('trail') : yy.depth--; return '}'

<conditions>{NAME}                    return 'NAME';
<conditions>">"                       this.popState(); return '>';
<conditions>","                       return ',';
<conditions>"*"                       return '*';

<rules>{BR}+                          /* */
<rules>\s+{BR}+                       /* */
<rules>\s+                            this.begin('indented')
<rules>"%%"                           this.begin('code'); return '%%'
<rules>[a-zA-Z0-9_]+                  return 'CHARACTER_LIT'

<options>{NAME}                       yy.options[yytext] = true
<options>{BR}+                        this.begin('INITIAL')
<options>\s+{BR}+                     this.begin('INITIAL')
<options>\s+                          /* empty */

<start_condition>{NAME}               return 'START_COND'
<start_condition>{BR}+                this.begin('INITIAL')
<start_condition>\s+{BR}+             this.begin('INITIAL')
<start_condition>\s+                  /* empty */

<trail>.*{BR}+                        this.begin('rules')

<indented>"{"                         yy.depth = 0; this.begin('action'); return '{'
<indented>"%{"(.|{BR})*?"%}"          this.begin('trail'); yytext = yytext.substr(2, yytext.length-4);return 'ACTION'
"%{"(.|{BR})*?"%}"                    yytext = yytext.substr(2, yytext.length-4); return 'ACTION'
<indented>.+                          this.begin('rules'); return 'ACTION'

"/*"(.|\n|\r)*?"*/"             /* ignore */
"//".*                          /* ignore */

{BR}+                           /* */
\s+                             /* */
{NAME}                          return 'NAME';
\"("\\\\"|'\"'|[^"])*\"         yytext = yytext.replace(/\\"/g,'"'); return 'STRING_LIT';
"'"("\\\\"|"\'"|[^'])*"'"       yytext = yytext.replace(/\\'/g,"'"); return 'STRING_LIT';
"|"                             return '|';
"["("\\\\"|"\]"|[^\]])*"]"      return 'ANY_GROUP_REGEX';
"(?:"                           return 'SPECIAL_GROUP';
"(?="                           return 'SPECIAL_GROUP';
"(?!"                           return 'SPECIAL_GROUP';
"("                             return '(';
")"                             return ')';
"+"                             return '+';
"*"                             return '*';
"?"                             return '?';
"^"                             return '^';
","                             return ',';
"<<EOF>>"                       return '$';
"<"                             this.begin('conditions'); return '<';
"/!"                            return '/!';
"/"                             return '/';
"\\x"{HEX}                      yytext = String.fromCharCode(parseInt(yytext.substring(2), 16)); return 'CHARACTER_LIT';
"\\u"{UNICODE}                  yytext = String.fromCharCode(parseInt(yytext.substring(2), 16)); return 'CHARACTER_LIT';
"\\c"{CONTROL_CHARS}            yytext = String.fromCodePoint(yytext.charCodeAt(2) - 64);        return 'CHARACTER_LIT';
"\\"{STR_ESCAPE}                yytext = decodeStringEscape(yytext.substring(1));                return 'CHARACTER_LIT';
"\\"{OCTAL}                     yytext = String.fromCharCode(parseInt(yytext.substring(1),  8)); return 'CHARACTER_LIT';
"\\"{REGEXP_ASSERTIONS}         return 'ASSERTION';
"\\"{OPERATORS}                 return 'OPERATOR';
"\\".                           yytext = yytext.replace(/^\\/g,''); return 'CHARACTER_LIT'; // escaped special chars like '"'s
"$"                             return '$';
"."                             return '.';
"%options"                      yy.options = {}; this.begin('options');
"%s"                            this.begin('start_condition'); return 'START_INC';
"%x"                            this.begin('start_condition'); return 'START_EXC';
"%%"                            this.begin('rules'); return '%%';
"{"\d+(","\s?\d+|",")?"}"       return 'RANGE_REGEX';
"{"{NAME}"}"                    return 'NAME_BRACE';
"{"                             return '{';
"}"                             return '}';
.                               /* ignore bad characters */
<*><<EOF>>                      return 'EOF';

<code>(.|{BR})+                 return 'CODE';

%%

function decodeStringEscape (c: string): string {
  switch (c) {
  case "\\": return "\\";
  case "r": return "\r";
  case "f": return "\f";
  case "n": return "\n";
  case "t": return "\t";
  case "v": return "\v";
  default: throw Error(`decodeStringEscape(${c}) - unknown character`);
  }
}

/lex

%start lex

/* Jison lexer file format grammar */

%nonassoc '/' '/!'

%left '*' '+' '?' RANGE_REGEX

%{
    import {Choice, Concat, Empty, CaptureGroup, SpecialGroup, Cardinality, LookAhead, LookBehind, Wildcard, Begin, End, Literal, Assertion, Operator, Reference, CharacterClass} from './RegexpAtom';
    let ebnf = false;
%}

%%

lex
    : definitions '%%' rules epilogue
        { 
          $$ = { rules: $rules };
          if ($definitions[0]) $$.macros = $definitions[0];
          if ($definitions[1]) $$.startConditions = $definitions[1];
          if ($epilogue) $$.moduleInclude = $epilogue;
          if (yy.options) $$.options = yy.options;
          if (yy.actionInclude) $$.actionInclude = yy.actionInclude;
          delete yy.options;
          delete yy.actionInclude;
          return $$; 
        }
    ;

epilogue
    : EOF
      { $$ = null; }
    | '%%' EOF
      { $$ = null; }
    | '%%' CODE EOF
      { $$ = $2; }
    ;

definitions
    : definition definitions
        {
          $$ = $definitions;
          if ('length' in $definition) {
            $$[0] = $$[0] || {};
            $$[0][$definition[0]] = $definition[1];
          } else {
            $$[1] = $$[1] || {};
            for (var name in $definition) {
              $$[1][name] = $definition[name];
            }
          }
        }
    | ACTION definitions
        { yy.actionInclude += $1; $$ = $definitions; }
    |
        { yy.actionInclude = ''; $$ = [null,null]; }
    ;

definition
    : NAME regex
        { $$ = [$1, $2]; }
    | START_INC names_inclusive
        { $$ = $2; }
    | START_EXC names_exclusive
        { $$ = $2; }
    ;

names_inclusive
    : START_COND
        { $$ = {}; $$[$1] = 0; }
    | names_inclusive START_COND
        { $$ = $1; $$[$2] = 0; }
    ;

names_exclusive
    : START_COND
        { $$ = {}; $$[$1] = 1; }
    | names_exclusive START_COND
        { $$ = $1; $$[$2] = 1; }
    ;

rules
    : rules rule
        { $$ = $1; $$.push($2); }
    | rule
        { $$ = [$1]; }
    ;

rule
    : start_conditions regex action
        { $$ = $1 ? {start: $1, pattern: $2, action: $3} : {pattern: $2, action: $3}; }
    ;

action
    : '{' action_body '}'
        {$$ = $2;}
    | ACTION
        {$$ = $1;}
    ;

action_body
    :
        {$$ = '';}
    | action_comments_body
        {$$ = $1;}
    | action_body '{' action_body '}' action_comments_body
        {$$ = $1+$2+$3+$4+$5;}
    | action_body '{' action_body '}'
        {$$ = $1 + $2 + $3 + $4;}
    ;

action_comments_body
    : ACTION_BODY
        { $$ = yytext; }
    | action_comments_body ACTION_BODY
        { $$ = $1+$2; }
    ;


start_conditions
    : '<' name_list '>'
        { $$ = $2; }
    | '<' '*' '>'
        { $$ = ['*']; }
    |
    ;

name_list
    : NAME
        { $$ = [$1]; }
    | name_list ',' NAME
        { $$ = $1; $$.push($3); }
    ;

regex
    : regex_list
        {
          $$ = $1;
          if (!(yy.options && yy.options.flex)) {
            let trailingLiteral = $1;
            // Find the right-most concatenation
            while (trailingLiteral instanceof Concat)
              trailingLiteral = trailingLiteral.r;
            if (// this regexp ends with a literal
                trailingLiteral instanceof Literal &&
                // which ends with ID
                trailingLiteral.literal.match(/[\w\d]$/) &&
                // and is not part of escape
                !trailingLiteral.literal.match(/\\(r|f|n|t|v|s|b|c[A-Z]|x[0-9a-fA-F]{2}|u[a-fA-F0-9]{4}|[0-7]{1,3})$/)
                ) {
                // then add a word boundry assertion
                $$ = new Concat($1, new Assertion('b'));
            }
          }
        }
    ;

regex_list
    : regex_list '|' regex_concat
        { $$ = new Choice($1, $3); }
    | regex_list '|'
        { $$ = new Choice($1, new Empty()); }
    | regex_concat
    |
        { $$ = new Empty(); }
    ;

regex_concat
    : regex_concat regex_base
        { $$ = new Concat($1, $2); }
    | regex_base
    ;

regex_base
    : '(' regex_list ')'
        { $$ = new CaptureGroup($2); }
    | SPECIAL_GROUP regex_list ')'
        { $$ = new SpecialGroup($1.substring(1), $2); }
    | regex_base '+'
        { $$ = new Cardinality($1, '+'); }
    | regex_base '*'
        { $$ = new Cardinality($1, '*'); }
    | regex_base '?'
        { $$ = new Cardinality($1, '?'); }
    | '/' regex_base
        { $$ = new LookAhead($2); }
    | '/!' regex_base
        { $$ = new LookBehind($2); }
    | name_expansion
    | regex_base range_regex
        { $$ = new Cardinality($1, $2); }
    | any_group_regex
    | '.'
        { $$ = new Wildcard(); }
    | '^'
        { $$ = new Begin(); }
    | '$'
        { $$ = new End(); }
    | string
    | escape_char
    ;

name_expansion
    : NAME_BRACE
        { $$ = new Reference(yytext.substring(1, yytext.length - 1)); }
    ;

any_group_regex
    : ANY_GROUP_REGEX
        { $$ = new CharacterClass(prepareCharacterClass(yytext.substring(1, yytext.length - 1))); }
    ;
     
escape_char
    : ASSERTION
        { $$ = new Assertion(yytext.substring(1)); }
    | OPERATOR
        { $$ = new Operator(yytext.substring(1)); }
    ;

range_regex
    : RANGE_REGEX
        { $$ = yytext; }
    ;

string
    : STRING_LIT
        { $$ = new Literal(prepareString(yytext.substr(1, yytext.length - 2))); }
    | CHARACTER_LIT { $$ = new Literal(yytext); }
    ;

%%

function prepareString (s: string) {
    s = s.replace(/\\\\/g, '\\');
    return s;
}

function prepareCharacterClass (s: string) {
    s = s.replace(/\\r/g, "\r");
    s = s.replace(/\\f/g, "\f");
    s = s.replace(/\\n/g, "\n");
    s = s.replace(/\\t/g, "\t");
    s = s.replace(/\\v/g, "\v");
    return s;
}
