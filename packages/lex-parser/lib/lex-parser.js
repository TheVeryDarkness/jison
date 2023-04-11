"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LexLexer = exports.LexParser = void 0;
const parser_1 = require("@ts-jison/parser");
/**
 * parser generated by  @ts-jison/parser-generator 0.3.0
 * @returns Parser implementing JisonParserApi and a Lexer implementing JisonLexerApi.
 */
// import {transform} from './ebnf-parser';
const lex_types_1 = require("./lex-types");
let ebnf = false;
function encodeRE(s) {
    return s.replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1').replace(/\\\\u([a-fA-F0-9]{4})/g, '\\u$1');
}
function prepareString(s) {
    // unescape slashes
    s = s.replace(/\\\\/g, "\\");
    s = encodeRE(s);
    return s;
}
;
class LexParser extends parser_1.JisonParser {
    constructor(yy = {}, lexer = new LexLexer(yy)) {
        super(yy, lexer);
        this.symbols_ = { "error": 2, "lex": 3, "definitions": 4, "%%": 5, "rules": 6, "epilogue": 7, "EOF": 8, "CODE": 9, "definition": 10, "ACTION": 11, "NAME": 12, "regex": 13, "START_INC": 14, "names_inclusive": 15, "START_EXC": 16, "names_exclusive": 17, "START_COND": 18, "rule": 19, "start_conditions": 20, "action": 21, "{": 22, "action_body": 23, "}": 24, "action_comments_body": 25, "ACTION_BODY": 26, "<": 27, "name_list": 28, ">": 29, "*": 30, ",": 31, "regex_list": 32, "|": 33, "regex_concat": 34, "regex_base": 35, "(": 36, ")": 37, "SPECIAL_GROUP": 38, "+": 39, "?": 40, "/": 41, "/!": 42, "name_expansion": 43, "range_regex": 44, "any_group_regex": 45, ".": 46, "^": 47, "$": 48, "string": 49, "escape_char": 50, "NAME_BRACE": 51, "ANY_GROUP_REGEX": 52, "ESCAPE_CHAR": 53, "RANGE_REGEX": 54, "STRING_LIT": 55, "CHARACTER_LIT": 56, "$accept": 0, "$end": 1 };
        this.terminals_ = { 2: "error", 5: "%%", 8: "EOF", 9: "CODE", 11: "ACTION", 12: "NAME", 14: "START_INC", 16: "START_EXC", 18: "START_COND", 22: "{", 24: "}", 26: "ACTION_BODY", 27: "<", 29: ">", 30: "*", 31: ",", 33: "|", 36: "(", 37: ")", 38: "SPECIAL_GROUP", 39: "+", 40: "?", 41: "/", 42: "/!", 46: ".", 47: "^", 48: "$", 51: "NAME_BRACE", 52: "ANY_GROUP_REGEX", 53: "ESCAPE_CHAR", 54: "RANGE_REGEX", 55: "STRING_LIT", 56: "CHARACTER_LIT" };
        this.productions_ = [0, [3, 4], [7, 1], [7, 2], [7, 3], [4, 2], [4, 2], [4, 0], [10, 2], [10, 2], [10, 2], [15, 1], [15, 2], [17, 1], [17, 2], [6, 2], [6, 1], [19, 3], [21, 3], [21, 1], [23, 0], [23, 1], [23, 5], [23, 4], [25, 1], [25, 2], [20, 3], [20, 3], [20, 0], [28, 1], [28, 3], [13, 1], [32, 3], [32, 2], [32, 1], [32, 0], [34, 2], [34, 1], [35, 3], [35, 3], [35, 2], [35, 2], [35, 2], [35, 2], [35, 2], [35, 1], [35, 2], [35, 1], [35, 1], [35, 1], [35, 1], [35, 1], [35, 1], [43, 1], [45, 1], [50, 1], [44, 1], [49, 1], [49, 1]];
        this.defaultActions = { 9: [2, 5], 10: [2, 6], 52: [2, 1], 54: [2, 2], 63: [2, 3], 71: [2, 4] };
        // shorten static method to just `o` for terse STATE_TABLE
        const $V0 = [2, 7], $V1 = [1, 4], $V2 = [1, 5], $V3 = [1, 6], $V4 = [1, 7], $V5 = [2, 35], $V6 = [1, 15], $V7 = [1, 16], $V8 = [1, 17], $V9 = [1, 18], $Va = [1, 21], $Vb = [1, 22], $Vc = [1, 23], $Vd = [1, 26], $Ve = [1, 27], $Vf = [1, 30], $Vg = [1, 28], $Vh = [1, 29], $Vi = [11, 22, 33, 36, 38, 41, 42, 46, 47, 48, 51, 52, 53, 55, 56], $Vj = [2, 28], $Vk = [1, 38], $Vl = [5, 11, 12, 14, 16], $Vm = [1, 39], $Vn = [5, 11, 12, 14, 16, 22, 33, 37], $Vo = [5, 11, 12, 14, 16, 22, 33, 36, 37, 38, 41, 42, 46, 47, 48, 51, 52, 53, 55, 56], $Vp = [1, 42], $Vq = [1, 41], $Vr = [1, 43], $Vs = [1, 45], $Vt = [33, 37], $Vu = [5, 11, 12, 14, 16, 22, 30, 33, 36, 37, 38, 39, 40, 41, 42, 46, 47, 48, 51, 52, 53, 54, 55, 56], $Vv = [5, 11, 12, 14, 16, 18], $Vw = [5, 8, 11, 22, 27, 33, 36, 38, 41, 42, 46, 47, 48, 51, 52, 53, 55, 56], $Vx = [29, 31], $Vy = [22, 24], $Vz = [2, 20], $VA = [1, 74], $VB = [1, 77], $VC = [1, 78], $VD = [22, 24, 26];
        const o = parser_1.JisonParser.expandParseTable;
        this.table = [{ 3: 1, 4: 2, 5: $V0, 10: 3, 11: $V1, 12: $V2, 14: $V3, 16: $V4 }, { 1: [3] }, { 5: [1, 8] }, { 4: 9, 5: $V0, 10: 3, 11: $V1, 12: $V2, 14: $V3, 16: $V4 }, { 4: 10, 5: $V0, 10: 3, 11: $V1, 12: $V2, 14: $V3, 16: $V4 }, o([5, 11, 12, 14, 16, 33], $V5, { 13: 11, 32: 12, 34: 13, 35: 14, 43: 19, 45: 20, 49: 24, 50: 25, 36: $V6, 38: $V7, 41: $V8, 42: $V9, 46: $Va, 47: $Vb, 48: $Vc, 51: $Vd, 52: $Ve, 53: $Vf, 55: $Vg, 56: $Vh }), { 15: 31, 18: [1, 32] }, { 17: 33, 18: [1, 34] }, o($Vi, $Vj, { 6: 35, 19: 36, 20: 37, 27: $Vk }), { 5: [2, 5] }, { 5: [2, 6] }, o($Vl, [2, 8]), o([5, 11, 12, 14, 16, 22], [2, 31], { 33: $Vm }), o($Vn, [2, 34], { 43: 19, 45: 20, 49: 24, 50: 25, 35: 40, 36: $V6, 38: $V7, 41: $V8, 42: $V9, 46: $Va, 47: $Vb, 48: $Vc, 51: $Vd, 52: $Ve, 53: $Vf, 55: $Vg, 56: $Vh }), o($Vo, [2, 37], { 44: 44, 30: $Vp, 39: $Vq, 40: $Vr, 54: $Vs }), o($Vt, $V5, { 34: 13, 35: 14, 43: 19, 45: 20, 49: 24, 50: 25, 32: 46, 36: $V6, 38: $V7, 41: $V8, 42: $V9, 46: $Va, 47: $Vb, 48: $Vc, 51: $Vd, 52: $Ve, 53: $Vf, 55: $Vg, 56: $Vh }), o($Vt, $V5, { 34: 13, 35: 14, 43: 19, 45: 20, 49: 24, 50: 25, 32: 47, 36: $V6, 38: $V7, 41: $V8, 42: $V9, 46: $Va, 47: $Vb, 48: $Vc, 51: $Vd, 52: $Ve, 53: $Vf, 55: $Vg, 56: $Vh }), { 35: 48, 36: $V6, 38: $V7, 41: $V8, 42: $V9, 43: 19, 45: 20, 46: $Va, 47: $Vb, 48: $Vc, 49: 24, 50: 25, 51: $Vd, 52: $Ve, 53: $Vf, 55: $Vg, 56: $Vh }, { 35: 49, 36: $V6, 38: $V7, 41: $V8, 42: $V9, 43: 19, 45: 20, 46: $Va, 47: $Vb, 48: $Vc, 49: 24, 50: 25, 51: $Vd, 52: $Ve, 53: $Vf, 55: $Vg, 56: $Vh }, o($Vu, [2, 45]), o($Vu, [2, 47]), o($Vu, [2, 48]), o($Vu, [2, 49]), o($Vu, [2, 50]), o($Vu, [2, 51]), o($Vu, [2, 52]), o($Vu, [2, 53]), o($Vu, [2, 54]), o($Vu, [2, 57]), o($Vu, [2, 58]), o($Vu, [2, 55]), o($Vl, [2, 9], { 18: [1, 50] }), o($Vv, [2, 11]), o($Vl, [2, 10], { 18: [1, 51] }), o($Vv, [2, 13]), o($Vi, $Vj, { 20: 37, 7: 52, 19: 53, 5: [1, 55], 8: [1, 54], 27: $Vk }), o($Vw, [2, 16]), o([11, 22, 33], $V5, { 32: 12, 34: 13, 35: 14, 43: 19, 45: 20, 49: 24, 50: 25, 13: 56, 36: $V6, 38: $V7, 41: $V8, 42: $V9, 46: $Va, 47: $Vb, 48: $Vc, 51: $Vd, 52: $Ve, 53: $Vf, 55: $Vg, 56: $Vh }), { 12: [1, 59], 28: 57, 30: [1, 58] }, o($Vn, [2, 33], { 35: 14, 43: 19, 45: 20, 49: 24, 50: 25, 34: 60, 36: $V6, 38: $V7, 41: $V8, 42: $V9, 46: $Va, 47: $Vb, 48: $Vc, 51: $Vd, 52: $Ve, 53: $Vf, 55: $Vg, 56: $Vh }), o($Vo, [2, 36], { 44: 44, 30: $Vp, 39: $Vq, 40: $Vr, 54: $Vs }), o($Vu, [2, 40]), o($Vu, [2, 41]), o($Vu, [2, 42]), o($Vu, [2, 46]), o($Vu, [2, 56]), { 33: $Vm, 37: [1, 61] }, { 33: $Vm, 37: [1, 62] }, o($Vo, [2, 43], { 44: 44, 30: $Vp, 39: $Vq, 40: $Vr, 54: $Vs }), o($Vo, [2, 44], { 44: 44, 30: $Vp, 39: $Vq, 40: $Vr, 54: $Vs }), o($Vv, [2, 12]), o($Vv, [2, 14]), { 1: [2, 1] }, o($Vw, [2, 15]), { 1: [2, 2] }, { 8: [1, 63], 9: [1, 64] }, { 11: [1, 67], 21: 65, 22: [1, 66] }, { 29: [1, 68], 31: [1, 69] }, { 29: [1, 70] }, o($Vx, [2, 29]), o($Vn, [2, 32], { 43: 19, 45: 20, 49: 24, 50: 25, 35: 40, 36: $V6, 38: $V7, 41: $V8, 42: $V9, 46: $Va, 47: $Vb, 48: $Vc, 51: $Vd, 52: $Ve, 53: $Vf, 55: $Vg, 56: $Vh }), o($Vu, [2, 38]), o($Vu, [2, 39]), { 1: [2, 3] }, { 8: [1, 71] }, o($Vw, [2, 17]), o($Vy, $Vz, { 23: 72, 25: 73, 26: $VA }), o($Vw, [2, 19]), o($Vi, [2, 26]), { 12: [1, 75] }, o($Vi, [2, 27]), { 1: [2, 4] }, { 22: $VB, 24: [1, 76] }, o($Vy, [2, 21], { 26: $VC }), o($VD, [2, 24]), o($Vx, [2, 30]), o($Vw, [2, 18]), o($Vy, $Vz, { 25: 73, 23: 79, 26: $VA }), o($VD, [2, 25]), { 22: $VB, 24: [1, 80] }, o($Vy, [2, 23], { 25: 81, 26: $VA }), o($Vy, [2, 22], { 26: $VC })];
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
                this.$ = $$[$0 - 2] ? [$$[$0 - 2], $$[$0 - 1], $$[$0]] : [$$[$0 - 1], $$[$0]];
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
            case 56:
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
                const compiled = $$[$0];
                console.log(JSON.stringify(compiled));
                const asStr0 = compiled.toString999({ debug: true, captureGroups: true }, 0);
                const asStr1 = compiled.toString999({ debug: true, captureGroups: true }, 0);
                this.$ = asStr0;
                const endsWithIdChar = (this.$.match(/[\w\d]$/) || [])[0];
                const endsWithEscapedChar = (this.$.match(/\\(r|f|n|t|v|s|b|c[A-Z]|x[0-9A-F]{2}|u[a-fA-F0-9]{4}|[0-7]{1,3})$/) || [])[0];
                if (!(yy.options && yy.options.flex) && endsWithIdChar && !endsWithEscapedChar) {
                    this.$ += "\\b";
                    // console.log('if', this.$, endsWithIdChar, endsWithEscapedChar);
                }
                else {
                    // console.log('else', this.$, endsWithIdChar, endsWithEscapedChar);
                }
                break;
            case 32:
                this.$ = new lex_types_1.Choice($$[$0 - 2], $$[$0]);
                break;
            case 33:
                this.$ = new lex_types_1.Choice($$[$0 - 1], new lex_types_1.Empty());
                break;
            case 35:
                this.$ = '';
                throw Error("regex_list: empty");
                break;
            case 36:
                this.$ = new lex_types_1.Concat($$[$0 - 1], $$[$0]);
                break;
            case 38:
                this.$ = new lex_types_1.CaptureGroup($$[$0 - 1]);
                break;
            case 39:
                this.$ = new lex_types_1.SpecialGroup($$[$0 - 2].substring(1), $$[$0 - 1]);
                break;
            case 40:
                this.$ = new lex_types_1.Cardinality($$[$0 - 1], '+');
                break;
            case 41:
                this.$ = new lex_types_1.Cardinality($$[$0 - 1], '*');
                break;
            case 42:
                this.$ = new lex_types_1.Cardinality($$[$0 - 1], '?');
                break;
            case 43:
                this.$ = new lex_types_1.LookAhead($$[$0]);
                break;
            case 44:
                this.$ = new lex_types_1.LookBehind($$[$0]);
                break;
            case 46:
                this.$ = new lex_types_1.Cardinality($$[$0 - 1], $$[$0]);
                break;
            case 48:
                this.$ = new lex_types_1.Wildcard();
                break;
            case 49:
                this.$ = new lex_types_1.Begin();
                break;
            case 50:
                this.$ = new lex_types_1.End();
                break;
            case 53:
                this.$ = new lex_types_1.Reference(yytext.substring(1, yytext.length - 1));
                break;
            case 54:
                this.$ = new lex_types_1.CharacterClass(yytext.substring(1, yytext.length - 1));
                break;
            case 55:
                this.$ = new lex_types_1.EscapedCharacter(yytext.substring(1));
                break;
            case 57:
                this.$ = new lex_types_1.String(prepareString(yytext.substr(1, yytext.length - 2)));
                break;
            case 58:
                this.$ = new lex_types_1.SimpleCharacter(prepareString(yytext));
                break;
        }
    }
}
exports.LexParser = LexParser;
/* generated by @ts-jison/lexer-generator 0.3.0 */
const lexer_1 = require("@ts-jison/lexer");
class LexLexer extends lexer_1.JisonLexer {
    constructor(yy = {}) {
        super(yy);
        this.options = { "moduleName": "Lex" };
        this.rules = [/^(?:\/\*(.|\n|\r)*?\*\/)/,
            /^(?:\/\/.*)/,
            /^(?:\/[^ /]*?['"{}'][^ ]*?\/)/,
            /^(?:"(\\\\|\\"|[^"])*")/,
            /^(?:'(\\\\|\\'|[^'])*')/,
            /^(?:[/"'][^{}/"']+)/,
            /^(?:[^{}/"']+)/,
            /^(?:\{)/,
            /^(?:\})/,
            /^(?:([a-zA-Z_][a-zA-Z0-9_-]*))/,
            /^(?:>)/,
            /^(?:,)/,
            /^(?:\*)/,
            /^(?:(\r\n|\n|\r)+)/,
            /^(?:\s+(\r\n|\n|\r)+)/,
            /^(?:\s+)/,
            /^(?:%%)/,
            /^(?:[a-zA-Z0-9_]+)/,
            /^(?:([a-zA-Z_][a-zA-Z0-9_-]*))/,
            /^(?:(\r\n|\n|\r)+)/,
            /^(?:\s+(\r\n|\n|\r)+)/,
            /^(?:\s+)/,
            /^(?:([a-zA-Z_][a-zA-Z0-9_-]*))/,
            /^(?:(\r\n|\n|\r)+)/,
            /^(?:\s+(\r\n|\n|\r)+)/,
            /^(?:\s+)/,
            /^(?:.*(\r\n|\n|\r)+)/,
            /^(?:\{)/,
            /^(?:%\{(.|(\r\n|\n|\r))*?%\})/,
            /^(?:%\{(.|(\r\n|\n|\r))*?%\})/,
            /^(?:.+)/,
            /^(?:\/\*(.|\n|\r)*?\*\/)/,
            /^(?:\/\/.*)/,
            /^(?:(\r\n|\n|\r)+)/,
            /^(?:\s+)/,
            /^(?:([a-zA-Z_][a-zA-Z0-9_-]*))/,
            /^(?:"(\\\\|\\"|[^"])*")/,
            /^(?:'(\\\\|\\'|[^'])*')/,
            /^(?:\|)/,
            /^(?:\[(\\\\|\\\]|[^\]])*\])/,
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
            /^(?:\\([0-7]{1,3}|[rfntvsSbBwWdD\\*+()${}|[\]\/.^?]|c[A-Z]|x[0-9A-F]{2}|u[a-fA-F0-9]{4}))/,
            /^(?:\\.)/,
            /^(?:\$)/,
            /^(?:\.)/,
            /^(?:%options\b)/,
            /^(?:%s\b)/,
            /^(?:%x\b)/,
            /^(?:%%)/,
            /^(?:\{\d+(,\s?\d+|,)?\})/,
            /^(?:\{([a-zA-Z_][a-zA-Z0-9_-]*)\})/,
            /^(?:\{)/,
            /^(?:\})/,
            /^(?:.)/,
            /^(?:$)/,
            /^(?:(.|(\r\n|\n|\r))+)/
        ];
        this.conditions = { "code": { "rules": [67, 68], "inclusive": false }, "start_condition": { "rules": [22, 23, 24, 25, 67], "inclusive": false }, "options": { "rules": [18, 19, 20, 21, 67], "inclusive": false }, "conditions": { "rules": [9, 10, 11, 12, 67], "inclusive": false }, "action": { "rules": [0, 1, 2, 3, 4, 5, 6, 7, 8, 67], "inclusive": false }, "indented": { "rules": [27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67], "inclusive": true }, "trail": { "rules": [26, 29, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67], "inclusive": true }, "rules": { "rules": [13, 14, 15, 16, 17, 29, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67], "inclusive": true }, "INITIAL": { "rules": [29, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67], "inclusive": true } };
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
                return 56;
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
            case 31: /* ignore */
                break;
            case 32: /* ignore */
                break;
            case 33: /* */
                break;
            case 34: /* */
                break;
            case 35:
                return 12;
                break;
            case 36:
                yy_.yytext = yy_.yytext.replace(/\\"/g, '"');
                return 55;
                break;
            case 37:
                yy_.yytext = yy_.yytext.replace(/\\'/g, "'");
                return 55;
                break;
            case 38:
                return 33;
                break;
            case 39:
                return 52;
                break;
            case 40:
                return 38;
                break;
            case 41:
                return 38;
                break;
            case 42:
                return 38;
                break;
            case 43:
                return 36;
                break;
            case 44:
                return 37;
                break;
            case 45:
                return 39;
                break;
            case 46:
                return 30;
                break;
            case 47:
                return 40;
                break;
            case 48:
                return 47;
                break;
            case 49:
                return 31;
                break;
            case 50:
                return 48;
                break;
            case 51:
                this.begin('conditions');
                return 27;
                break;
            case 52:
                return 42;
                break;
            case 53:
                return 41;
                break;
            case 54:
                return 53;
                break;
            case 55: /* yy_.yytext = yy_.yytext.replace(/^\\/g,''); */
                return 53;
                break;
            case 56:
                return 48;
                break;
            case 57:
                return 46;
                break;
            case 58:
                yy.options = {};
                this.begin('options');
                break;
            case 59:
                this.begin('start_condition');
                return 14;
                break;
            case 60:
                this.begin('start_condition');
                return 16;
                break;
            case 61:
                this.begin('rules');
                return 5;
                break;
            case 62:
                return 54;
                break;
            case 63:
                return 51;
                break;
            case 64:
                return 22;
                break;
            case 65:
                return 24;
                break;
            case 66: /* ignore bad characters */
                break;
            case 67:
                return 8;
                break;
            case 68:
                return 9;
                break;
        }
    }
}
exports.LexLexer = LexLexer;
//# sourceMappingURL=lex-parser.js.map