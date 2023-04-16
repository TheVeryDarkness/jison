/* This captures RegularExpression strings, not ASTs.
   To wit, a RegExp ASt would reduce strings to lists of Literals.
   TBH: I didn't know Lookahead existed in Lex. Folloing Zaach's port to JS:
   https://github.com/zaach/lex-parser/blob/f75c7db2e2a176f618ccd354e1897ed73d8fdb40/lex.y#L168-L169
.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
 */
type GroupControl = "capture" | "simplify" | "preserve";

interface RegexpAtom_toString_Arg {
  groups: GroupControl,
  debug: boolean,
}

export abstract class RegexpAtomVisitor {
  abstract visit_RegexpList (visitee: RegexpList, ...args: any[]): any;
  abstract visit_CaptureGroup (visitee: CaptureGroup, ...args: any[]): any;
  abstract visit_SpecialGroup (visitee: SpecialGroup, ...args: any[]): any;
  abstract visit_Empty (visitee: Empty, ...args: any[]): any;
  abstract visit_Cardinality (visitee: Cardinality, ...args: any[]): any;
  abstract visit_LookOut (visitee: LookOut, ...args: any[]): any;
  abstract visit_Wildcard (visitee: Wildcard, ...args: any[]): any;
  abstract visit_Anchor (visitee: Anchor, ...args: any[]): any;
  abstract visit_Reference (visitee: Reference, ...args: any[]): any;
  abstract visit_Literal (visitee: Literal, ...args: any[]): any;
  abstract visit_CharacterClass (visitee: CharacterClass, ...args: any[]): any;
  abstract visit_EscapedCharacter (visitee: EscapedCharacter, ...args: any[]): any;
  abstract visit_SimpleCharacter (visitee: SimpleCharacter, ...args: any[]): any;
}

export abstract class RegexpAtom_toString_Visitor extends RegexpAtomVisitor {
  public groups: GroupControl
  public debug: boolean
  constructor ({
    groups,
    debug,
  }: RegexpAtom_toString_Arg) {
    super();
    this.groups = groups;
    this.debug = debug;
  }

  visit_RegexpList (visitee: RegexpList, parentPrecedence: number, ...args: any[]): any {
    const {needParen, myPrecedence} = this.getNewPrec(visitee, parentPrecedence);
    const innerStr = visitee.l.visit999(this, myPrecedence)
      + visitee.getDelim()
      + visitee.r.visit999(this, myPrecedence);
    return needParen
      ? '(' + innerStr + ')'
      : innerStr;
  }
  visit_CaptureGroup (visitee: CaptureGroup, parentPrecedence: number, ...args: any[]): any {
    switch (this.groups) {
      case "simplify": return visitee.list.visit999(this, parentPrecedence)
      case "preserve": return '(' + visitee.list.visit999(this, 1) + ')';
      case "capture":
      default: return '(' + visitee.list.visit999(this, 1) + ')';
    }
  }
  visit_SpecialGroup (visitee: SpecialGroup, parentPrecedence: number, ...args: any[]): any {
    const ret = '(' + visitee.specialty + visitee.list.visit999(this, 0) + ')';
    return ret;
  }
  visit_Empty (visitee: Empty, parentPrecedence: number, ...args: any[]): any {
    return "";
  }
  visit_Cardinality (visitee: Cardinality, parentPrecedence: number, ...args: any[]): any {
    const {needParen, myPrecedence} = this.getNewPrec(visitee, parentPrecedence);
    const innerStr = visitee.repeated.visit999(this, myPrecedence) + visitee.card;
    return needParen
      ? '(' + innerStr + ')'
      : innerStr;
  }
  visit_LookOut (visitee: LookOut, parentPrecedence: number, ...args: any[]): any {
    const {needParen, myPrecedence} = this.getNewPrec(visitee, parentPrecedence);
    const innerStr = visitee.lookFor.visit999(this, parentPrecedence);
    return '(' + visitee.getOperator() + innerStr + ')';
  }
  visit_Wildcard (visitee: Wildcard, parentPrecedence: number, ...args: any[]): any {
    return '.';
  }
  visit_Anchor (visitee: Anchor, parentPrecedence: number, ...args: any[]): any {
    return visitee.getOperator();
  }
  visit_Reference (visitee: Reference, parentPrecedence: number, ...args: any[]): any {
    if (this.debug) return `{${visitee.ref}}`
    throw Error('Reference.visit999() should never be called (unless you\'re debugging)');
  }
  visit_Literal (visitee: Literal, parentPrecedence: number, ...args: any[]): any {
    return this.escapeLiteral(visitee.literal);
  }
  visit_CharacterClass (visitee: CharacterClass, parentPrecedence: number, ...args: any[]): any {
    return '[' + this.escapeCharacterClass(visitee.charClass) + ']';
  }
  visit_EscapedCharacter (visitee: EscapedCharacter, parentPrecedence: number, ...args: any[]): any {
    return '\\' + visitee.escapedChar;
  }
  visit_SimpleCharacter (visitee: SimpleCharacter, parentPrecedence: number, ...args: any[]): any {
    return this.escapeLiteral(visitee.simpleChar);
  }

  getNewPrec (visitee: RegexpAtom, parentPrecedence: number) {
    const myPrecedence = visitee.getPrecedence();
    return parentPrecedence > myPrecedence
      ? { needParen: true, myPrecedence }
      : { needParen: false, myPrecedence };
  }

  abstract escapeLiteral (literal: string): string;
  abstract escapeCharacterClass (literal: string): string;
}

