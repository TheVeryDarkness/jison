import { JisonParser, JisonParserApi, StateType, SymbolsType, TerminalsType, ProductionsType } from '@ts-jison/parser';
/**
 * parser generated by  @ts-jison/parser-generator 0.3.0
 * @returns Parser implementing JisonParserApi and a Lexer implementing JisonLexerApi.
 */

    import {Choice, Concat, Empty, CaptureGroup, SpecialGroup, Cardinality, LookAhead, LookBehind, Wildcard, Begin, End, PatternLiteral, CharClassLiteral, Assertion, Operator, Reference, CharacterClass, CharacterAtomClass} from './RegexpAtom';


function prepareCharacterClass (s: string) {
    s = s.replace(/\\r/g, "\r");
    s = s.replace(/\\f/g, "\f");
    s = s.replace(/\\n/g, "\n");
    s = s.replace(/\\t/g, "\t");
    s = s.replace(/\\v/g, "\v");
    return s;
}

export class LexRegexpParser extends JisonParser implements JisonParserApi {
    $?: any;
    symbols_: SymbolsType = {"error":2,"regex":3,"regex_list":4,"EOF":5,"|":6,"regex_concat":7,"regex_base":8,"(":9,")":10,"SPECIAL_GROUP":11,"+":12,"*":13,"?":14,"/":15,"/!":16,"name_expansion":17,"range_regex":18,"ANY_GROUP_REGEX":19,"char_class_rangeStar":20,"END_CHAR_CLASS":21,".":22,"^":23,"$":24,"string":25,"escape_char":26,"NAME_BRACE":27,"char_class_range":28,"CHAR_CLASS":29,"ASSERTION":30,"ESCAPE":31,"OPERATOR":32,"RANGE_REGEX":33,"STRING_LIT":34,"CHARACTER_LIT":35,"$accept":0,"$end":1};
    terminals_: TerminalsType = {2:"error",5:"EOF",6:"|",9:"(",10:")",11:"SPECIAL_GROUP",12:"+",13:"*",14:"?",15:"/",16:"/!",19:"ANY_GROUP_REGEX",21:"END_CHAR_CLASS",22:".",23:"^",24:"$",27:"NAME_BRACE",29:"CHAR_CLASS",30:"ASSERTION",31:"ESCAPE",32:"OPERATOR",33:"RANGE_REGEX",34:"STRING_LIT",35:"CHARACTER_LIT"};
    productions_: ProductionsType = [0,[3,2],[4,3],[4,2],[4,1],[4,0],[7,2],[7,1],[8,3],[8,3],[8,2],[8,2],[8,2],[8,2],[8,2],[8,1],[8,2],[8,3],[8,1],[8,1],[8,1],[8,1],[8,1],[17,1],[20,0],[20,2],[28,1],[28,1],[28,1],[28,1],[26,1],[26,1],[26,1],[18,1],[25,1],[25,1]];
    table: Array<StateType>;
    defaultActions: {[key:number]: any} = {22:[2,1]};

