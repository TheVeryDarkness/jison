import { JisonParser, JisonParserApi, StateType, SymbolsType, TerminalsType, ProductionsType } from '@ts-jison/parser';
export declare class LexRegexpParser extends JisonParser implements JisonParserApi {
    $?: any;
    symbols_: SymbolsType;
    terminals_: TerminalsType;
    productions_: ProductionsType;
    table: Array<StateType>;
    defaultActions: {
        [key: number]: any;
    };
    constructor(yy?: {}, lexer?: LexRegexpLexer);
    performAction(yytext: string, yyleng: number, yylineno: number, yy: any, yystate: number, $$: any, _$: any): any;
}
import { JisonLexer, JisonLexerApi } from '@ts-jison/lexer';
export declare class LexRegexpLexer extends JisonLexer implements JisonLexerApi {
    options: any;
    constructor(yy?: {});
    rules: RegExp[];
    conditions: any;
    performAction(yy: any, yy_: any, $avoiding_name_collisions: any, YY_START: any): any;
}
//# sourceMappingURL=lex-regexp-parser.d.ts.map