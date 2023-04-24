/** This captures Lex-style RegularExpression strings, not ASTs.
   To wit, a RegExp ASt would reduce strings to lists of characters.
   This uses lex conventions for lookahead and lookbehind, per Zaach's implementation:
   https://github.com/zaach/lex-parser/blob/f75c7db2e2a176f618ccd354e1897ed73d8fdb40/lex.y#L168-L169
.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
 */

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
class CharacterAtomClass extends RegexpAtom
class EscapedCharacter extends RegexpAtom
  class Assertion extends EscapedCharacter
  class Operator extends EscapedCharacter
class SimpleCharacter extends RegexpAtom
@enduml
 */

export abstract class RegexpAtom {
  abstract visit (visitor: RegexpAtomVisitor, ...args: any[]): any;
  abstract getPrecedence (): number;
}

export abstract class RegexpList extends RegexpAtom {
  constructor (
    public l: RegexpAtom,
    public r: RegexpAtom,
  ) { super(); }
}

export class Choice extends RegexpList {
  visit (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_Choice(this, args);
  }
  getPrecedence (): number { return 1; }
}

export class Concat extends RegexpList {
  visit (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_Concat(this, args);
  }
  getPrecedence (): number { return 3; }
}

export class CaptureGroup extends RegexpAtom {
  constructor (
    public list: RegexpList, // TODO: should this just be a RegexpAtom
  ) { super(); }
  getPrecedence (): number { return 7; }
  visit (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_CaptureGroup(this, args);
  }
}

export class SpecialGroup extends RegexpAtom {
  constructor (
    public specialty: string,
    public list: RegexpList,
  ) { super(); }
  getPrecedence (): number { return 7; }
  visit (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_SpecialGroup(this, args);
  }
}

export class Empty extends RegexpAtom {
  getPrecedence (): number { return 6; }
  visit (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_Empty(this, args);
  }
}

export class Cardinality extends RegexpAtom {
  constructor (
    public repeated: RegexpAtom,
    public card: string,
  ) { super(); }
  getPrecedence (): number { return 4; }
  visit (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_Cardinality(this, args);
  }
}

export abstract class LookOut extends RegexpAtom {
  constructor (
    public lookFor: RegexpAtom,
  ) { super(); }
  getPrecedence (): number { return 7; }
}

export class LookAhead extends LookOut {
  constructor (lookFor: RegexpAtom) { super(lookFor); }
  visit (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_LookAhead(this, args);
  }
}

export class LookBehind extends LookOut {
  constructor (lookFor: RegexpAtom) { super(lookFor); }
  visit (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_LookBehind(this, args);
  }
}

export class Wildcard extends RegexpAtom {
  getPrecedence (): number { return 7; }
  visit (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_Wildcard(this, args);
  }
}

export abstract class Anchor extends RegexpAtom {
  getPrecedence (): number { return 7; }
}

export class Begin extends Anchor {
  visit (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_Begin(this, args);
  }
}

export class End extends Anchor {
  visit (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_End(this, args);
  }
}

// this isn't really a RegexpAtom, but will be replaced before serailization.
export class Reference extends RegexpAtom {
  constructor (
    public ref: string,
  ) { super(); }
  getPrecedence (): never { throw Error('Reference.getPrecedence() should never be called'); }
  visit (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_Reference(this, args);
  }
}

export class Literal extends RegexpAtom {
  constructor (
    public literal: string,
  ) { super(); }
  getPrecedence (): number { return 7; }
  visit (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_Literal(this, args);
  }
}

export class CharacterClass extends RegexpAtom {
  constructor (
    public charClass: string,
  ) { super(); }
  getPrecedence (): number { return 7; }
  visit (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_CharacterClass(this, args);
  }
}

export class CharacterAtomClass extends RegexpAtom {
  constructor (
    public negated: boolean,
    public ranges: (Literal | Reference)[],
  ) { super(); }
  getPrecedence (): number { return 7; }
  visit (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_CharacterAtomClass(this, args);
  }
}

export abstract class EscapedCharacter extends RegexpAtom {
  constructor (
    public escapedChar: string,
  ) { super(); }
  getPrecedence (): number { return 7; }
}

export class Assertion extends EscapedCharacter {
  constructor (char: string) { super(char); }
  visit (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_Assertion(this, args);
  }
}

export class Operator extends EscapedCharacter {
  constructor (char: string) { super(char); }
  visit (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_Operator(this, args);
  }
}


