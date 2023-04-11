export interface RegexpAtom_toString999_Opts {
    captureGroups: boolean;
    groups: "capture" | "simplify" | "preserve";
    debug: boolean;
}
export declare abstract class RegexpAtom {
    abstract toString999(opts: RegexpAtom_toString999_Opts, parentPrecedence: number): string;
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
    toString999(opts: RegexpAtom_toString999_Opts, parentPrecedence: number): string;
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
    toString999(opts: RegexpAtom_toString999_Opts, parentPrecedence: number): string;
}
export declare class SpecialGroup extends RegexpAtom {
    specialty: string;
    list: RegexpList;
    constructor(specialty: string, list: RegexpList);
    getPrecedence(): number;
    toString999(opts: RegexpAtom_toString999_Opts, parentPrecedence: number): string;
}
export declare class Empty extends RegexpAtom {
    getPrecedence(): number;
    toString999(opts: RegexpAtom_toString999_Opts, parentPrecedence: number): string;
}
export declare class Cardinality extends RegexpAtom {
    inner: RegexpAtom;
    card: string;
    constructor(inner: RegexpAtom, card: string);
    getPrecedence(): number;
    toString999(opts: RegexpAtom_toString999_Opts, parentPrecedence: number): string;
}
export declare abstract class LookOut extends RegexpAtom {
    inner: RegexpAtom;
    constructor(inner: RegexpAtom);
    getPrecedence(): number;
    toString999(opts: RegexpAtom_toString999_Opts, parentPrecedence: number): string;
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
    toString999(opts: RegexpAtom_toString999_Opts, parentPrecedence: number): string;
}
export declare abstract class Anchor extends RegexpAtom {
    getPrecedence(): number;
    abstract getOperator(): string;
    toString999(_opts: RegexpAtom_toString999_Opts, _parentPrecedence: number): string;
}
export declare class Begin extends Anchor {
    getOperator(): string;
}
export declare class End extends Anchor {
    getOperator(): string;
}
export declare class Reference extends RegexpAtom {
    target: string;
    constructor(target: string);
    getPrecedence(): never;
    toString999(opts: RegexpAtom_toString999_Opts, _parentPrecedence: number): string;
}
export declare class String extends RegexpAtom {
    text: string;
    constructor(text: string);
    getPrecedence(): number;
    toString999(opts: RegexpAtom_toString999_Opts, _parentPrecedence: number): string;
}
export declare class CharacterClass extends RegexpAtom {
    range: string;
    constructor(range: string);
    getPrecedence(): number;
    toString999(opts: RegexpAtom_toString999_Opts, _parentPrecedence: number): string;
}
export declare class EscapedCharacter extends RegexpAtom {
    char: string;
    constructor(char: string);
    getPrecedence(): number;
    toString999(opts: RegexpAtom_toString999_Opts, _parentPrecedence: number): string;
}
export declare class SimpleCharacter extends RegexpAtom {
    char: string;
    constructor(char: string);
    getPrecedence(): number;
    toString999(opts: RegexpAtom_toString999_Opts, _parentPrecedence: number): string;
}
//# sourceMappingURL=lex-types.d.ts.map