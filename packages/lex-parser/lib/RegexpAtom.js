"use strict";
/** This captures Lex-style RegularExpression strings, not ASTs.
   To wit, a RegExp ASt would reduce strings to lists of characters.
   This uses lex conventions for lookahead and lookbehind, per Zaach's implementation:
   https://github.com/zaach/lex-parser/blob/f75c7db2e2a176f618ccd354e1897ed73d8fdb40/lex.y#L168-L169
.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegexpAtomCopyVisitor = exports.Operator = exports.Assertion = exports.EscapedCharacter = exports.CharacterClass = exports.Literal = exports.Reference = exports.End = exports.Begin = exports.Anchor = exports.Wildcard = exports.LookBehind = exports.LookAhead = exports.LookOut = exports.Cardinality = exports.Empty = exports.SpecialGroup = exports.CaptureGroup = exports.Concat = exports.Choice = exports.RegexpList = exports.RegexpAtom = void 0;
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
    constructor(lookFor) { super(lookFor); }
    visit(visitor, ...args) {
        return visitor.visit_LookAhead(this, args);
    }
}
exports.LookAhead = LookAhead;
class LookBehind extends LookOut {
    constructor(lookFor) { super(lookFor); }
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
class RegexpAtomCopyVisitor {
    static copy(atom) {
        return atom.visit(new RegexpAtomCopyVisitor());
    }
    visit_Choice(visitee, ...args) {
        return new Choice(visitee.l.visit(this), visitee.r.visit(this));
    }
    visit_Concat(visitee, ...args) {
        return new Concat(visitee.l.visit(this), visitee.r.visit(this));
    }
    visit_CaptureGroup(visitee, ...args) {
        return new CaptureGroup(visitee.list.visit(this));
    }
    visit_SpecialGroup(visitee, ...args) {
        return new SpecialGroup(visitee.specialty, visitee.list.visit(this));
    }
    visit_Empty(visitee, ...args) {
        return new Empty();
    }
    visit_Cardinality(visitee, ...args) {
        return new Cardinality(visitee.repeated.visit(this), visitee.card);
    }
    visit_LookAhead(visitee, ...args) {
        return new LookAhead(visitee.lookFor.visit(this));
    }
    visit_LookBehind(visitee, ...args) {
        return new LookBehind(visitee.lookFor.visit(this));
    }
    visit_Wildcard(visitee, ...args) {
        return new Wildcard();
    }
    // protected visit_Anchor (visitee: Anchor, operator: string, ...args: any[]): any {}
    visit_Begin(visitee, ...args) {
        return new Begin();
    }
    visit_End(visitee, ...args) {
        return new End();
    }
    visit_Reference(visitee, ...args) {
        return new Reference(visitee.ref);
    }
    visit_Literal(visitee, ...args) {
        return new Literal(visitee.literal);
    }
    visit_CharacterClass(visitee, ...args) {
        return new CharacterClass(visitee.charClass);
    }
    // protected visit_EscapedCharacter (visitee: EscapedCharacter, ...args: any[]): any {}
    visit_Assertion(visitee, ...args) {
        return new Assertion(visitee.escapedChar);
    }
    visit_Operator(visitee, ...args) {
        return new Operator(visitee.escapedChar);
    }
}
exports.RegexpAtomCopyVisitor = RegexpAtomCopyVisitor;
//# sourceMappingURL=RegexpAtom.js.map