    constructor (yy = {}, lexer = new LexRegexpLexer(yy)) {
      super(yy, lexer);

      // shorten static method to just `o` for terse STATE_TABLE
      const $V0=[2,5],$V1=[1,5],$V2=[1,6],$V3=[1,7],$V4=[1,8],$V5=[1,10],$V6=[1,11],$V7=[1,12],$V8=[1,13],$V9=[1,16],$Va=[1,19],$Vb=[1,20],$Vc=[1,21],$Vd=[1,17],$Ve=[1,18],$Vf=[1,23],$Vg=[5,6,10],$Vh=[5,6,9,10,11,15,16,19,22,23,24,27,30,31,32,34,35],$Vi=[1,25],$Vj=[1,26],$Vk=[1,27],$Vl=[1,29],$Vm=[6,10],$Vn=[5,6,9,10,11,12,13,14,15,16,19,22,23,24,27,30,31,32,33,34,35],$Vo=[21,27,29,30,31];
      const o = JisonParser.expandParseTable;
      this.table = [o([5,6],$V0,{3:1,4:2,7:3,8:4,17:9,25:14,26:15,9:$V1,11:$V2,15:$V3,16:$V4,19:$V5,22:$V6,23:$V7,24:$V8,27:$V9,30:$Va,31:$Vb,32:$Vc,34:$Vd,35:$Ve}),{1:[3]},{5:[1,22],6:$Vf},o($Vg,[2,4],{17:9,25:14,26:15,8:24,9:$V1,11:$V2,15:$V3,16:$V4,19:$V5,22:$V6,23:$V7,24:$V8,27:$V9,30:$Va,31:$Vb,32:$Vc,34:$Vd,35:$Ve}),o($Vh,[2,7],{18:28,12:$Vi,13:$Vj,14:$Vk,33:$Vl}),o($Vm,$V0,{7:3,8:4,17:9,25:14,26:15,4:30,9:$V1,11:$V2,15:$V3,16:$V4,19:$V5,22:$V6,23:$V7,24:$V8,27:$V9,30:$Va,31:$Vb,32:$Vc,34:$Vd,35:$Ve}),o($Vm,$V0,{7:3,8:4,17:9,25:14,26:15,4:31,9:$V1,11:$V2,15:$V3,16:$V4,19:$V5,22:$V6,23:$V7,24:$V8,27:$V9,30:$Va,31:$Vb,32:$Vc,34:$Vd,35:$Ve}),{8:32,9:$V1,11:$V2,15:$V3,16:$V4,17:9,19:$V5,22:$V6,23:$V7,24:$V8,25:14,26:15,27:$V9,30:$Va,31:$Vb,32:$Vc,34:$Vd,35:$Ve},{8:33,9:$V1,11:$V2,15:$V3,16:$V4,17:9,19:$V5,22:$V6,23:$V7,24:$V8,25:14,26:15,27:$V9,30:$Va,31:$Vb,32:$Vc,34:$Vd,35:$Ve},o($Vn,[2,15]),o($Vo,[2,24],{20:34}),o($Vn,[2,18]),o($Vn,[2,19]),o($Vn,[2,20]),o($Vn,[2,21]),o($Vn,[2,22]),o($Vn,[2,23]),o($Vn,[2,34]),o($Vn,[2,35]),o($Vn,[2,30]),o($Vn,[2,31]),o($Vn,[2,32]),{1:[2,1]},o($Vg,[2,3],{8:4,17:9,25:14,26:15,7:35,9:$V1,11:$V2,15:$V3,16:$V4,19:$V5,22:$V6,23:$V7,24:$V8,27:$V9,30:$Va,31:$Vb,32:$Vc,34:$Vd,35:$Ve}),o($Vh,[2,6],{18:28,12:$Vi,13:$Vj,14:$Vk,33:$Vl}),o($Vn,[2,10]),o($Vn,[2,11]),o($Vn,[2,12]),o($Vn,[2,16]),o($Vn,[2,33]),{6:$Vf,10:[1,36]},{6:$Vf,10:[1,37]},o($Vh,[2,13],{18:28,12:$Vi,13:$Vj,14:$Vk,33:$Vl}),o($Vh,[2,14],{18:28,12:$Vi,13:$Vj,14:$Vk,33:$Vl}),{21:[1,38],27:[1,41],28:39,29:[1,40],30:[1,42],31:[1,43]},o($Vg,[2,2],{17:9,25:14,26:15,8:24,9:$V1,11:$V2,15:$V3,16:$V4,19:$V5,22:$V6,23:$V7,24:$V8,27:$V9,30:$Va,31:$Vb,32:$Vc,34:$Vd,35:$Ve}),o($Vn,[2,8]),o($Vn,[2,9]),o($Vn,[2,17]),o($Vo,[2,25]),o($Vo,[2,26]),o($Vo,[2,27]),o($Vo,[2,28]),o($Vo,[2,29])];
    }

    performAction (yytext:string, yyleng:number, yylineno:number, yy:any, yystate:number /* action[1] */, $$:any /* vstack */, _$:any /* lstack */): any {
/* this == yyval */
          var $0 = $$.length - 1;
        switch (yystate) {
case 1:
 return $$[$0-1]; 
break;
case 2:
 this.$ = new Choice($$[$0-2], $$[$0]); 
break;
case 3:
 this.$ = new Choice($$[$0-1], new Empty()); 
break;
case 5:
 this.$ = new Empty(); 
break;
case 6:
 this.$ = new Concat($$[$0-1], $$[$0]); 
break;
case 8:
 this.$ = new CaptureGroup($$[$0-1]); 
break;
case 9:
 this.$ = new SpecialGroup($$[$0-2].substring(1), $$[$0-1]); 
break;
case 10:
 this.$ = new Cardinality($$[$0-1], '+'); 
break;
case 11:
 this.$ = new Cardinality($$[$0-1], '*'); 
break;
case 12:
 this.$ = new Cardinality($$[$0-1], '?'); 
break;
case 13:
 this.$ = new LookAhead($$[$0]); 
break;
case 14:
 this.$ = new LookBehind($$[$0]); 
break;
case 16:
 this.$ = new Cardinality($$[$0-1], $$[$0]); 
break;
case 17:
 this.$ = new CharacterAtomClass($$[$0-2].length === 2, $$[$0-1]); 
break;
case 18:
 this.$ = new Wildcard(); 
break;
case 19:
 this.$ = new Begin(); 
break;
case 20:
 this.$ = new End(); 
break;
case 23: case 27:
 this.$ = new Reference(yytext.substring(1, yytext.length - 1)); 
break;
case 24:
 this.$ = []; 
break;
case 25:
 this.$ = $$[$0-1].concat([$$[$0]]); 
break;
case 26:
 this.$ = new CharClassLiteral(prepareCharacterClass(yytext)); 
break;
case 28: case 30:
 this.$ = new Assertion(yytext.substring(1)); 
break;
case 29:
 this.$ = new CharClassLiteral(yytext.substring(1)); 
break;
case 31:
 this.$ = new PatternLiteral(yytext.substring(1)); 
break;
case 32:
 this.$ = new Operator(yytext.substring(1)); 
break;
case 33:
 this.$ = yytext; 
break;
case 34: case 35:
 this.$ = new PatternLiteral(yytext); 
break;
        }
    }
}


