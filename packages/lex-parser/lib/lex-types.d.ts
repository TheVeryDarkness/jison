type GroupControl = "capture" | "simplify" | "preserve";
interface RegexpAtom_toString_Arg {
    groups: GroupControl;
    debug: boolean;
}
export declare abstract class RegexpAtomVisitor {
    abstract visit_RegexpList(visitee: RegexpList, ...args: any[]): any;
    abstract visit_CaptureGroup(visitee: CaptureGroup, ...args: any[]): any;
    abstract visit_SpecialGroup(visitee: SpecialGroup, ...args: any[]): any;
    abstract visit_Empty(visitee: Empty, ...args: any[]): any;
    abstract visit_Cardinality(visitee: Cardinality, ...args: any[]): any;
    abstract visit_LookOut(visitee: LookOut, ...args: any[]): any;
    abstract visit_Wildcard(visitee: Wildcard, ...args: any[]): any;
    abstract visit_Anchor(visitee: Anchor, ...args: any[]): any;
    abstract visit_Reference(visitee: Reference, ...args: any[]): any;
    abstract visit_Literal(visitee: Literal, ...args: any[]): any;
    abstract visit_CharacterClass(visitee: CharacterClass, ...args: any[]): any;
    abstract visit_EscapedCharacter(visitee: EscapedCharacter, ...args: any[]): any;
    abstract visit_SimpleCharacter(visitee: SimpleCharacter, ...args: any[]): any;
}
export declare abstract class RegexpAtom_toString_Visitor extends RegexpAtomVisitor {
    groups: GroupControl;
    debug: boolean;
    constructor({ groups, debug, }: RegexpAtom_toString_Arg);
    visit_RegexpList(visitee: RegexpList, parentPrecedence: number, ...args: any[]): any;
    visit_CaptureGroup(visitee: CaptureGroup, parentPrecedence: number, ...args: any[]): any;
    visit_SpecialGroup(visitee: SpecialGroup, parentPrecedence: number, ...args: any[]): any;
    visit_Empty(visitee: Empty, parentPrecedence: number, ...args: any[]): any;
    visit_Cardinality(visitee: Cardinality, parentPrecedence: number, ...args: any[]): any;
    visit_LookOut(visitee: LookOut, parentPrecedence: number, ...args: any[]): any;
    visit_Wildcard(visitee: Wildcard, parentPrecedence: number, ...args: any[]): any;
    visit_Anchor(visitee: Anchor, parentPrecedence: number, ...args: any[]): any;
    visit_Reference(visitee: Reference, parentPrecedence: number, ...args: any[]): any;
    visit_Literal(visitee: Literal, parentPrecedence: number, ...args: any[]): any;
    visit_CharacterClass(visitee: CharacterClass, parentPrecedence: number, ...args: any[]): any;
    visit_EscapedCharacter(visitee: EscapedCharacter, parentPrecedence: number, ...args: any[]): any;
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
export declare abstract class RegexpAtom {
    abstract visit999(visitor: RegexpAtomVisitor, ...args: any[]): string;
    abstract getPrecedence(): number;
}
export declare abstract class RegexpList extends RegexpAtom {
    l: RegexpAtom;
    r: RegexpAtom;
    constructor(l: RegexpAtom, r: RegexpAtom);
    visit999(visitor: RegexpAtomVisitor, ...args: any[]): any;
    abstract getDelim(): string;
}
export declare class Choice extends RegexpList {
    getDelim(): string;
    getPrecedence(): number;
}
export declare class Concat extends RegexpList {
    getDelim(): string;
    getPrecedence(): number;
}
export declare class CaptureGroup extends RegexpAtom {
    list: RegexpList;
    constructor(list: RegexpList);
    getPrecedence(): number;
    visit999(visitor: RegexpAtomVisitor, ...args: any[]): any;
}
export declare class SpecialGroup extends RegexpAtom {
    specialty: string;
    list: RegexpList;
    constructor(specialty: string, list: RegexpList);
    getPrecedence(): number;
    visit999(visitor: RegexpAtomVisitor, ...args: any[]): any;
}
export declare class Empty extends RegexpAtom {
    getPrecedence(): number;
    visit999(visitor: RegexpAtomVisitor, ...args: any[]): any;
}
export declare class Cardinality extends RegexpAtom {
    repeated: RegexpAtom;
    card: string;
    constructor(repeated: RegexpAtom, card: string);
    getPrecedence(): number;
    visit999(visitor: RegexpAtomVisitor, ...args: any[]): any;
}
export declare abstract class LookOut extends RegexpAtom {
    lookFor: RegexpAtom;
    constructor(lookFor: RegexpAtom);
    getPrecedence(): number;
    visit999(visitor: RegexpAtomVisitor, ...args: any[]): any;
    abstract getOperator(): string;
}
export declare class LookAhead extends LookOut {
    constructor(inner: RegexpAtom);
    getOperator(): string;
}
export declare class LookBehind extends LookOut {
    constructor(inner: RegexpAtom);
    getOperator(): string;
}
export declare class Wildcard extends RegexpAtom {
    getPrecedence(): number;
    visit999(visitor: RegexpAtomVisitor, ...args: any[]): any;
}
export declare abstract class Anchor extends RegexpAtom {
    getPrecedence(): number;
    abstract getOperator(): string;
    visit999(visitor: RegexpAtomVisitor, ...args: any[]): any;
}
export declare class Begin extends Anchor {
    getOperator(): string;
}
export declare class End extends Anchor {
    getOperator(): string;
}
export declare class Reference extends RegexpAtom {
    ref: string;
    constructor(ref: string);
    getPrecedence(): never;
    visit999(visitor: RegexpAtomVisitor, ...args: any[]): any;
}
export declare class Literal extends RegexpAtom {
    literal: string;
    constructor(literal: string);
    getPrecedence(): number;
    visit999(visitor: RegexpAtomVisitor, ...args: any[]): any;
}
export declare class CharacterClass extends RegexpAtom {
    charClass: string;
    constructor(charClass: string);
    getPrecedence(): number;
    visit999(visitor: RegexpAtomVisitor, ...args: any[]): any;
}
export declare class EscapedCharacter extends RegexpAtom {
    escapedChar: string;
    constructor(escapedChar: string);
    getPrecedence(): number;
    visit999(visitor: RegexpAtomVisitor, ...args: any[]): any;
}
export declare class Assertion extends EscapedCharacter {
    constructor(char: string);
}
export declare class Operator extends EscapedCharacter {
    constructor(char: string);
}
export declare class SimpleCharacter extends RegexpAtom {
    simpleChar: string;
    constructor(simpleChar: string);
    getPrecedence(): number;
    visit999(visitor: RegexpAtomVisitor, ...args: any[]): any;
}
export {};
//# sourceMappingURL=lex-types.d.ts.map