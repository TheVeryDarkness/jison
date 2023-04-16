"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleCharacter = exports.Operator = exports.Assertion = exports.EscapedCharacter = exports.CharacterClass = exports.Literal = exports.Reference = exports.End = exports.Begin = exports.Anchor = exports.Wildcard = exports.LookBehind = exports.LookAhead = exports.LookOut = exports.Cardinality = exports.Empty = exports.SpecialGroup = exports.CaptureGroup = exports.Concat = exports.Choice = exports.RegexpList = exports.RegexpAtom = exports.RegexpAtomToJs = exports.fromStrEscape = exports.ToStrEscape = exports.RegexpAtom_toString_Visitor = exports.RegexpAtomVisitor = void 0;
class RegexpAtomVisitor {
}
exports.RegexpAtomVisitor = RegexpAtomVisitor;
class RegexpAtom_toString_Visitor extends RegexpAtomVisitor {
    constructor({ groups, debug, }) {
        super();
        this.groups = groups;
        this.debug = debug;
    }
    visit_RegexpList(visitee, parentPrecedence, ...args) {
        const { needParen, myPrecedence } = this.getNewPrec(visitee, parentPrecedence);
        const innerStr = visitee.l.visit999(this, myPrecedence)
            + visitee.getDelim()
            + visitee.r.visit999(this, myPrecedence);
        return needParen
            ? '(' + innerStr + ')'
            : innerStr;
    }
    visit_CaptureGroup(visitee, parentPrecedence, ...args) {
        switch (this.groups) {
            case "simplify": return visitee.list.visit999(this, parentPrecedence);
            case "preserve": return '(' + visitee.list.visit999(this, 1) + ')';
            case "capture":
            default: return '(' + visitee.list.visit999(this, 1) + ')';
        }
    }
    visit_SpecialGroup(visitee, parentPrecedence, ...args) {
        const ret = '(' + visitee.specialty + visitee.list.visit999(this, 0) + ')';
        return ret;
    }
    visit_Empty(visitee, parentPrecedence, ...args) {
        return "";
    }
    visit_Cardinality(visitee, parentPrecedence, ...args) {
        const { needParen, myPrecedence } = this.getNewPrec(visitee, parentPrecedence);
        const innerStr = visitee.repeated.visit999(this, myPrecedence) + visitee.card;
        return needParen
            ? '(' + innerStr + ')'
            : innerStr;
    }
    visit_LookOut(visitee, parentPrecedence, ...args) {
        const { needParen, myPrecedence } = this.getNewPrec(visitee, parentPrecedence);
        const innerStr = visitee.lookFor.visit999(this, parentPrecedence);
        return '(' + visitee.getOperator() + innerStr + ')';
    }
    visit_Wildcard(visitee, parentPrecedence, ...args) {
        return '.';
    }
    visit_Anchor(visitee, parentPrecedence, ...args) {
        return visitee.getOperator();
    }
    visit_Reference(visitee, parentPrecedence, ...args) {
        if (this.debug)
            return `{${visitee.ref}}`;
        throw Error('Reference.visit999() should never be called (unless you\'re debugging)');
    }
    visit_Literal(visitee, parentPrecedence, ...args) {
        return this.escapeLiteral(visitee.literal);
    }
    visit_CharacterClass(visitee, parentPrecedence, ...args) {
        return '[' + this.escapeCharacterClass(visitee.charClass) + ']';
    }
    visit_EscapedCharacter(visitee, parentPrecedence, ...args) {
        return '\\' + visitee.escapedChar;
    }
    visit_SimpleCharacter(visitee, parentPrecedence, ...args) {
        return this.escapeLiteral(visitee.simpleChar);
    }
    getNewPrec(visitee, parentPrecedence) {
        const myPrecedence = visitee.getPrecedence();
        return parentPrecedence > myPrecedence
            ? { needParen: true, myPrecedence }
            : { needParen: false, myPrecedence };
    }
}
exports.RegexpAtom_toString_Visitor = RegexpAtom_toString_Visitor;
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
class RegexpAtomToJs extends RegexpAtom_toString_Visitor {
    escapeLiteral(literal) {
        return literal.replace(/([\r\f\n\t\v])|([\x00-\x1f\x7f-\xff])|([\u0100-\ufffd])|([.*+?^${}()|[\]\/\\])/g, RegexpAtomToJs.escapeGroupMatch);
    }
    escapeCharacterClass(literal) {
        return literal.replace(/([\r\f\n\t\v])|([\x00-\x1f\x7f-\xff])|([\u0100-\ufffd])|([[\]\\])/g, RegexpAtomToJs.escapeGroupMatch);
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
class RegexpAtom {
}
exports.RegexpAtom = RegexpAtom;
class RegexpList extends RegexpAtom {
    constructor(l, r) {
        super();
        this.l = l;
        this.r = r;
    }
    visit999(visitor, ...args) {
        return visitor.visit_RegexpList(this, args);
    }
}
exports.RegexpList = RegexpList;
class Choice extends RegexpList {
    getDelim() { return '|'; }
    getPrecedence() { return 1; }
}
exports.Choice = Choice;
class Concat extends RegexpList {
    getDelim() { return ''; }
    getPrecedence() { return 3; }
}
exports.Concat = Concat;
class CaptureGroup extends RegexpAtom {
    constructor(list) {
        super();
        this.list = list;
    }
    getPrecedence() { return 7; }
    visit999(visitor, ...args) {
        return visitor.visit_CaptureGroup(this, args);
    }
}
exports.CaptureGroup = CaptureGroup;
class SpecialGroup extends RegexpAtom {
    constructor(specialty, list) {
        super();
        this.specialty = specialty;
        this.list = list;
    }
    getPrecedence() { return 7; }
    visit999(visitor, ...args) {
        return visitor.visit_SpecialGroup(this, args);
    }
}
exports.SpecialGroup = SpecialGroup;
class Empty extends RegexpAtom {
    getPrecedence() { return 6; }
    visit999(visitor, ...args) {
        return visitor.visit_Empty(this, args);
    }
}
exports.Empty = Empty;
class Cardinality extends RegexpAtom {
    constructor(repeated, card) {
        super();
        this.repeated = repeated;
        this.card = card;
    }
    getPrecedence() { return 4; }
    visit999(visitor, ...args) {
        return visitor.visit_Cardinality(this, args);
    }
}
exports.Cardinality = Cardinality;
class LookOut extends RegexpAtom {
    constructor(lookFor) {
        super();
        this.lookFor = lookFor;
    }
    getPrecedence() { return 7; }
    visit999(visitor, ...args) {
        return visitor.visit_LookOut(this, args);
    }
}
exports.LookOut = LookOut;
class LookAhead extends LookOut {
    constructor(inner) { super(inner); }
    getOperator() { return '?='; }
}
exports.LookAhead = LookAhead;
class LookBehind extends LookOut {
    constructor(inner) { super(inner); }
    getOperator() { return '?!'; }
}
exports.LookBehind = LookBehind;
class Wildcard extends RegexpAtom {
    getPrecedence() { return 7; }
    visit999(visitor, ...args) {
        return visitor.visit_Wildcard(this, args);
    }
}
exports.Wildcard = Wildcard;
class Anchor extends RegexpAtom {
    getPrecedence() { return 7; }
    visit999(visitor, ...args) {
        return visitor.visit_Anchor(this, args);
    }
}
exports.Anchor = Anchor;
class Begin extends Anchor {
    getOperator() { return '^'; }
}
exports.Begin = Begin;
class End extends Anchor {
    getOperator() { return '$'; }
}
exports.End = End;
// this isn't really a RegexpAtom, but will be replaced before serailization.
class Reference extends RegexpAtom {
    constructor(ref) {
        super();
        this.ref = ref;
    }
    getPrecedence() { throw Error('Reference.getPrecedence() should never be called'); }
    visit999(visitor, ...args) {
        return visitor.visit_Reference(this, args);
    }
}
exports.Reference = Reference;
class Literal extends RegexpAtom {
    constructor(literal) {
        super();
        this.literal = literal;
    }
    getPrecedence() { return 7; }
    visit999(visitor, ...args) {
        return visitor.visit_Literal(this, args);
    }
}
exports.Literal = Literal;
class CharacterClass extends RegexpAtom {
    constructor(charClass) {
        super();
        this.charClass = charClass;
    }
    getPrecedence() { return 7; }
    visit999(visitor, ...args) {
        return visitor.visit_CharacterClass(this, args);
    }
}
exports.CharacterClass = CharacterClass;
class EscapedCharacter extends RegexpAtom {
    constructor(escapedChar) {
        super();
        this.escapedChar = escapedChar;
    }
    getPrecedence() { return 7; }
    visit999(visitor, ...args) {
        return visitor.visit_EscapedCharacter(this, args);
    }
}
exports.EscapedCharacter = EscapedCharacter;
class Assertion extends EscapedCharacter {
    constructor(char) { super(char); }
}
exports.Assertion = Assertion;
class Operator extends EscapedCharacter {
    constructor(char) { super(char); }
}
exports.Operator = Operator;
class SimpleCharacter extends RegexpAtom {
    constructor(simpleChar) {
        super();
        this.simpleChar = simpleChar;
    }
    getPrecedence() { return 7; }
    visit999(visitor, ...args) {
        return visitor.visit_SimpleCharacter(this, args);
    }
}
exports.SimpleCharacter = SimpleCharacter;
//# sourceMappingURL=lex-types.js.map