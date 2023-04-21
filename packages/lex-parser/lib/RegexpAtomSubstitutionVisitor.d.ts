import { RegexpAtomCopyVisitor, RegexpAtom, Reference } from "./RegexpAtom";
export type Macros = Record<string, RegexpAtom>;
export declare class RegexpAtomSubstitutionVisitor extends RegexpAtomCopyVisitor {
    macros: Macros;
    constructor(macros: Macros);
    static substitute(atom: RegexpAtom, macros: Macros): string;
    visit_Reference(visitee: Reference, ...args: any[]): any;
}
//# sourceMappingURL=RegexpAtomSubstitutionVisitor.d.ts.map