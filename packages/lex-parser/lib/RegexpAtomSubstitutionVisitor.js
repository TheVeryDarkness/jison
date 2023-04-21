"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegexpAtomSubstitutionVisitor = void 0;
const RegexpAtom_1 = require("./RegexpAtom");
class RegexpAtomSubstitutionVisitor extends RegexpAtom_1.RegexpAtomCopyVisitor {
    constructor(macros) {
        super();
        this.macros = macros;
    }
    static substitute(atom, macros) {
        return atom.visit(new RegexpAtomSubstitutionVisitor(macros));
    }
    visit_Reference(visitee, ...args) {
        const val = this.macros[visitee.ref];
        if (!val)
            throw Error(`Reference to ${visitee.ref} not found in ${Object.keys(this.macros)}`);
        return val.visit(this, ...args);
    }
}
exports.RegexpAtomSubstitutionVisitor = RegexpAtomSubstitutionVisitor;
//# sourceMappingURL=RegexpAtomSubstitutionVisitor.js.map