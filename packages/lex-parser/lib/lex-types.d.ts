type GroupControl = "capture" | "simplify" | "preserve";
interface RegexpAtom_toString_Arg {
    groups: GroupControl;
    debug: boolean;
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
    visit_Assertion(visitee: EscapedCharacter, ...args: any[]): any;
    visit_Operator(visitee: EscapedCharacter, ...args: any[]): any;
    visit_SimpleCharacter(visitee: SimpleCharacter, ...args: any[]): any;
}
export declare abstract class RegexpAtom_toString_Visitor implements RegexpAtomVisitor {
    groups: GroupControl;
    debug: boolean;
    constructor({ groups, debug, }: RegexpAtom_toString_Arg);
    static serialize(atom: RegexpAtom, trailingAnchor: boolean, groups: GroupControl, debug: boolean): string;
    protected visit_RegexpList(visitee: RegexpList, delim: string, parentPrecedence: number, ...args: any[]): any;
    visit_Choice(visitee: Choice, parentPrecedence: number, ...args: any[]): any;
    visit_Concat(visitee: Concat, parentPrecedence: number, ...args: any[]): any;
    visit_CaptureGroup(visitee: CaptureGroup, parentPrecedence: number, ...args: any[]): any;
    visit_SpecialGroup(visitee: SpecialGroup, parentPrecedence: number, ...args: any[]): any;
    visit_Empty(visitee: Empty, parentPrecedence: number, ...args: any[]): any;
    visit_Cardinality(visitee: Cardinality, parentPrecedence: number, ...args: any[]): any;
    protected visit_LookOut(visitee: LookOut, operator: string, parentPrecedence: number, ...args: any[]): any;
    visit_LookAhead(visitee: LookAhead, parentPrecedence: number, ...args: any[]): any;
    visit_LookBehind(visitee: LookBehind, parentPrecedence: number, ...args: any[]): any;
    visit_Wildcard(visitee: Wildcard, parentPrecedence: number, ...args: any[]): any;
    visit_Begin(visitee: Begin, parentPrecedence: number, ...args: any[]): any;
    visit_End(visitee: End, parentPrecedence: number, ...args: any[]): any;
    visit_Reference(visitee: Reference, parentPrecedence: number, ...args: any[]): any;
    visit_Literal(visitee: Literal, parentPrecedence: number, ...args: any[]): any;
    visit_CharacterClass(visitee: CharacterClass, parentPrecedence: number, ...args: any[]): any;
    visit_Assertion(visitee: Assertion, parentPrecedence: number, ...args: any[]): any;
    visit_Operator(visitee: Operator, parentPrecedence: number, ...args: any[]): any;
    visit_SimpleCharacter(visitee: SimpleCharacter, parentPrecedence: number, ...args: any[]): any;
    getNewPrec(visitee: RegexpAtom, parentPrecedence: number): {
        needParen: boolean;
        myPrecedence: number;
    };
    abstract escapeLiteral(literal: string): string;
    abstract escapeCharacterClass(literal: string): string;
}
export type StrEscapes = '\r' | '\f' | '\n' | '\t' | '\v';
export type StrsEscaped = '\\r' | '\\f' | '\\n' | '\\t' | '\\v';
export declare const ToStrEscape: Record<StrEscapes, StrsEscaped>;
export declare const fromStrEscape: Record<StrsEscaped, StrEscapes>;
export declare class RegexpAtomToJs extends RegexpAtom_toString_Visitor {
    escapeLiteral(literal: string): string;
    escapeCharacterClass(literal: string): string;
    protected static escapeGroupMatch(text: string, str: StrEscapes | undefined, crl: string | undefined, uni: string | undefined, operator: string | undefined): string;
}
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
    abstract visit(visitor: RegexpAtomVisitor, ...args: any[]): string;
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
    constructor(inner: RegexpAtom);
    visit(visitor: RegexpAtomVisitor, ...args: any[]): any;
}
export declare class LookBehind extends LookOut {
    constructor(inner: RegexpAtom);
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
export declare class SimpleCharacter extends RegexpAtom {
    simpleChar: string;
    constructor(simpleChar: string);
    getPrecedence(): number;
    visit(visitor: RegexpAtomVisitor, ...args: any[]): any;
}
export {};
//# sourceMappingURL=lex-types.d.ts.map