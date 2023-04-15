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

export abstract class RegexpAtom_toString_Opts {
  public groups: GroupControl
  public debug: boolean
  constructor ({
    groups,
    debug,
  }: RegexpAtom_toString_Arg) {
    this.groups = groups;
    this.debug = debug;
  }
  abstract escapeLiteral (literal: string): string;
  abstract escapeCharacterClass (literal: string): string;
}

type StrEscapes = '\r' | '\f' | '\n' | '\t' | '\v';
type StrsEscaped = '\\r' | '\\f' | '\\n' | '\\t' | '\\v';
const ToStrEscape: Record<StrEscapes, StrsEscaped>  = {
  '\r': "\\r",
  '\f': "\\f",
  '\n': "\\n",
  '\t': "\\t",
  '\v': "\\v",
};
export class RegexpAtomToJs extends RegexpAtom_toString_Opts {
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
  abstract toString999 (opts: RegexpAtom_toString_Opts, parentPrecedence: number): string;
  abstract getPrecedence (): number;
  getNewPrec (parentPrecedence: number) {
    const myPrecedence = this.getPrecedence();
    return parentPrecedence > myPrecedence
      ? { needParen: true, myPrecedence }
      : { needParen: false, myPrecedence };
  }
}

export abstract class RegexpList extends RegexpAtom {
  constructor (
    public l: RegexpAtom,
    public r: RegexpAtom,
  ) { super(); }
  toString999 (opts: RegexpAtom_toString_Opts, parentPrecedence: number): string {
    const {needParen, myPrecedence} = this.getNewPrec(parentPrecedence);
    const innerStr = this.l.toString999(opts, myPrecedence)
      + this.getDelim()
      + this.r.toString999(opts, myPrecedence);
    return needParen
      ? '(' + innerStr + ')'
      : innerStr;
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
  toString999 (opts: RegexpAtom_toString_Opts, parentPrecedence: number) {
    switch (opts.groups) {
      case "simplify": return this.list.toString999(opts, parentPrecedence)
      case "preserve": return '(' + this.list.toString999(opts, 1) + ')';
      case "capture":
      default: return '(' + this.list.toString999(opts, 1) + ')';
    }
  }
}

export class SpecialGroup extends RegexpAtom {
  constructor (
    public specialty: string,
    public list: RegexpList,
  ) { super(); }
  getPrecedence (): number { return 7; }
  toString999 (opts: RegexpAtom_toString_Opts, parentPrecedence: number) {
    const ret = '(' + this.specialty + this.list.toString999(opts, 0) + ')';
    return ret;
  }
}

export class Empty extends RegexpAtom {
  getPrecedence (): number { return 6; }
  toString999 (opts: RegexpAtom_toString_Opts, parentPrecedence: number) { return ""; }
}

export class Cardinality extends RegexpAtom {
  constructor (
    public repeated: RegexpAtom,
    public card: string,
  ) { super(); }
  getPrecedence (): number { return 4; }
  toString999 (opts: RegexpAtom_toString_Opts, parentPrecedence: number) {
    const {needParen, myPrecedence} = this.getNewPrec(parentPrecedence);
    const innerStr = this.repeated.toString999(opts, myPrecedence) + this.card;
    return needParen
      ? '(' + innerStr + ')'
      : innerStr;
  }
}

export abstract class LookOut extends RegexpAtom {
  constructor (
    public lookFor: RegexpAtom,
  ) { super(); }
  getPrecedence (): number { return 7; }
  toString999 (opts: RegexpAtom_toString_Opts, parentPrecedence: number) {
    const {needParen, myPrecedence} = this.getNewPrec(parentPrecedence);
    const innerStr = this.lookFor.toString999(opts, parentPrecedence);
    return '(' + this.getOperator() + innerStr + ')';
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
  toString999 (opts: RegexpAtom_toString_Opts, parentPrecedence: number) {
    return '.';
  }
}

export abstract class Anchor extends RegexpAtom {
  getPrecedence (): number { return 7; }
  abstract getOperator (): string;
  toString999 (_opts: RegexpAtom_toString_Opts, _parentPrecedence: number) {
    return this.getOperator();
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
  toString999 (opts: RegexpAtom_toString_Opts, _parentPrecedence: number) {
    if (opts.debug) return `{${this.ref}}`
    throw Error('Reference.toString999() should never be called (unless you\'re debugging)');
  }
}

export class Literal extends RegexpAtom {
  constructor (
    public literal: string,
  ) { super(); }
  getPrecedence (): number { return 7; }
  toString999 (opts: RegexpAtom_toString_Opts, _parentPrecedence: number) { return opts.escapeLiteral(this.literal); }
}

export class CharacterClass extends RegexpAtom {
  constructor (
    public charClass: string,
  ) { super(); }
  getPrecedence (): number { return 7; }
  toString999 (opts: RegexpAtom_toString_Opts, _parentPrecedence: number) {
    return '[' + opts.escapeCharacterClass(this.charClass) + ']';
  }
}

export class EscapedCharacter extends RegexpAtom {
  constructor (
    public escapedChar: string,
  ) { super(); }
  getPrecedence (): number { return 7; }
  toString999 (opts: RegexpAtom_toString_Opts, _parentPrecedence: number) {
    return /*opts.escapeLiteral(*/ '\\' + this.escapedChar;
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
  toString999 (opts: RegexpAtom_toString_Opts, _parentPrecedence: number) {
    return opts.escapeLiteral(this.simpleChar);
  }
}