/* generated by @ts-jison/lexer-generator 0.3.0 */
import { JisonLexer, JisonLexerApi } from '@ts-jison/lexer';

export class LexRegexpLexer extends JisonLexer implements JisonLexerApi {
    options: any = {"moduleName":"LexRegexp"};
    constructor (yy = {}) {
        super(yy);
    }

    rules: RegExp[] = [/^(?:\])/,
          /^(?:\\\\)/,
          /^(?:\\\])/,
          /^(?:[^\]{])/,
          /^(?:\{([a-zA-Z_][a-zA-Z0-9_-]*)\})/,
          /^(?:(\\[sSbBwWdD]))/,
          /^(?:(\\\\))/,
          /^(?:\{)/,
          /^(?:(\\[rfntv]))/,
          /^(?:\/\*(.|\n|\r)*?\*\/)/,
          /^(?:\/\/.*)/,
          /^(?:([^\\*+()${}|[\]/.^?]+))/,
          /^(?:\|)/,
          /^(?:\[\^?)/,
          /^(?:\(\?:)/,
          /^(?:\(\?=)/,
          /^(?:\(\?!)/,
          /^(?:\()/,
          /^(?:\))/,
          /^(?:\+)/,
          /^(?:\*)/,
          /^(?:\?)/,
          /^(?:\^)/,
          /^(?:,)/,
          /^(?:<<EOF>>)/,
          /^(?:\/!)/,
          /^(?:\/)/,
          /^(?:(\\x[0-9A-F]{2}))/,
          /^(?:(\\u[0-9a-fA-F]{4}))/,
          /^(?:(\\c[A-Z]))/,
          /^(?:(\\[0-7]{1,3}))/,
          /^(?:(\\[*+()${}|[\]/.^?]))/,
          /^(?:\\.)/,
          /^(?:\$)/,
          /^(?:\.)/,
          /^(?:\{\d+(,\s?\d+|,)?\})/,
          /^(?:\{)/,
          /^(?:\})/,
          /^(?:.)/,
          /^(?:$)/
        ];
    conditions: any = {"char_class":{"rules":[0,1,2,3,4,5,6,7,39],"inclusive":false},"INITIAL":{"rules":[4,5,6,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39],"inclusive":true}}
    performAction (yy:any,yy_:any,$avoiding_name_collisions:any,YY_START:any): any {
          var YYSTATE=YY_START;
        switch($avoiding_name_collisions) {
    case 0:this.begin('INITIAL'); return 21;
    case 1:return 29;
    case 2:return 29;
    case 3:return 29;
    case 4:return 27;
    case 5:return 30;
    case 6:return 31;
    case 7:return 29;
    case 8:yy_.yytext = decodeStringEscape(yy_.yytext.substring(1));                return 35;
    case 9:/* ignore */
      break;
    case 10:/* ignore */
      break;
    case 11:return 34;
    case 12:return 6;
    case 13:this.begin('char_class'); return 19;
    case 14:return 11;
    case 15:return 11;
    case 16:return 11;
    case 17:return 9;
    case 18:return 10;
    case 19:return 12;
    case 20:return 13;
    case 21:return 14;
    case 22:return 23;
    case 23:return ',';
    case 24:return 24;
    case 25:return 16;
    case 26:return 15;
    case 27:yy_.yytext = String.fromCharCode(parseInt(yy_.yytext.substring(2), 16)); return 35;
    case 28:yy_.yytext = String.fromCharCode(parseInt(yy_.yytext.substring(2), 16)); return 35;
    case 29:yy_.yytext = String.fromCodePoint(yy_.yytext.charCodeAt(2) - 64);        return 35;
    case 30:yy_.yytext = String.fromCharCode(parseInt(yy_.yytext.substring(1),  8)); return 35;
    case 31:return 32;
    case 32:yy_.yytext = yy_.yytext.replace(/^\\/g,''); return 35; // escaped special chars like '"'s
    case 33:return 24;
    case 34:return 22;
    case 35:return 33;
    case 36:return '{';
    case 37:return '}';
    case 38:/* ignore bad characters */
      break;
    case 39:return 5;
        }
    }
}

;
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
