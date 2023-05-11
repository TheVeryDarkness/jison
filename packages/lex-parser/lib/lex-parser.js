"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LexLexer = exports.LexParser = void 0;
const parser_1 = require("@ts-jison/parser");
/**
 * parser generated by  @ts-jison/parser-generator 0.4.1-alpha.2
 * @returns Parser implementing JisonParserApi and a Lexer implementing JisonLexerApi.
 */
const RegexpAtom_1 = require("./RegexpAtom");
let ebnf = false;
function prepareString(s) {
    s = s.replace(/\\\\/g, '\\');
    return s;
}
function prepareCharacterClass(s) {
    s = s.replace(/\\r/g, "\r");
    s = s.replace(/\\f/g, "\f");
    s = s.replace(/\\n/g, "\n");
    s = s.replace(/\\t/g, "\t");
    s = s.replace(/\\v/g, "\v");
    return s;
}
class LexParser extends parser_1.JisonParser {
    constructor(yy = {}, lexer = new LexLexer(yy)) {
        super(yy, lexer);
        this.symbols_ = { "error": 2, "lex": 3, "definitions": 4, "%%": 5, "rules": 6, "epilogue": 7, "EOF": 8, "CODE": 9, "definition": 10, "ACTION": 11, "NAME": 12, "regex": 13, "START_INC": 14, "names_inclusive": 15, "START_EXC": 16, "names_exclusive": 17, "START_COND": 18, "rule": 19, "start_conditions": 20, "action": 21, "{": 22, "action_body": 23, "}": 24, "action_comments_body": 25, "ACTION_BODY": 26, "<": 27, "name_list": 28, ">": 29, "*": 30, ",": 31, "regex_list": 32, "|": 33, "regex_concat": 34, "regex_base": 35, "(": 36, ")": 37, "SPECIAL_GROUP": 38, "+": 39, "?": 40, "/": 41, "/!": 42, "name_expansion": 43, "range_regex": 44, "ANY_GROUP_REGEX": 45, "char_class_rangeStar": 46, "END_CHAR_CLASS": 47, ".": 48, "^": 49, "$": 50, "string": 51, "escape_char": 52, "NAME_BRACE": 53, "char_class_range": 54, "CHAR_CLASS": 55, "ASSERTION": 56, "ESCAPE": 57, "OPERATOR": 58, "RANGE_REGEX": 59, "STRING_LIT": 60, "CHARACTER_LIT": 61, "$accept": 0, "$end": 1 };
        this.terminals_ = { 2: "error", 5: "%%", 8: "EOF", 9: "CODE", 11: "ACTION", 12: "NAME", 14: "START_INC", 16: "START_EXC", 18: "START_COND", 22: "{", 24: "}", 26: "ACTION_BODY", 27: "<", 29: ">", 30: "*", 31: ",", 33: "|", 36: "(", 37: ")", 38: "SPECIAL_GROUP", 39: "+", 40: "?", 41: "/", 42: "/!", 45: "ANY_GROUP_REGEX", 47: "END_CHAR_CLASS", 48: ".", 49: "^", 50: "$", 53: "NAME_BRACE", 55: "CHAR_CLASS", 56: "ASSERTION", 57: "ESCAPE", 58: "OPERATOR", 59: "RANGE_REGEX", 60: "STRING_LIT", 61: "CHARACTER_LIT" };
        this.productions_ = [0, [3, 4], [7, 1], [7, 2], [7, 3], [4, 2], [4, 2], [4, 0], [10, 2], [10, 2], [10, 2], [15, 1], [15, 2], [17, 1], [17, 2], [6, 2], [6, 1], [19, 3], [21, 3], [21, 1], [23, 0], [23, 1], [23, 5], [23, 4], [25, 1], [25, 2], [20, 3], [20, 3], [20, 0], [28, 1], [28, 3], [13, 1], [32, 3], [32, 2], [32, 1], [32, 0], [34, 2], [34, 1], [35, 3], [35, 3], [35, 2], [35, 2], [35, 2], [35, 2], [35, 2], [35, 1], [35, 2], [35, 3], [35, 1], [35, 1], [35, 1], [35, 1], [35, 1], [43, 1], [46, 0], [46, 2], [54, 1], [54, 1], [54, 1], [54, 1], [52, 1], [52, 1], [52, 1], [44, 1], [51, 1], [51, 1]];
        this.defaultActions = { 9: [2, 5], 10: [2, 6], 54: [2, 1], 56: [2, 2], 71: [2, 3], 79: [2, 4] };
        // shorten static method to just `o` for terse STATE_TABLE
        const $V0 = [2, 7], $V1 = [1, 4], $V2 = [1, 5], $V3 = [1, 6], $V4 = [1, 7], $V5 = [2, 35], $V6 = [1, 15], $V7 = [1, 16], $V8 = [1, 17], $V9 = [1, 18], $Va = [1, 20], $Vb = [1, 21], $Vc = [1, 22], $Vd = [1, 23], $Ve = [1, 26], $Vf = [1, 29], $Vg = [1, 30], $Vh = [1, 31], $Vi = [1, 27], $Vj = [1, 28], $Vk = [11, 22, 33, 36, 38, 41, 42, 45, 48, 49, 50, 53, 56, 57, 58, 60, 61], $Vl = [2, 28], $Vm = [1, 39], $Vn = [5, 11, 12, 14, 16], $Vo = [1, 40], $Vp = [5, 11, 12, 14, 16, 22, 33, 37], $Vq = [5, 11, 12, 14, 16, 22, 33, 36, 37, 38, 41, 42, 45, 48, 49, 50, 53, 56, 57, 58, 60, 61], $Vr = [1, 43], $Vs = [1, 42], $Vt = [1, 44], $Vu = [1, 46], $Vv = [33, 37], $Vw = [5, 11, 12, 14, 16, 22, 30, 33, 36, 37, 38, 39, 40, 41, 42, 45, 48, 49, 50, 53, 56, 57, 58, 59, 60, 61], $Vx = [47, 53, 55, 56, 57], $Vy = [5, 11, 12, 14, 16, 18], $Vz = [5, 8, 11, 22, 27, 33, 36, 38, 41, 42, 45, 48, 49, 50, 53, 56, 57, 58, 60, 61], $VA = [29, 31], $VB = [22, 24], $VC = [2, 20], $VD = [1, 82], $VE = [1, 85], $VF = [1, 86], $VG = [22, 24, 26];
        const o = parser_1.JisonParser.expandParseTable;
        this.table = [{ 3: 1, 4: 2, 5: $V0, 10: 3, 11: $V1, 12: $V2, 14: $V3, 16: $V4 }, { 1: [3] }, { 5: [1, 8] }, { 4: 9, 5: $V0, 10: 3, 11: $V1, 12: $V2, 14: $V3, 16: $V4 }, { 4: 10, 5: $V0, 10: 3, 11: $V1, 12: $V2, 14: $V3, 16: $V4 }, o([5, 11, 12, 14, 16, 33], $V5, { 13: 11, 32: 12, 34: 13, 35: 14, 43: 19, 51: 24, 52: 25, 36: $V6, 38: $V7, 41: $V8, 42: $V9, 45: $Va, 48: $Vb, 49: $Vc, 50: $Vd, 53: $Ve, 56: $Vf, 57: $Vg, 58: $Vh, 60: $Vi, 61: $Vj }), { 15: 32, 18: [1, 33] }, { 17: 34, 18: [1, 35] }, o($Vk, $Vl, { 6: 36, 19: 37, 20: 38, 27: $Vm }), { 5: [2, 5] }, { 5: [2, 6] }, o($Vn, [2, 8]), o([5, 11, 12, 14, 16, 22], [2, 31], { 33: $Vo }), o($Vp, [2, 34], { 43: 19, 51: 24, 52: 25, 35: 41, 36: $V6, 38: $V7, 41: $V8, 42: $V9, 45: $Va, 48: $Vb, 49: $Vc, 50: $Vd, 53: $Ve, 56: $Vf, 57: $Vg, 58: $Vh, 60: $Vi, 61: $Vj }), o($Vq, [2, 37], { 44: 45, 30: $Vr, 39: $Vs, 40: $Vt, 59: $Vu }), o($Vv, $V5, { 34: 13, 35: 14, 43: 19, 51: 24, 52: 25, 32: 47, 36: $V6, 38: $V7, 41: $V8, 42: $V9, 45: $Va, 48: $Vb, 49: $Vc, 50: $Vd, 53: $Ve, 56: $Vf, 57: $Vg, 58: $Vh, 60: $Vi, 61: $Vj }), o($Vv, $V5, { 34: 13, 35: 14, 43: 19, 51: 24, 52: 25, 32: 48, 36: $V6, 38: $V7, 41: $V8, 42: $V9, 45: $Va, 48: $Vb, 49: $Vc, 50: $Vd, 53: $Ve, 56: $Vf, 57: $Vg, 58: $Vh, 60: $Vi, 61: $Vj }), { 35: 49, 36: $V6, 38: $V7, 41: $V8, 42: $V9, 43: 19, 45: $Va, 48: $Vb, 49: $Vc, 50: $Vd, 51: 24, 52: 25, 53: $Ve, 56: $Vf, 57: $Vg, 58: $Vh, 60: $Vi, 61: $Vj }, { 35: 50, 36: $V6, 38: $V7, 41: $V8, 42: $V9, 43: 19, 45: $Va, 48: $Vb, 49: $Vc, 50: $Vd, 51: 24, 52: 25, 53: $Ve, 56: $Vf, 57: $Vg, 58: $Vh, 60: $Vi, 61: $Vj }, o($Vw, [2, 45]), o($Vx, [2, 54], { 46: 51 }), o($Vw, [2, 48]), o($Vw, [2, 49]), o($Vw, [2, 50]), o($Vw, [2, 51]), o($Vw, [2, 52]), o($Vw, [2, 53]), o($Vw, [2, 64]), o($Vw, [2, 65]), o($Vw, [2, 60]), o($Vw, [2, 61]), o($Vw, [2, 62]), o($Vn, [2, 9], { 18: [1, 52] }), o($Vy, [2, 11]), o($Vn, [2, 10], { 18: [1, 53] }), o($Vy, [2, 13]), o($Vk, $Vl, { 20: 38, 7: 54, 19: 55, 5: [1, 57], 8: [1, 56], 27: $Vm }), o($Vz, [2, 16]), o([11, 22, 33], $V5, { 32: 12, 34: 13, 35: 14, 43: 19, 51: 24, 52: 25, 13: 58, 36: $V6, 38: $V7, 41: $V8, 42: $V9, 45: $Va, 48: $Vb, 49: $Vc, 50: $Vd, 53: $Ve, 56: $Vf, 57: $Vg, 58: $Vh, 60: $Vi, 61: $Vj }), { 12: [1, 61], 28: 59, 30: [1, 60] }, o($Vp, [2, 33], { 35: 14, 43: 19, 51: 24, 52: 25, 34: 62, 36: $V6, 38: $V7, 41: $V8, 42: $V9, 45: $Va, 48: $Vb, 49: $Vc, 50: $Vd, 53: $Ve, 56: $Vf, 57: $Vg, 58: $Vh, 60: $Vi, 61: $Vj }), o($Vq, [2, 36], { 44: 45, 30: $Vr, 39: $Vs, 40: $Vt, 59: $Vu }), o($Vw, [2, 40]), o($Vw, [2, 41]), o($Vw, [2, 42]), o($Vw, [2, 46]), o($Vw, [2, 63]), { 33: $Vo, 37: [1, 63] }, { 33: $Vo, 37: [1, 64] }, o($Vq, [2, 43], { 44: 45, 30: $Vr, 39: $Vs, 40: $Vt, 59: $Vu }), o($Vq, [2, 44], { 44: 45, 30: $Vr, 39: $Vs, 40: $Vt, 59: $Vu }), { 47: [1, 65], 53: [1, 68], 54: 66, 55: [1, 67], 56: [1, 69], 57: [1, 70] }, o($Vy, [2, 12]), o($Vy, [2, 14]), { 1: [2, 1] }, o($Vz, [2, 15]), { 1: [2, 2] }, { 8: [1, 71], 9: [1, 72] }, { 11: [1, 75], 21: 73, 22: [1, 74] }, { 29: [1, 76], 31: [1, 77] }, { 29: [1, 78] }, o($VA, [2, 29]), o($Vp, [2, 32], { 43: 19, 51: 24, 52: 25, 35: 41, 36: $V6, 38: $V7, 41: $V8, 42: $V9, 45: $Va, 48: $Vb, 49: $Vc, 50: $Vd, 53: $Ve, 56: $Vf, 57: $Vg, 58: $Vh, 60: $Vi, 61: $Vj }), o($Vw, [2, 38]), o($Vw, [2, 39]), o($Vw, [2, 47]), o($Vx, [2, 55]), o($Vx, [2, 56]), o($Vx, [2, 57]), o($Vx, [2, 58]), o($Vx, [2, 59]), { 1: [2, 3] }, { 8: [1, 79] }, o($Vz, [2, 17]), o($VB, $VC, { 23: 80, 25: 81, 26: $VD }), o($Vz, [2, 19]), o($Vk, [2, 26]), { 12: [1, 83] }, o($Vk, [2, 27]), { 1: [2, 4] }, { 22: $VE, 24: [1, 84] }, o($VB, [2, 21], { 26: $VF }), o($VG, [2, 24]), o($VA, [2, 30]), o($Vz, [2, 18]), o($VB, $VC, { 25: 81, 23: 87, 26: $VD }), o($VG, [2, 25]), { 22: $VE, 24: [1, 88] }, o($VB, [2, 23], { 25: 89, 26: $VD }), o($VB, [2, 22], { 26: $VF })];
    }
    performAction(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
        /* this == yyval */
        var $0 = $$.length - 1;
        switch (yystate) {
            case 1:
                this.$ = { rules: $$[$0 - 1] };
                if ($$[$0 - 3][0])
                    this.$.macros = $$[$0 - 3][0];
                if ($$[$0 - 3][1])
                    this.$.startConditions = $$[$0 - 3][1];
                if ($$[$0])
                    this.$.moduleInclude = $$[$0];
                if (yy.options)
                    this.$.options = yy.options;
                if (yy.actionInclude)
                    this.$.actionInclude = yy.actionInclude;
                delete yy.options;
                delete yy.actionInclude;
                return this.$;
                break;
            case 2:
            case 3:
                this.$ = null;
                break;
            case 4:
            case 26:
                this.$ = $$[$0 - 1];
                break;
            case 5:
                this.$ = $$[$0];
                if ('length' in $$[$0 - 1]) {
                    this.$[0] = this.$[0] || {};
                    this.$[0][$$[$0 - 1][0]] = $$[$0 - 1][1];
                }
                else {
                    this.$[1] = this.$[1] || {};
                    for (var name in $$[$0 - 1]) {
                        this.$[1][name] = $$[$0 - 1][name];
                    }
                }
                break;
            case 6:
                yy.actionInclude += $$[$0 - 1];
                this.$ = $$[$0];
                break;
            case 7:
                yy.actionInclude = '';
                this.$ = [null, null];
                break;
            case 8:
                this.$ = [$$[$0 - 1], $$[$0]];
                break;
            case 9:
            case 10:
                this.$ = $$[$0];
                break;
            case 11:
                this.$ = {};
                this.$[$$[$0]] = 0;
                break;
            case 12:
                this.$ = $$[$0 - 1];
                this.$[$$[$0]] = 0;
                break;
            case 13:
                this.$ = {};
                this.$[$$[$0]] = 1;
                break;
            case 14:
                this.$ = $$[$0 - 1];
                this.$[$$[$0]] = 1;
                break;
            case 15:
                this.$ = $$[$0 - 1];
                this.$.push($$[$0]);
                break;
            case 16:
            case 29:
                this.$ = [$$[$0]];
                break;
            case 17:
                this.$ = $$[$0 - 2] ? { start: $$[$0 - 2], pattern: $$[$0 - 1], action: $$[$0] } : { pattern: $$[$0 - 1], action: $$[$0] };
                break;
            case 18:
                this.$ = $$[$0 - 1];
                break;
            case 19:
            case 21:
                this.$ = $$[$0];
                break;
            case 20:
                this.$ = '';
                break;
            case 22:
                this.$ = $$[$0 - 4] + $$[$0 - 3] + $$[$0 - 2] + $$[$0 - 1] + $$[$0];
                break;
            case 23:
                this.$ = $$[$0 - 3] + $$[$0 - 2] + $$[$0 - 1] + $$[$0];
                break;
            case 24:
            case 63:
                this.$ = yytext;
                break;
            case 25:
                this.$ = $$[$0 - 1] + $$[$0];
                break;
            case 27:
                this.$ = ['*'];
                break;
            case 30:
                this.$ = $$[$0 - 2];
                this.$.push($$[$0]);
                break;
            case 31:
                this.$ = $$[$0];
                if (!(yy.options && yy.options.flex)) {
                    let trailingLiteral = $$[$0];
                    // Find the right-most concatenation
                    while (trailingLiteral instanceof RegexpAtom_1.Concat)
                        trailingLiteral = trailingLiteral.r;
                    if ( // this regexp ends with a literal
                    trailingLiteral instanceof RegexpAtom_1.PatternLiteral &&
                        // which ends with ID
                        trailingLiteral.literal.match(/[\w\d]$/) &&
                        // and is not part of escape
                        !trailingLiteral.literal.match(/\\(r|f|n|t|v|s|b|c[A-Z]|x[0-9a-fA-F]{2}|u[a-fA-F0-9]{4}|[0-7]{1,3})$/)) {
                        // then add a word boundry assertion
                        this.$ = new RegexpAtom_1.Concat($$[$0], new RegexpAtom_1.Assertion('b'));
                    }
                }
                break;
            case 32:
                this.$ = new RegexpAtom_1.Choice($$[$0 - 2], $$[$0]);
                break;
            case 33:
                this.$ = new RegexpAtom_1.Choice($$[$0 - 1], new RegexpAtom_1.Empty());
                break;
            case 35:
                this.$ = new RegexpAtom_1.Empty();
                break;
            case 36:
                this.$ = new RegexpAtom_1.Concat($$[$0 - 1], $$[$0]);
                break;
            case 38:
                this.$ = new RegexpAtom_1.CaptureGroup($$[$0 - 1]);
                break;
            case 39:
                this.$ = new RegexpAtom_1.SpecialGroup($$[$0 - 2].substring(1), $$[$0 - 1]);
                break;
            case 40:
                this.$ = new RegexpAtom_1.Cardinality($$[$0 - 1], '+');
                break;
            case 41:
                this.$ = new RegexpAtom_1.Cardinality($$[$0 - 1], '*');
                break;
            case 42:
                this.$ = new RegexpAtom_1.Cardinality($$[$0 - 1], '?');
                break;
            case 43:
                this.$ = new RegexpAtom_1.LookAhead($$[$0]);
                break;
            case 44:
                this.$ = new RegexpAtom_1.LookBehind($$[$0]);
                break;
            case 46:
                this.$ = new RegexpAtom_1.Cardinality($$[$0 - 1], $$[$0]);
                break;
            case 47:
                this.$ = new RegexpAtom_1.CharacterClass($$[$0 - 2].length === 2, $$[$0 - 1]);
                break;
            case 48:
                this.$ = new RegexpAtom_1.Wildcard();
                break;
            case 49:
                this.$ = new RegexpAtom_1.Begin();
                break;
            case 50:
                this.$ = new RegexpAtom_1.End();
                break;
            case 53:
            case 57:
                this.$ = new RegexpAtom_1.Reference(yytext.substring(1, yytext.length - 1));
                break;
            case 54:
                this.$ = [];
                break;
            case 55:
                this.$ = $$[$0 - 1].concat([$$[$0]]);
                break;
            case 56:
                this.$ = new RegexpAtom_1.CharClassLiteral(prepareCharacterClass(yytext));
                break;
            case 58:
            case 60:
                this.$ = new RegexpAtom_1.Assertion(yytext.substring(1));
                break;
            case 59:
                this.$ = new RegexpAtom_1.CharClassLiteral(yytext.substring(1));
                break;
            case 61:
                this.$ = new RegexpAtom_1.PatternLiteral(yytext.substring(1));
                break;
            case 62:
                this.$ = new RegexpAtom_1.Operator(yytext.substring(1));
                break;
            case 64:
                this.$ = new RegexpAtom_1.PatternLiteral(prepareString(yytext.substr(1, yytext.length - 2)));
                break;
            case 65:
                this.$ = new RegexpAtom_1.PatternLiteral(yytext);
                break;
        }
    }
}
exports.LexParser = LexParser;
/* generated by @ts-jison/lexer-generator 0.4.1-alpha.2 */
const lexer_1 = require("@ts-jison/lexer");
class LexLexer extends lexer_1.JisonLexer {
    constructor(yy = {}) {
        super(yy);
        this.options = { "moduleName": "Lex" };
        this.rules = [
            /^(?:\/\*(?:.|\n|\r)*?\*\/)/,
            /^(?:\/\/.*)/,
            /^(?:\/[^ /]*?['"{}'][^ ]*?\/)/,
            /^(?:"(?:\\\\|\\"|[^"])*")/,
            /^(?:'(?:\\\\|\\'|[^'])*')/,
            /^(?:[/"'][^{}/"']+)/,
            /^(?:[^{}/"']+)/,
            /^(?:\{)/,
            /^(?:\})/,
            /^(?:[a-zA-Z_][a-zA-Z0-9_-]*)/,
            /^(?:>)/,
            /^(?:,)/,
            /^(?:\*)/,
            /^(?:(?:\r\n|\n|\r)+)/,
            /^(?:\s+(?:\r\n|\n|\r)+)/,
            /^(?:\s+)/,
            /^(?:%%)/,
            /^(?:[a-zA-Z0-9_]+)/,
            /^(?:[a-zA-Z_][a-zA-Z0-9_-]*)/,
            /^(?:(?:\r\n|\n|\r)+)/,
            /^(?:\s+(?:\r\n|\n|\r)+)/,
            /^(?:\s+)/,
            /^(?:[a-zA-Z_][a-zA-Z0-9_-]*)/,
            /^(?:(?:\r\n|\n|\r)+)/,
            /^(?:\s+(?:\r\n|\n|\r)+)/,
            /^(?:\s+)/,
            /^(?:.*(?:\r\n|\n|\r)+)/,
            /^(?:\{)/,
            /^(?:%\{(?:.|\r\n|\n|\r)*?%\})/,
            /^(?:%\{(?:.|\r\n|\n|\r)*?%\})/,
            /^(?:.+)/,
            /^(?:\])/,
            /^(?:\\\\)/,
            /^(?:\\\])/,
            /^(?:[^\]{])/,
            /^(?:\{[a-zA-Z_][a-zA-Z0-9_-]*\})/,
            /^(?:\\[sSbBwWdD])/,
            /^(?:\\\\)/,
            /^(?:\{)/,
            /^(?:\/\*(?:.|\n|\r)*?\*\/)/,
            /^(?:\/\/.*)/,
            /^(?:(?:\r\n|\n|\r)+)/,
            /^(?:\s+)/,
            /^(?:[a-zA-Z_][a-zA-Z0-9_-]*)/,
            /^(?:"(?:\\\\|\\"|[^"])*")/,
            /^(?:'(?:\\\\|\\'|[^'])*')/,
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
            /^(?:<)/,
            /^(?:\/!)/,
            /^(?:\/)/,
            /^(?:\\x[0-9A-F]{2})/,
            /^(?:\\u[0-9a-fA-F]{4})/,
            /^(?:\\c[A-Z])/,
            /^(?:\\[rfntv])/,
            /^(?:\\[0-7]{1,3})/,
            /^(?:\\[sSbBwWdD])/,
            /^(?:\\[\\*+()${}|[\]/.^?])/,
            /^(?:\\.)/,
            /^(?:\$)/,
            /^(?:\.)/,
            /^(?:%options\b)/,
            /^(?:%s\b)/,
            /^(?:%x\b)/,
            /^(?:%%)/,
            /^(?:\{\d+(?:,\s?\d+|,)?\})/,
            /^(?:\{[a-zA-Z_][a-zA-Z0-9_-]*\})/,
            /^(?:\{)/,
            /^(?:\})/,
            /^(?:.)/,
            /^(?:$)/,
            /^(?:(?:.|\r\n|\n|\r)+)/
        ];
        this.conditions = { "code": { "rules": [81, 82], "inclusive": false }, "start_condition": { "rules": [22, 23, 24, 25, 81], "inclusive": false }, "options": { "rules": [18, 19, 20, 21, 81], "inclusive": false }, "conditions": { "rules": [9, 10, 11, 12, 81], "inclusive": false }, "action": { "rules": [0, 1, 2, 3, 4, 5, 6, 7, 8, 81], "inclusive": false }, "char_class": { "rules": [31, 32, 33, 34, 35, 36, 37, 38, 81], "inclusive": false }, "indented": { "rules": [27, 28, 29, 30, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81], "inclusive": true }, "trail": { "rules": [26, 29, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81], "inclusive": true }, "rules": { "rules": [13, 14, 15, 16, 17, 29, 35, 36, 37, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81], "inclusive": true }, "INITIAL": { "rules": [29, 35, 36, 37, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81], "inclusive": true } };
    }
    performAction(yy, yy_, $avoiding_name_collisions, YY_START) {
        var YYSTATE = YY_START;
        switch ($avoiding_name_collisions) {
            case 0:
                return 26;
                break;
            case 1:
                return 26;
                break;
            case 2:
                return 26; // regexp with braces or quotes (and no spaces)
                break;
            case 3:
                return 26;
                break;
            case 4:
                return 26;
                break;
            case 5:
                return 26;
                break;
            case 6:
                return 26;
                break;
            case 7:
                yy.depth++;
                return 22;
                break;
            case 8:
                yy.depth == 0 ? this.begin('trail') : yy.depth--;
                return 24;
                break;
            case 9:
                return 12;
                break;
            case 10:
                this.popState();
                return 29;
                break;
            case 11:
                return 31;
                break;
            case 12:
                return 30;
                break;
            case 13: /* */
                break;
            case 14: /* */
                break;
            case 15:
                this.begin('indented');
                break;
            case 16:
                this.begin('code');
                return 5;
                break;
            case 17:
                return 61;
                break;
            case 18:
                yy.options[yy_.yytext] = true;
                break;
            case 19:
                this.begin('INITIAL');
                break;
            case 20:
                this.begin('INITIAL');
                break;
            case 21: /* empty */
                break;
            case 22:
                return 18;
                break;
            case 23:
                this.begin('INITIAL');
                break;
            case 24:
                this.begin('INITIAL');
                break;
            case 25: /* empty */
                break;
            case 26:
                this.begin('rules');
                break;
            case 27:
                yy.depth = 0;
                this.begin('action');
                return 22;
                break;
            case 28:
                this.begin('trail');
                yy_.yytext = yy_.yytext.substr(2, yy_.yytext.length - 4);
                return 11;
                break;
            case 29:
                yy_.yytext = yy_.yytext.substr(2, yy_.yytext.length - 4);
                return 11;
                break;
            case 30:
                this.begin('rules');
                return 11;
                break;
            case 31:
                this.popState();
                return 47;
                break;
            case 32:
                return 55;
                break;
            case 33:
                return 55;
                break;
            case 34:
                return 55;
                break;
            case 35:
                return 53;
                break;
            case 36:
                return 56;
                break;
            case 37:
                return 57;
                break;
            case 38:
                return 55;
                break;
            case 39: /* ignore */
                break;
            case 40: /* ignore */
                break;
            case 41: /* */
                break;
            case 42: /* */
                break;
            case 43:
                return 12;
                break;
            case 44:
                yy_.yytext = yy_.yytext.replace(/\\"/g, '"');
                return 60;
                break;
            case 45:
                yy_.yytext = yy_.yytext.replace(/\\'/g, "'");
                return 60;
                break;
            case 46:
                return 33;
                break;
            case 47:
                this.begin('char_class');
                return 45;
                break;
            case 48:
                return 38;
                break;
            case 49:
                return 38;
                break;
            case 50:
                return 38;
                break;
            case 51:
                return 36;
                break;
            case 52:
                return 37;
                break;
            case 53:
                return 39;
                break;
            case 54:
                return 30;
                break;
            case 55:
                return 40;
                break;
            case 56:
                return 49;
                break;
            case 57:
                return 31;
                break;
            case 58:
                return 50;
                break;
            case 59:
                this.begin('conditions');
                return 27;
                break;
            case 60:
                return 42;
                break;
            case 61:
                return 41;
                break;
            case 62:
                yy_.yytext = String.fromCharCode(parseInt(yy_.yytext.substring(2), 16));
                return 61;
                break;
            case 63:
                yy_.yytext = String.fromCharCode(parseInt(yy_.yytext.substring(2), 16));
                return 61;
                break;
            case 64:
                yy_.yytext = String.fromCodePoint(yy_.yytext.charCodeAt(2) - 64);
                return 61;
                break;
            case 65:
                yy_.yytext = decodeStringEscape(yy_.yytext.substring(1));
                return 61;
                break;
            case 66:
                yy_.yytext = String.fromCharCode(parseInt(yy_.yytext.substring(1), 8));
                return 61;
                break;
            case 67:
                return 56;
                break;
            case 68:
                return 58;
                break;
            case 69:
                yy_.yytext = yy_.yytext.replace(/^\\/g, '');
                return 61; // escaped special chars like '"'s
                break;
            case 70:
                return 50;
                break;
            case 71:
                return 48;
                break;
            case 72:
                yy.options = {};
                this.begin('options');
                break;
            case 73:
                this.begin('start_condition');
                return 14;
                break;
            case 74:
                this.begin('start_condition');
                return 16;
                break;
            case 75:
                this.begin('rules');
                return 5;
                break;
            case 76:
                return 59;
                break;
            case 77:
                return 53;
                break;
            case 78:
                return 22;
                break;
            case 79:
                return 24;
                break;
            case 80: /* ignore bad characters */
                break;
            case 81:
                return 8;
                break;
            case 82:
                return 9;
                break;
        }
    }
}
exports.LexLexer = LexLexer;
;
function decodeStringEscape(c) {
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
//# sourceMappingURL=lex-parser.js.map