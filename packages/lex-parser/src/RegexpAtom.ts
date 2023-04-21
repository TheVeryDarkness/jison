/* This captures RegularExpression strings, not ASTs.
   To wit, a RegExp ASt would reduce strings to lists of Literals.
   TBH: I didn't know Lookahead existed in Lex. Folloing Zaach's port to JS:
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
class EscapedCharacter extends RegexpAtom
  class Assertion extends EscapedCharacter
  class Operator extends EscapedCharacter
class SimpleCharacter extends RegexpAtom
@enduml
 */

export abstract class RegexpAtom {
  abstract visit (visitor: RegexpAtomVisitor, ...args: any[]): string;
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
    public list: RegexpList,
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
  constructor (inner: RegexpAtom) { super(inner); }
  visit (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_LookAhead(this, args);
  }
}

export class LookBehind extends LookOut {
  constructor (inner: RegexpAtom) { super(inner); }
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
  visit_Assertion (visitee: EscapedCharacter, ...args: any[]): any;
  visit_Operator (visitee: EscapedCharacter, ...args: any[]): any;
  // visit_SimpleCharacter (visitee: SimpleCharacter, ...args: any[]): any;
}
