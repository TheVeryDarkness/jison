import { JisonParser, JisonParserApi, StateType, SymbolsType, TerminalsType, ProductionsType } from '@ts-jison/parser';
/**
 * parser generated by  @ts-jison/parser-generator 0.4.1-alpha.2
 * @returns Parser implementing JisonParserApi and a Lexer implementing JisonLexerApi.
 */
type YY_ = {
  yytext: string; 
  yyleng: number
};
export class EbnfParser extends JisonParser implements JisonParserApi {
    $?: any;
    symbols_: SymbolsType = {"error":2,"production":3,"handle":4,"EOF":5,"handle_list":6,"|":7,"expression_suffix":8,"expression":9,"suffix":10,"ALIAS":11,"symbol":12,"(":13,")":14,"*":15,"?":16,"+":17,"$accept":0,"$end":1};
    terminals_: TerminalsType = {2:"error",5:"EOF",7:"|",11:"ALIAS",12:"symbol",13:"(",14:")",15:"*",16:"?",17:"+"};
    productions_: ProductionsType = [0,[3,2],[6,1],[6,3],[4,0],[4,2],[8,3],[8,2],[9,1],[9,3],[10,0],[10,1],[10,1],[10,1]];
    table: Array<StateType>;
    defaultActions: {[key:number]: any} = {3:[2,1]};

    constructor (yy: any = {}, lexer = new EbnfLexer(yy)) {
      super(yy, lexer);

      // shorten static method to just `o` for terse STATE_TABLE
      const $V0=[2,4],$V1=[1,6],$V2=[1,7],$V3=[5,7,12,13,14],$V4=[5,7,11,12,13,14],$V5=[5,7,11,12,13,14,15,16,17],$V6=[7,12,13,14],$V7=[7,14];
      const o = JisonParser.expandParseTable;
      this.table = [o([5,12,13],$V0,{3:1,4:2}),{1:[3]},{5:[1,3],8:4,9:5,12:$V1,13:$V2},{1:[2,1]},o($V3,[2,5]),o($V4,[2,10],{10:8,15:[1,9],16:[1,10],17:[1,11]}),o($V5,[2,8]),o($V6,$V0,{6:12,4:13}),o($V3,[2,7],{11:[1,14]}),o($V4,[2,11]),o($V4,[2,12]),o($V4,[2,13]),{7:[1,16],14:[1,15]},o($V7,[2,2],{8:4,9:5,12:$V1,13:$V2}),o($V3,[2,6]),o($V5,[2,9]),o($V6,$V0,{4:17}),o($V7,[2,3],{8:4,9:5,12:$V1,13:$V2})];
    }

    performAction (yytext:string, yyleng:number, yylineno:number, yy:any, yystate:number /* action[1] */, $$:any /* vstack */, _$:any /* lstack */): any {
/* this == yyval */
          var $0 = $$.length - 1;
        switch (yystate) {
case 1:
 return $$[$0-1]; 
break;
case 2:
 this.$ = [$$[$0]]; 
break;
case 3:
 $$[$0-2].push($$[$0]); 
break;
case 4:
 this.$ = []; 
break;
case 5:
 $$[$0-1].push($$[$0]); 
break;
case 6:
 this.$ = ['xalias', $$[$0-1], $$[$0-2], $$[$0]]; 
break;
case 7:
 if ($$[$0]) this.$ = [$$[$0], $$[$0-1]]; else this.$ = $$[$0-1]; 
break;
case 8:
 this.$ = ['symbol', $$[$0]]; 
break;
case 9:
 this.$ = ['()', $$[$0-1]]; 
break;
        }
    }
}


/* generated by @ts-jison/lexer-generator 0.4.1-alpha.2 */
import { JisonLexer, JisonLexerApi } from '@ts-jison/lexer';

export class EbnfLexer extends JisonLexer implements JisonLexerApi {
    options: any = {"moduleName":"Ebnf"};
    constructor (yy: any = {}) {
        super(yy);
    }

    rules: RegExp[] = [
        /^(?:\s+)/,
        /^(?:[a-zA-Z][a-zA-Z0-9_-]*)/,
        /^(?:\[[a-zA-Z][a-zA-Z0-9_-]*\])/,
        /^(?:'[^']*')/,
        /^(?:\.)/,
        /^(?:bar\b)/,
        /^(?:\()/,
        /^(?:\))/,
        /^(?:\*)/,
        /^(?:\?)/,
        /^(?:\|)/,
        /^(?:\+)/,
        /^(?:$)/
    ];
    conditions: any = {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12],"inclusive":true}}
    performAction (yy:any,yy_:YY_,$avoiding_name_collisions:any,YY_START:any): any {
          var YYSTATE=YY_START;
        switch($avoiding_name_collisions) {
    case 0:/* skip whitespace */
      break;
    case 1:return 12;
      break;
    case 2:yy_.yytext = yy_.yytext.substr(1, yy_.yyleng-2); return 11;
      break;
    case 3:return 12;
      break;
    case 4:return 12;
      break;
    case 5:return 'bar';
      break;
    case 6:return 13;
      break;
    case 7:return 14;
      break;
    case 8:return 15;
      break;
    case 9:return 16;
      break;
    case 10:return 7;
      break;
    case 11:return 17;
      break;
    case 12:return 5;
      break;
        }
    }
}


