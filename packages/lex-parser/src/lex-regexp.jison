%lex

%no-break-if       (.*[^a-z] | '') 'return' ([^a-z].* | '') // elide trailing 'break;'

BRACED            "{"[a-zA-Z_][a-zA-Z0-9_-]*"}"
HEX               \\"x"[0-9A-F]{2}
UNICODE           \\"u"[0-9a-fA-F]{4}
CONTROL_CHARS     \\"c"[A-Z]
STR_ESCAPE        \\[rfntv]
OCTAL             \\[0-7]{1,3}
REGEXP_ASSERTIONS \\[sSbBwWdD]
OPERATORS         \\[\\*+()${}|[\]\/.^?]
BARE              [^\\*+()${}|[\]\/.^?]+

%s indented trail rules
%x code start_condition options conditions action

%%

{STR_ESCAPE}                    yytext = decodeStringEscape(yytext.substring(1));                return 'CHARACTER_LIT';
"/*"(.|\n|\r)*?"*/"             /* ignore */
"//".*                          /* ignore */

{BARE}                          return 'STRING_LIT';
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
{HEX}                           yytext = String.fromCharCode(parseInt(yytext.substring(2), 16)); return 'CHARACTER_LIT';
{UNICODE}                       yytext = String.fromCharCode(parseInt(yytext.substring(2), 16)); return 'CHARACTER_LIT';
{CONTROL_CHARS}                 yytext = String.fromCodePoint(yytext.charCodeAt(2) - 64);        return 'CHARACTER_LIT';
{OCTAL}                         yytext = String.fromCharCode(parseInt(yytext.substring(1),  8)); return 'CHARACTER_LIT';
{REGEXP_ASSERTIONS}             return 'ASSERTION';
{OPERATORS}                     return 'OPERATOR';
"\\".                           yytext = yytext.replace(/^\\/g,''); return 'CHARACTER_LIT'; // escaped special chars like '"'s
"$"                             return '$';
"."                             return '.';
"%options"                      yy.options = {}; this.begin('options');
"{"\d+(","\s?\d+|",")?"}"       return 'RANGE_REGEX';
{BRACED}                        return 'NAME_BRACE';
"{"                             return '{';
"}"                             return '}';
.                               /* ignore bad characters */
<*><<EOF>>                      return 'EOF';

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

%start regex

/* Jison lexer file format grammar */

%nonassoc '/' '/!'

%left '*' '+' '?' RANGE_REGEX

%{
    import {Choice, Concat, Empty, CaptureGroup, SpecialGroup, Cardinality, LookAhead, LookBehind, Wildcard, Begin, End, Literal, Assertion, Operator, Reference, CharacterClass} from './RegexpAtom';
%}

%%

regex
    : regex_list EOF { return $1; }
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
        { $$ = new Literal(yytext); }
    | CHARACTER_LIT { $$ = new Literal(yytext); }
    ;

%%

function prepareCharacterClass (s: string) {
    s = s.replace(/\\r/g, "\r");
    s = s.replace(/\\f/g, "\f");
    s = s.replace(/\\n/g, "\n");
    s = s.replace(/\\t/g, "\t");
    s = s.replace(/\\v/g, "\v");
    return s;
}
