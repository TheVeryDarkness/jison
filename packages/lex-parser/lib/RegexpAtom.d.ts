/** This captures RegularExpression strings, not ASTs.
   To wit, a RegExp ASt would reduce strings to lists of Literals.
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
class EscapedCharacter extends RegexpAtom
  class Assertion extends EscapedCharacter
  class Operator extends EscapedCharacter
class SimpleCharacter extends RegexpAtom
@enduml
 */
export declare abstract class RegexpAtom {
    abstract visit(visitor: RegexpAtomVisitor, ...args: any[]): any;
    abstract getPrecedence(): number;
}
export declare abstract class RegexpList extends RegexpAtom {
    l: RegexpAtom;
    r: RegexpAtom;
    constructor(l: RegexpAtom, r: RegexpAtom);
}
export declare class Choice extends RegexpList {
    visit(visitor: RegexpAtomVisitor, ...args: any[]): any;
    getPrecedence(): number;
}
export declare class Concat extends RegexpList {
    visit(visitor: RegexpAtomVisitor, ...args: any[]): any;
    getPrecedence(): number;
}
export declare class CaptureGroup extends RegexpAtom {
    list: RegexpList;
    constructor(list: RegexpList);
    getPrecedence(): number;
    visit(visitor: RegexpAtomVisitor, ...args: any[]): any;
}
export declare class SpecialGroup extends RegexpAtom {
    specialty: string;
    list: RegexpList;
    constructor(specialty: string, list: RegexpList);
    getPrecedence(): number;
    visit(visitor: RegexpAtomVisitor, ...args: any[]): any;
}
export declare class Empty extends RegexpAtom {
    getPrecedence(): number;
    visit(visitor: RegexpAtomVisitor, ...args: any[]): any;
}
export declare class Cardinality extends RegexpAtom {
    repeated: RegexpAtom;
    card: string;
    constructor(repeated: RegexpAtom, card: string);
    getPrecedence(): number;
    visit(visitor: RegexpAtomVisitor, ...args: any[]): any;
}
export declare abstract class LookOut extends RegexpAtom {
    lookFor: RegexpAtom;
    constructor(lookFor: RegexpAtom);
    getPrecedence(): number;
}
export declare class LookAhead extends LookOut {
    constructor(lookFor: RegexpAtom);
    visit(visitor: RegexpAtomVisitor, ...args: any[]): any;
}
export declare class LookBehind extends LookOut {
    constructor(lookFor: RegexpAtom);
    visit(visitor: RegexpAtomVisitor, ...args: any[]): any;
}
export declare class Wildcard extends RegexpAtom {
    getPrecedence(): number;
    visit(visitor: RegexpAtomVisitor, ...args: any[]): any;
}
export declare abstract class Anchor extends RegexpAtom {
    getPrecedence(): number;
}
export declare class Begin extends Anchor {
    visit(visitor: RegexpAtomVisitor, ...args: any[]): any;
}
export declare class End extends Anchor {
    visit(visitor: RegexpAtomVisitor, ...args: any[]): any;
}
export declare class Reference extends RegexpAtom {
    ref: string;
    constructor(ref: string);
    getPrecedence(): never;
    visit(visitor: RegexpAtomVisitor, ...args: any[]): any;
}
export declare class Literal extends RegexpAtom {
    literal: string;
    constructor(literal: string);
    getPrecedence(): number;
    visit(visitor: RegexpAtomVisitor, ...args: any[]): any;
}
export declare class CharacterClass extends RegexpAtom {
    charClass: string;
    constructor(charClass: string);
    getPrecedence(): number;
    visit(visitor: RegexpAtomVisitor, ...args: any[]): any;
}
export declare abstract class EscapedCharacter extends RegexpAtom {
    escapedChar: string;
    constructor(escapedChar: string);
    getPrecedence(): number;
}
export declare class Assertion extends EscapedCharacter {
    constructor(char: string);
    visit(visitor: RegexpAtomVisitor, ...args: any[]): any;
}
export declare class Operator extends EscapedCharacter {
    constructor(char: string);
    visit(visitor: RegexpAtomVisitor, ...args: any[]): any;
}
export interface RegexpAtomVisitor {
    visit_Choice(visitee: Choice, ...args: any[]): any;
    visit_Concat(visitee: Concat, ...args: any[]): any;
    visit_CaptureGroup(visitee: CaptureGroup, ...args: any[]): any;
    visit_SpecialGroup(visitee: SpecialGroup, ...args: any[]): any;
    visit_Empty(visitee: Empty, ...args: any[]): any;
    visit_Cardinality(visitee: Cardinality, ...args: any[]): any;
    visit_LookAhead(visitee: LookAhead, ...args: any[]): any;
    visit_LookBehind(visitee: LookBehind, ...args: any[]): any;
    visit_Wildcard(visitee: Wildcard, ...args: any[]): any;
    visit_Begin(visitee: Begin, ...args: any[]): any;
    visit_End(visitee: End, ...args: any[]): any;
    visit_Reference(visitee: Reference, ...args: any[]): any;
    visit_Literal(visitee: Literal, ...args: any[]): any;
    visit_CharacterClass(visitee: CharacterClass, ...args: any[]): any;
    visit_Assertion(visitee: Assertion, ...args: any[]): any;
    visit_Operator(visitee: Operator, ...args: any[]): any;
}
export declare class RegexpAtomCopyVisitor implements RegexpAtomVisitor {
    static copy(atom: RegexpAtom): string;
    visit_Choice(visitee: Choice, ...args: any[]): any;
    visit_Concat(visitee: Concat, ...args: any[]): any;
    visit_CaptureGroup(visitee: CaptureGroup, ...args: any[]): any;
    visit_SpecialGroup(visitee: SpecialGroup, ...args: any[]): any;
    visit_Empty(visitee: Empty, ...args: any[]): any;
    visit_Cardinality(visitee: Cardinality, ...args: any[]): any;
    visit_LookAhead(visitee: LookAhead, ...args: any[]): any;
    visit_LookBehind(visitee: LookBehind, ...args: any[]): any;
    visit_Wildcard(visitee: Wildcard, ...args: any[]): any;
    visit_Begin(visitee: Begin, ...args: any[]): any;
    visit_End(visitee: End, ...args: any[]): any;
    visit_Reference(visitee: Reference, ...args: any[]): any;
    visit_Literal(visitee: Literal, ...args: any[]): any;
    visit_CharacterClass(visitee: CharacterClass, ...args: any[]): any;
    visit_Assertion(visitee: Assertion, ...args: any[]): any;
    visit_Operator(visitee: Operator, ...args: any[]): any;
}
//# sourceMappingURL=RegexpAtom.d.ts.map