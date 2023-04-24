"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegexpAtomToJs = exports.fromStrEscape = exports.ToStrEscape = exports.RegexpAtomToStringVisitor = void 0;
class RegexpAtomToStringVisitor {
    constructor({ groups, debug, }) {
        this.groups = groups;
        this.debug = debug;
    }
    static serialize(atom, groups, debug) {
        return atom.visit(new RegexpAtomToJs({ debug, groups }), 0);
    }
    visit_RegexpList(visitee, delim, parentPrecedence, ...args) {
        const { needParen, myPrecedence } = this.getNewPrec(visitee, parentPrecedence);
        const innerStr = visitee.l.visit(this, myPrecedence)
            + delim
            + visitee.r.visit(this, myPrecedence);
        return needParen
            ? '(?:' + innerStr + ')'
            : innerStr;
    }
    visit_Choice(visitee, parentPrecedence, ...args) {
        return this.visit_RegexpList(visitee, '|', parentPrecedence, args);
    }
    visit_Concat(visitee, parentPrecedence, ...args) {
        return this.visit_RegexpList(visitee, '', parentPrecedence, args);
    }
    visit_CaptureGroup(visitee, parentPrecedence, ...args) {
        switch (this.groups) {
            case "simplify": return visitee.list.visit(this, parentPrecedence);
            case "preserve": return '(?:' + visitee.list.visit(this, 1) + ')';
            case "capture":
            default: return '(' + visitee.list.visit(this, 1) + ')';
        }
    }
    visit_SpecialGroup(visitee, parentPrecedence, ...args) {
        const ret = '(' + visitee.specialty + visitee.list.visit(this, 0) + ')';
        return ret;
    }
    visit_Empty(visitee, parentPrecedence, ...args) {
        return "";
    }
    visit_Cardinality(visitee, parentPrecedence, ...args) {
        const { needParen, myPrecedence } = this.getNewPrec(visitee, parentPrecedence);
        const innerStr = visitee.repeated.visit(this, myPrecedence) + visitee.card;
        return needParen
            ? '(?:' + innerStr + ')'
            : innerStr;
    }
    visit_LookOut(visitee, operator, parentPrecedence, ...args) {
        const { needParen, myPrecedence } = this.getNewPrec(visitee, parentPrecedence);
        const innerStr = visitee.lookFor.visit(this, parentPrecedence);
        return '(' + operator + innerStr + ')';
    }
    visit_LookAhead(visitee, parentPrecedence, ...args) {
        return this.visit_LookOut(visitee, "?=", parentPrecedence, args);
    }
    visit_LookBehind(visitee, parentPrecedence, ...args) {
        return this.visit_LookOut(visitee, "?!", parentPrecedence, args);
    }
    visit_Wildcard(visitee, parentPrecedence, ...args) {
        return '.';
    }
    // protected visit_Anchor (visitee: Anchor, operator: string, parentPrecedence: number, ...args: any[]): any {}
    visit_Begin(visitee, parentPrecedence, ...args) {
        return '^';
    }
    visit_End(visitee, parentPrecedence, ...args) {
        return '$';
    }
    visit_Reference(visitee, parentPrecedence, ...args) {
        if (this.debug)
            return `{${visitee.ref}}`;
        throw Error('Reference.visit() should never be called (unless you\'re debugging)');
    }
    visit_Literal(visitee, parentPrecedence, ...args) {
        return this.escapeLiteral(visitee.literal);
    }
    visit_CharacterClass(visitee, parentPrecedence, ...args) {
        return '[' + this.escapeCharacterClass(visitee.charClass) + ']';
    }
    visit_CharacterAtomClass(visitee, parentPrecedence, ...args) {
        return '[' + (visitee.negated ? '^' : '') + visitee.ranges.map(range => this.escapeCharacterClass(range.visit(this, parentPrecedence))).join('') + ']';
    }
    // protected visit_EscapedCharacter (visitee: EscapedCharacter, parentPrecedence: number, ...args: any[]): any {}
    visit_Assertion(visitee, parentPrecedence, ...args) {
        return '\\' + visitee.escapedChar;
    }
    visit_Operator(visitee, parentPrecedence, ...args) {
        return '\\' + visitee.escapedChar;
    }
    // visit_SimpleCharacter (visitee: SimpleCharacter, parentPrecedence: number, ...args: any[]): any {
    //   return this.escapeLiteral(visitee.simpleChar);
    // }
    getNewPrec(visitee, parentPrecedence) {
        const myPrecedence = visitee.getPrecedence();
        return parentPrecedence > myPrecedence
            ? { needParen: true, myPrecedence }
            : { needParen: false, myPrecedence };
    }
}
exports.RegexpAtomToStringVisitor = RegexpAtomToStringVisitor;
exports.ToStrEscape = {
    '\r': "\\r",
    '\f': "\\f",
    '\n': "\\n",
    '\t': "\\t",
    '\v': "\\v",
};
exports.fromStrEscape = {
    "\\r": '\r',
    "\\f": '\f',
    "\\n": '\n',
    "\\t": '\t',
    "\\v": '\v',
};
class RegexpAtomToJs extends RegexpAtomToStringVisitor {
    escapeLiteral(literal) {
        return literal.replace(/([\r\f\n\t\v])|([\x00-\x1f\x7f-\xff])|([\u0100-\ufffd])|([.*+?^${}()|[\]\/\\])/g, RegexpAtomToJs.escapeGroupMatch);
    }
    escapeCharacterClass(literal) {
        return literal.replace(/([\r\f\n\t\v])|([\x00-\x1f\x7f-\xff])|([\u0100-\ufffd])/g, RegexpAtomToJs.escapeGroupMatch);
    }
    static escapeGroupMatch(text, str, crl, uni, operator) {
        if (str)
            return exports.ToStrEscape[str];
        if (crl)
            return '\\x' + crl.charCodeAt(0).toString(16).padStart(2, '0');
        if (uni)
            return '\\u' + uni.charCodeAt(0).toString(16).padStart(4, '0');
        if (operator)
            return '\\' + operator;
        throw Error(`none of str, crl, uni set in ${arguments}`);
    }
}
exports.RegexpAtomToJs = RegexpAtomToJs;
//# sourceMappingURL=RegexpAtomToStringVisitor.js.map