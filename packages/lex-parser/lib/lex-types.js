"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharacterClass = exports.String = exports.Reference = exports.End = exports.Begin = exports.Anchor = exports.Wildcard = exports.LookBehind = exports.LookAhead = exports.LookOut = exports.Cardinality = exports.Empty = exports.SpecialGroup = exports.CaptureGroup = exports.Concat = exports.Choice = exports.RegexpList = exports.RegexpAtom = void 0;
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
    toString(opts, parentPrecedence) {
        const { needParen, myPrecedence } = this.getNewPrec(parentPrecedence);
        const innerStr = this.l.toString(opts, myPrecedence)
            + this.getDelim()
            + this.r.toString(opts, myPrecedence);
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
    toString(opts, parentPrecedence) {
        return '(' + (opts.capture ? "?:" : "") + this.list.toString(opts, parentPrecedence);
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
    toString(opts, parentPrecedence) {
        return '(' + this.specialty + this.list.toString(opts, parentPrecedence);
    }
}
exports.SpecialGroup = SpecialGroup;
class Empty extends RegexpAtom {
    getPrecedence() { return 6; }
    toString(opts, parentPrecedence) { return ""; }
}
exports.Empty = Empty;
class Cardinality extends RegexpAtom {
    constructor(inner, card) {
        super();
        this.inner = inner;
        this.card = card;
    }
    getPrecedence() { return 4; }
    toString(opts, parentPrecedence) {
        const { needParen, myPrecedence } = this.getNewPrec(parentPrecedence);
        const innerStr = this.inner.toString(opts, myPrecedence) + this.card;
        return needParen
            ? '(' + innerStr + ')'
            : innerStr;
    }
}
exports.Cardinality = Cardinality;
class LookOut extends RegexpAtom {
    constructor(inner) {
        super();
        this.inner = inner;
    }
    getPrecedence() { return 7; }
    toString(opts, parentPrecedence) {
        const { needParen, myPrecedence } = this.getNewPrec(parentPrecedence);
        const innerStr = this.inner.toString(opts, parentPrecedence);
        return needParen
            ? '(' + this.getOperator() + innerStr + ')'
            : innerStr;
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
    toString(opts, parentPrecedence) {
        return '.';
    }
}
exports.Wildcard = Wildcard;
class Anchor extends RegexpAtom {
    getPrecedence() { return 7; }
    toString(_opts, _parentPrecedence) {
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
    constructor(target) {
        super();
        this.target = target;
    }
    getPrecedence() { throw Error('Reference.getPrecedence() should never be called'); }
    toString(opts, _parentPrecedence) {
        if (opts.debug)
            return `{${this.target}}`;
        throw Error('Reference.toString() should never be called (unless you\'re debugging)');
    }
}
exports.Reference = Reference;
class String extends RegexpAtom {
    constructor(text) {
        super();
        this.text = text;
    }
    getPrecedence() { return 7; }
    toString(opts, _parentPrecedence) { return this.text; }
}
exports.String = String;
class CharacterClass extends RegexpAtom {
    constructor(range) {
        super();
        this.range = range;
    }
    getPrecedence() { return 7; }
    toString(opts, _parentPrecedence) {
        return '[' + this.range + ']';
    }
}
exports.CharacterClass = CharacterClass;
//# sourceMappingURL=lex-types.js.map