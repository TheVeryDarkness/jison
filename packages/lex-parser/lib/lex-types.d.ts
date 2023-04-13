type GroupControl = "capture" | "simplify" | "preserve";
interface RegexpAtom_toString_Arg {
    groups: GroupControl;
    debug: boolean;
}
export declare abstract class RegexpAtom_toString_Opts {
    groups: GroupControl;
    debug: boolean;
    constructor({ groups, debug, }: RegexpAtom_toString_Arg);
    abstract escapeLiteral(literal: string): string;
    abstract escapeCharacterClass(literal: string): string;
}
export declare class RegexpAtomToJs extends RegexpAtom_toString_Opts {
    escapeLiteral(literal: string): string;
    escapeCharacterClass(literal: string): string;
}
export declare abstract class RegexpAtom {
    abstract toString999(opts: RegexpAtom_toString_Opts, parentPrecedence: number): string;
    abstract getPrecedence(): number;
    getNewPrec(parentPrecedence: number): {
        needParen: boolean;
        myPrecedence: number;
    };
}
export declare abstract class RegexpList extends RegexpAtom {
    l: RegexpAtom;
    r: RegexpAtom;
    constructor(l: RegexpAtom, r: RegexpAtom);
    toString999(opts: RegexpAtom_toString_Opts, parentPrecedence: number): string;
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
    toString999(opts: RegexpAtom_toString_Opts, parentPrecedence: number): string;
}
export declare class SpecialGroup extends RegexpAtom {
    specialty: string;
    list: RegexpList;
    constructor(specialty: string, list: RegexpList);
    getPrecedence(): number;
    toString999(opts: RegexpAtom_toString_Opts, parentPrecedence: number): string;
}
export declare class Empty extends RegexpAtom {
    getPrecedence(): number;
    toString999(opts: RegexpAtom_toString_Opts, parentPrecedence: number): string;
}
export declare class Cardinality extends RegexpAtom {
    repeated: RegexpAtom;
    card: string;
    constructor(repeated: RegexpAtom, card: string);
    getPrecedence(): number;
    toString999(opts: RegexpAtom_toString_Opts, parentPrecedence: number): string;
}
export declare abstract class LookOut extends RegexpAtom {
    lookFor: RegexpAtom;
    constructor(lookFor: RegexpAtom);
    getPrecedence(): number;
    toString999(opts: RegexpAtom_toString_Opts, parentPrecedence: number): string;
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
    toString999(opts: RegexpAtom_toString_Opts, parentPrecedence: number): string;
}
export declare abstract class Anchor extends RegexpAtom {
    getPrecedence(): number;
    abstract getOperator(): string;
    toString999(_opts: RegexpAtom_toString_Opts, _parentPrecedence: number): string;
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
    toString999(opts: RegexpAtom_toString_Opts, _parentPrecedence: number): string;
}
export declare class Literal extends RegexpAtom {
    literal: string;
    constructor(literal: string);
    getPrecedence(): number;
    toString999(opts: RegexpAtom_toString_Opts, _parentPrecedence: number): string;
}
export declare class CharacterClass extends RegexpAtom {
    charClass: string;
    constructor(charClass: string);
    getPrecedence(): number;
    toString999(opts: RegexpAtom_toString_Opts, _parentPrecedence: number): string;
}
export declare class EscapedCharacter extends RegexpAtom {
    escapedChar: string;
    constructor(escapedChar: string);
    getPrecedence(): number;
    toString999(opts: RegexpAtom_toString_Opts, _parentPrecedence: number): string;
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
    toString999(opts: RegexpAtom_toString_Opts, _parentPrecedence: number): string;
}
export {};
//# sourceMappingURL=lex-types.d.ts.map