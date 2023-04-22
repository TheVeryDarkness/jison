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

"/*"(.|\n|\r)*?"*/"             /* ignore */
"//".*                          /* ignore */

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
"{"\d+(","\s?\d+|",")?"}"       return 'RANGE_REGEX';
"{"{NAME}"}"                    return 'NAME_BRACE';
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
    : regex_list EOF
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
          return $$;
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
