import {
  RegexpAtomCopyVisitor,
  RegexpAtom,
  Reference
} from "./RegexpAtom";

export type Macros = Record<string, RegexpAtom>;

export class RegexpAtomSubstitutionVisitor extends RegexpAtomCopyVisitor {
  constructor (
    public macros: Macros,
  ) {
    super();
  }

  static substitute (atom: RegexpAtom, macros: Macros): string {
    return atom.visit(new RegexpAtomSubstitutionVisitor(macros));
  }

  visit_Reference (visitee: Reference, ...args: any[]): any {
    const val = this.macros[visitee.ref];
    if (!val)
      throw Error(`Reference to ${visitee.ref} not found in ${Object.keys(this.macros)}`);
    return val.visit(this, ...args);
  }
}