// export class SimpleCharacter extends RegexpAtom {
//   constructor (
//     public simpleChar: string,
//   ) { super(); }
//   getPrecedence (): number { return 7; }
//   visit (visitor: RegexpAtomVisitor, ...args: any[]): any {
//     return visitor.visit_SimpleCharacter(this, args);
//   }
// }

export interface RegexpAtomVisitor {
  visit_Choice (visitee: Choice, ...args: any[]): any;
  visit_Concat (visitee: Concat, ...args: any[]): any;
  visit_CaptureGroup (visitee: CaptureGroup, ...args: any[]): any;
  visit_SpecialGroup (visitee: SpecialGroup, ...args: any[]): any;
  visit_Empty (visitee: Empty, ...args: any[]): any;
  visit_Cardinality (visitee: Cardinality, ...args: any[]): any;
  visit_LookAhead (visitee: LookAhead, ...args: any[]): any;
  visit_LookBehind (visitee: LookBehind, ...args: any[]): any;
  visit_Wildcard (visitee: Wildcard, ...args: any[]): any;
  visit_Begin (visitee: Begin, ...args: any[]): any;
  visit_End (visitee: End, ...args: any[]): any;
  visit_Reference (visitee: Reference, ...args: any[]): any;
  visit_Literal (visitee: Literal, ...args: any[]): any;
  visit_CharacterClass (visitee: CharacterClass, ...args: any[]): any;
  visit_CharacterAtomClass (visitee: CharacterAtomClass, ...args: any[]): any;
  visit_Assertion (visitee: Assertion, ...args: any[]): any;
  visit_Operator (visitee: Operator, ...args: any[]): any;
  // visit_SimpleCharacter (visitee: SimpleCharacter, ...args: any[]): any;
}

export class RegexpAtomCopyVisitor implements RegexpAtomVisitor {
  static copy (atom: RegexpAtom): string {
    return atom.visit(new RegexpAtomCopyVisitor());
  }

  visit_Choice (visitee: Choice, ...args: any[]): any {
    return new Choice(visitee.l.visit(this), visitee.r.visit(this));
  }
  visit_Concat (visitee: Concat, ...args: any[]): any {
    return new Concat(visitee.l.visit(this), visitee.r.visit(this));
  }
  visit_CaptureGroup (visitee: CaptureGroup, ...args: any[]): any {
    return new CaptureGroup(visitee.list.visit(this));
  }
  visit_SpecialGroup (visitee: SpecialGroup, ...args: any[]): any {
    return new SpecialGroup(visitee.specialty, visitee.list.visit(this));
  }
  visit_Empty (visitee: Empty, ...args: any[]): any {
    return new Empty();
  }
  visit_Cardinality (visitee: Cardinality, ...args: any[]): any {
    return new Cardinality(visitee.repeated.visit(this), visitee.card);
  }
  visit_LookAhead (visitee: LookAhead, ...args: any[]): any {
    return new LookAhead(visitee.lookFor.visit(this));
  }
  visit_LookBehind (visitee: LookBehind, ...args: any[]): any {
    return new LookBehind(visitee.lookFor.visit(this));
  }
  visit_Wildcard (visitee: Wildcard, ...args: any[]): any {
    return new Wildcard();
  }
  // protected visit_Anchor (visitee: Anchor, operator: string, ...args: any[]): any {}
  visit_Begin (visitee: Begin, ...args: any[]): any {
    return new Begin();
  }
  visit_End (visitee: End, ...args: any[]): any {
    return new End();
  }
  visit_Reference (visitee: Reference, ...args: any[]): any {
    return new Reference(visitee.ref);
  }
  visit_Literal (visitee: Literal, ...args: any[]): any {
    return new Literal(visitee.literal);
  }
  visit_CharacterClass (visitee: CharacterClass, ...args: any[]): any {
    return new CharacterClass(visitee.charClass);
  }
  visit_CharacterAtomClass (visitee: CharacterAtomClass, ...args: any[]): any {
    return new CharacterAtomClass(visitee.negated, visitee.ranges.map(range => range.visit(this) as Reference | Literal));
  }
  // protected visit_EscapedCharacter (visitee: EscapedCharacter, ...args: any[]): any {}
  visit_Assertion (visitee: Assertion, ...args: any[]): any {
    return new Assertion(visitee.escapedChar);
  }
  visit_Operator (visitee: Operator, ...args: any[]): any {
    return new Operator(visitee.escapedChar);
  }
  // visit_SimpleCharacter (visitee: SimpleCharacter, ...args: any[]): any {
  //   return this.escapeLiteral(visitee.simpleChar);
  // }

}