export type StrEscapes = '\r' | '\f' | '\n' | '\t' | '\v';
export type StrsEscaped = '\\r' | '\\f' | '\\n' | '\\t' | '\\v';
export const ToStrEscape: Record<StrEscapes, StrsEscaped>  = {
  '\r': "\\r",
  '\f': "\\f",
  '\n': "\\n",
  '\t': "\\t",
  '\v': "\\v",
};
export const fromStrEscape: Record<StrsEscaped, StrEscapes>  = {
  "\\r": '\r',
  "\\f": '\f',
  "\\n": '\n',
  "\\t": '\t',
  "\\v": '\v',
};
export class RegexpAtomToJs extends RegexpAtom_toString_Visitor {
  escapeLiteral (literal: string): string {
    return literal.replace(/([\r\f\n\t\v])|([\x00-\x1f\x7f-\xff])|([\u0100-\ufffd])|([.*+?^${}()|[\]\/\\])/g, RegexpAtomToJs.escapeGroupMatch);
  }
  escapeCharacterClass (literal: string): string {
    return literal.replace(/([\r\f\n\t\v])|([\x00-\x1f\x7f-\xff])|([\u0100-\ufffd])|([[\]\\])/g, RegexpAtomToJs.escapeGroupMatch);
  }
  protected static escapeGroupMatch (text: string, str: StrEscapes|undefined, crl: string|undefined, uni: string|undefined, operator: string|undefined) {
    if (str) return ToStrEscape[str];
    if (crl) return '\\x' + crl.charCodeAt(0).toString(16).padStart(2, '0');
    if (uni) return '\\u' + uni.charCodeAt(0).toString(16).padStart(4, '0');
    if (operator) return '\\' + operator;
    throw Error(`none of str, crl, uni set in ${arguments}`);
  }
}

export abstract class RegexpAtom {
  abstract visit999 (visitor: RegexpAtomVisitor, ...args: any[]): string;
  abstract getPrecedence (): number;
}

export abstract class RegexpList extends RegexpAtom {
  constructor (
    public l: RegexpAtom,
    public r: RegexpAtom,
  ) { super(); }
  visit999 (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_RegexpList(this, args);
  }
  abstract getDelim (): string;
}

export class Choice extends RegexpList {
  getDelim (): string { return '|'; }
  getPrecedence (): number { return 1; }
}

export class Concat extends RegexpList {
  getDelim (): string { return ''; }
  getPrecedence (): number { return 3; }
}

export class CaptureGroup extends RegexpAtom {
  constructor (
    public list: RegexpList,
  ) { super(); }
  getPrecedence (): number { return 7; }
  visit999 (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_CaptureGroup(this, args);
  }
}

export class SpecialGroup extends RegexpAtom {
  constructor (
    public specialty: string,
    public list: RegexpList,
  ) { super(); }
  getPrecedence (): number { return 7; }
  visit999 (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_SpecialGroup(this, args);
  }
}

export class Empty extends RegexpAtom {
  getPrecedence (): number { return 6; }
  visit999 (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_Empty(this, args);
  }
}

export class Cardinality extends RegexpAtom {
  constructor (
    public repeated: RegexpAtom,
    public card: string,
  ) { super(); }
  getPrecedence (): number { return 4; }
  visit999 (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_Cardinality(this, args);
  }
}

export abstract class LookOut extends RegexpAtom {
  constructor (
    public lookFor: RegexpAtom,
  ) { super(); }
  getPrecedence (): number { return 7; }
  visit999 (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_LookOut(this, args);
  }
  abstract getOperator (): string;
}

export class LookAhead extends LookOut {
  constructor (inner: RegexpAtom) { super(inner); }
  getOperator () { return '?='; }
}

export class LookBehind extends LookOut {
  constructor (inner: RegexpAtom) { super(inner); }
  getOperator () { return '?!'; }
}

export class Wildcard extends RegexpAtom {
  getPrecedence (): number { return 7; }
  visit999 (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_Wildcard(this, args);
  }
}

export abstract class Anchor extends RegexpAtom {
  getPrecedence (): number { return 7; }
  abstract getOperator (): string;
  visit999 (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_Anchor(this, args);
  }
}

export class Begin extends Anchor {
  getOperator () { return '^'; }
}

export class End extends Anchor {
  getOperator () { return '$'; }
}

// this isn't really a RegexpAtom, but will be replaced before serailization.
export class Reference extends RegexpAtom {
  constructor (
    public ref: string,
  ) { super(); }
  getPrecedence (): never { throw Error('Reference.getPrecedence() should never be called'); }
  visit999 (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_Reference(this, args);
  }
}

export class Literal extends RegexpAtom {
  constructor (
    public literal: string,
  ) { super(); }
  getPrecedence (): number { return 7; }
  visit999 (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_Literal(this, args);
  }
}

export class CharacterClass extends RegexpAtom {
  constructor (
    public charClass: string,
  ) { super(); }
  getPrecedence (): number { return 7; }
  visit999 (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_CharacterClass(this, args);
  }
}

export class EscapedCharacter extends RegexpAtom {
  constructor (
    public escapedChar: string,
  ) { super(); }
  getPrecedence (): number { return 7; }
  visit999 (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_EscapedCharacter(this, args);
  }
}

export class Assertion extends EscapedCharacter {
  constructor (char: string) { super(char); }
}

export class Operator extends EscapedCharacter {
  constructor (char: string) { super(char); }
}


export class SimpleCharacter extends RegexpAtom {
  constructor (
    public simpleChar: string,
  ) { super(); }
  getPrecedence (): number { return 7; }
  visit999 (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_SimpleCharacter(this, args);
  }
}
