import { Assertion, Begin, CaptureGroup, Cardinality, CharacterClass, Choice, Concat, Empty, End, Literal, LookAhead, LookBehind, LookOut, Operator, Reference, RegexpAtom, RegexpAtomVisitor, RegexpList, SimpleCharacter, SpecialGroup, Wildcard } from "./RegexpAtom";
type GroupControl = "capture" | "simplify" | "preserve";
interface RegexpAtom_toString_Arg {
    groups: GroupControl;
    debug: boolean;
}
export declare abstract class RegexpAtomToStringVisitor implements RegexpAtomVisitor {
    groups: GroupControl;
    debug: boolean;
    constructor({ groups, debug, }: RegexpAtom_toString_Arg);
    static serialize(atom: RegexpAtom, groups: GroupControl, debug: boolean): string;
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
export declare class RegexpAtomToJs extends RegexpAtomToStringVisitor {
    escapeLiteral(literal: string): string;
    escapeCharacterClass(literal: string): string;
    protected static escapeGroupMatch(text: string, str: StrEscapes | undefined, crl: string | undefined, uni: string | undefined, operator: string | undefined): string;
}
export {};
//# sourceMappingURL=RegexpAtomToStringVisitor.d.ts.map