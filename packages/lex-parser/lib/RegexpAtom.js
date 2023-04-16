"use strict";
/* This captures RegularExpression strings, not ASTs.
   To wit, a RegExp ASt would reduce strings to lists of Literals.
   TBH: I didn't know Lookahead existed in Lex. Folloing Zaach's port to JS:
   https://github.com/zaach/lex-parser/blob/f75c7db2e2a176f618ccd354e1897ed73d8fdb40/lex.y#L168-L169
.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleCharacter = exports.Operator = exports.Assertion = exports.EscapedCharacter = exports.CharacterClass = exports.Literal = exports.Reference = exports.End = exports.Begin = exports.Anchor = exports.Wildcard = exports.LookBehind = exports.LookAhead = exports.LookOut = exports.Cardinality = exports.Empty = exports.SpecialGroup = exports.CaptureGroup = exports.Concat = exports.Choice = exports.RegexpList = exports.RegexpAtom = exports.RegexpAtomToJs = exports.fromStrEscape = exports.ToStrEscape = exports.RegexpAtom_toString_Visitor = void 0;
class RegexpAtom_toString_Visitor {
    constructor({ groups, debug, }) {
        this.groups = groups;
        this.debug = debug;
    }
    static serialize(atom, trailingAnchor, groups, debug) {
        const ret = atom.visit(new RegexpAtomToJs({ debug, groups }), 0);
        /* could analyze last literal in any nesting Concats:
        let trailingLiteral = atom;
        if (trailingAnchor) {
          while (trailingLiteral instanceof Concat)
            trailingLiteral = trailingLiteral.r;
          if (trailingLiteral instanceof Literal &&
            trailingLiteral.literal.match(/[\w\d]$/) && // ends with ID
            !trailingLiteral.literal.match(/\\(r|f|n|t|v|s|b|c[A-Z]|x[0-9a-fA-F]{2}|u[a-fA-F0-9]{4}|[0-7]{1,3})$/)) // not part of escape
            return ret + "\\b";
        }
        return ret;
        */
        // or just look at ret like zaach did:
        return (trailingAnchor &&
            ret.match(/[\w\d]$/) && // ends with ID
            !ret.match(/\\(r|f|n|t|v|s|b|c[A-Z]|x[0-9a-fA-F]{2}|u[a-fA-F0-9]{4}|[0-7]{1,3})$/)) // not part of escape
            ? ret + "\\b"
            : ret;
    }
    visit_RegexpList(visitee, delim, parentPrecedence, ...args) {
        const { needParen, myPrecedence } = this.getNewPrec(visitee, parentPrecedence);
        const innerStr = visitee.l.visit(this, myPrecedence)
            + delim
            + visitee.r.visit(this, myPrecedence);
        return needParen
            ? '(' + innerStr + ')'
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
            case "preserve": return '(' + visitee.list.visit(this, 1) + ')';
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
            ? '(' + innerStr + ')'
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
    // protected visit_EscapedCharacter (visitee: EscapedCharacter, parentPrecedence: number, ...args: any[]): any {}
    visit_Assertion(visitee, parentPrecedence, ...args) {
        return '\\' + visitee.escapedChar;
    }
    visit_Operator(visitee, parentPrecedence, ...args) {
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
/**
@startuml
abstract class RegexpList extends RegexpAtom
  class Choice extends RegexpList
  class Concat extends RegexpList
class CaptureGroup extends RegexpAtom
class SpecialGroup extends RegexpAtom
class Empty extends RegexpAtom
class Cardinality extends RegexpAtom
abstract class LookOut extends RegexpAtom
  class LookAhead extends LookOut
  class LookBehind extends LookOut
class Wildcard extends RegexpAtom
abstract class Anchor extends RegexpAtom
  class Begin extends Anchor
  class End extends Anchor
class Reference extends RegexpAtom
class Literal extends RegexpAtom
class CharacterClass extends RegexpAtom
class EscapedCharacter extends RegexpAtom
  class Assertion extends EscapedCharacter
  class Operator extends EscapedCharacter
class SimpleCharacter extends RegexpAtom
@enduml
 */
class RegexpAtom {
}
exports.RegexpAtom = RegexpAtom;
class RegexpList extends RegexpAtom {
    constructor(l, r) {
        super();
        this.l = l;
        this.r = r;
    }
}
exports.RegexpList = RegexpList;
class Choice extends RegexpList {
    visit(visitor, ...args) {
        return visitor.visit_Choice(this, args);
    }
    getPrecedence() { return 1; }
}
exports.Choice = Choice;
class Concat extends RegexpList {
    visit(visitor, ...args) {
        return visitor.visit_Concat(this, args);
    }
    getPrecedence() { return 3; }
}
exports.Concat = Concat;
class CaptureGroup extends RegexpAtom {
    constructor(list) {
        super();
        this.list = list;
    }
    getPrecedence() { return 7; }
    visit(visitor, ...args) {
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
    visit(visitor, ...args) {
        return visitor.visit_SpecialGroup(this, args);
    }
}
exports.SpecialGroup = SpecialGroup;
class Empty extends RegexpAtom {
    getPrecedence() { return 6; }
    visit(visitor, ...args) {
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
    visit(visitor, ...args) {
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
}
exports.LookOut = LookOut;
class LookAhead extends LookOut {
    constructor(inner) { super(inner); }
    visit(visitor, ...args) {
        return visitor.visit_LookAhead(this, args);
    }
}
exports.LookAhead = LookAhead;
class LookBehind extends LookOut {
    constructor(inner) { super(inner); }
    visit(visitor, ...args) {
        return visitor.visit_LookBehind(this, args);
    }
}
exports.LookBehind = LookBehind;
class Wildcard extends RegexpAtom {
    getPrecedence() { return 7; }
    visit(visitor, ...args) {
        return visitor.visit_Wildcard(this, args);
    }
}
exports.Wildcard = Wildcard;
class Anchor extends RegexpAtom {
    getPrecedence() { return 7; }
}
exports.Anchor = Anchor;
class Begin extends Anchor {
    visit(visitor, ...args) {
        return visitor.visit_Begin(this, args);
    }
}
exports.Begin = Begin;
class End extends Anchor {
    visit(visitor, ...args) {
        return visitor.visit_End(this, args);
    }
}
exports.End = End;
// this isn't really a RegexpAtom, but will be replaced before serailization.
class Reference extends RegexpAtom {
    constructor(ref) {
        super();
        this.ref = ref;
    }
    getPrecedence() { throw Error('Reference.getPrecedence() should never be called'); }
    visit(visitor, ...args) {
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
    visit(visitor, ...args) {
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
    visit(visitor, ...args) {
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
}
exports.EscapedCharacter = EscapedCharacter;
class Assertion extends EscapedCharacter {
    constructor(char) { super(char); }
    visit(visitor, ...args) {
        return visitor.visit_Assertion(this, args);
    }
}
exports.Assertion = Assertion;
class Operator extends EscapedCharacter {
    constructor(char) { super(char); }
    visit(visitor, ...args) {
        return visitor.visit_Operator(this, args);
    }
}
exports.Operator = Operator;
class SimpleCharacter extends RegexpAtom {
    constructor(simpleChar) {
        super();
        this.simpleChar = simpleChar;
    }
    getPrecedence() { return 7; }
    visit(visitor, ...args) {
        return visitor.visit_SimpleCharacter(this, args);
    }
}
exports.SimpleCharacter = SimpleCharacter;
//# sourceMappingURL=lex-types.js.map