"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleCharacter = exports.EscapedCharacter = exports.CharacterClass = exports.Literal = exports.Reference = exports.End = exports.Begin = exports.Anchor = exports.Wildcard = exports.LookBehind = exports.LookAhead = exports.LookOut = exports.Cardinality = exports.Empty = exports.SpecialGroup = exports.CaptureGroup = exports.Concat = exports.Choice = exports.RegexpList = exports.RegexpAtom = exports.RegexpAtomToJs = exports.RegexpAtom_toString_Opts = void 0;
class RegexpAtom_toString_Opts {
    constructor({ groups, debug, }) {
        this.groups = groups;
        this.debug = debug;
    }
}
exports.RegexpAtom_toString_Opts = RegexpAtom_toString_Opts;
class RegexpAtomToJs extends RegexpAtom_toString_Opts {
    escapeLiteral(literal) {
        return literal.replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1').replace(/\\\\u([a-fA-F0-9]{4})/g, '\\u$1');
        // return literal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    escapeCharacterClass(literal) {
        return literal.replace(/\n/g, "\\n").replace(/([[\]])/g, '\\$1'); // .replace(/\\\\u([a-fA-F0-9]{4})/g,'\\u$1')
    }
}
exports.RegexpAtomToJs = RegexpAtomToJs;
class RegexpAtom {
    getNewPrec(parentPrecedence) {
        const myPrecedence = this.getPrecedence();
        return parentPrecedence > myPrecedence
            ? { needParen: true, myPrecedence }
            : { needParen: false, myPrecedence };
    }
}
exports.RegexpAtom = RegexpAtom;
class RegexpList extends RegexpAtom {
    constructor(l, r) {
        super();
        this.l = l;
        this.r = r;
    }
    toString999(opts, parentPrecedence) {
        const { needParen, myPrecedence } = this.getNewPrec(parentPrecedence);
        const innerStr = this.l.toString999(opts, myPrecedence)
            + this.getDelim()
            + this.r.toString999(opts, myPrecedence);
        return needParen
            ? '(' + innerStr + ')'
            : innerStr;
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
    toString999(opts, parentPrecedence) {
        switch (opts.groups) {
            case "simplify": return this.list.toString999(opts, parentPrecedence);
            case "preserve": return '(' + this.list.toString999(opts, 1) + ')';
            case "capture":
            default: return '(' + this.list.toString999(opts, 1) + ')';
        }
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
    toString999(opts, parentPrecedence) {
        const ret = '(' + this.specialty + this.list.toString999(opts, parentPrecedence) + ')';
        console.log(ret);
        return ret;
    }
}
exports.SpecialGroup = SpecialGroup;
class Empty extends RegexpAtom {
    getPrecedence() { return 6; }
    toString999(opts, parentPrecedence) { return ""; }
}
exports.Empty = Empty;
class Cardinality extends RegexpAtom {
    constructor(repeated, card) {
        super();
        this.repeated = repeated;
        this.card = card;
    }
    getPrecedence() { return 4; }
    toString999(opts, parentPrecedence) {
        const { needParen, myPrecedence } = this.getNewPrec(parentPrecedence);
        const innerStr = this.repeated.toString999(opts, myPrecedence) + this.card;
        return needParen
            ? '(' + innerStr + ')'
            : innerStr;
    }
}
exports.Cardinality = Cardinality;
class LookOut extends RegexpAtom {
    constructor(lookFor) {
        super();
        this.lookFor = lookFor;
    }
    getPrecedence() { return 7; }
    toString999(opts, parentPrecedence) {
        const { needParen, myPrecedence } = this.getNewPrec(parentPrecedence);
        const innerStr = this.lookFor.toString999(opts, parentPrecedence);
        return '(' + this.getOperator() + innerStr + ')';
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
    toString999(opts, parentPrecedence) {
        return '.';
    }
}
exports.Wildcard = Wildcard;
class Anchor extends RegexpAtom {
    getPrecedence() { return 7; }
    toString999(_opts, _parentPrecedence) {
        return this.getOperator();
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
    toString999(opts, _parentPrecedence) {
        if (opts.debug)
            return `{${this.ref}}`;
        throw Error('Reference.toString999() should never be called (unless you\'re debugging)');
    }
}
exports.Reference = Reference;
class Literal extends RegexpAtom {
    constructor(literal) {
        super();
        this.literal = literal;
    }
    getPrecedence() { return 7; }
    toString999(opts, _parentPrecedence) { return opts.escapeLiteral(this.literal); }
}
exports.Literal = Literal;
class CharacterClass extends RegexpAtom {
    constructor(charClass) {
        super();
        this.charClass = charClass;
    }
    getPrecedence() { return 7; }
    toString999(opts, _parentPrecedence) {
        return '[' + opts.escapeCharacterClass(this.charClass) + ']';
    }
}
exports.CharacterClass = CharacterClass;
class EscapedCharacter extends RegexpAtom {
    constructor(escapedChar) {
        super();
        this.escapedChar = escapedChar;
    }
    getPrecedence() { return 7; }
    toString999(opts, _parentPrecedence) {
        return '\\' + opts.escapeLiteral(this.escapedChar);
    }
}
exports.EscapedCharacter = EscapedCharacter;
class SimpleCharacter extends RegexpAtom {
    constructor(simpleChar) {
        super();
        this.simpleChar = simpleChar;
    }
    getPrecedence() { return 7; }
    toString999(opts, _parentPrecedence) {
        return opts.escapeLiteral(this.simpleChar);
    }
}
exports.SimpleCharacter = SimpleCharacter;
//# sourceMappingURL=lex-types.js.map