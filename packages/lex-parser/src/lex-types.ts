/* This captures RegularExpression strings, not ASTs.
   TBH: I didn't know Lookahead existed in Lex. Folloing Zaach's port to JS:
   https://github.com/zaach/lex-parser/blob/f75c7db2e2a176f618ccd354e1897ed73d8fdb40/lex.y#L168-L169
 */
export interface RegexpAtom_toString_Opts {
  capture: boolean;
  debug: boolean
}

export abstract class RegexpAtom {
  abstract toString (opts: RegexpAtom_toString_Opts, parentPrecedence: number): string;
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
  toString (opts: RegexpAtom_toString_Opts, parentPrecedence: number): string {
    const {needParen, myPrecedence} = this.getNewPrec(parentPrecedence);
    const innerStr = this.l.toString(opts, myPrecedence)
      + this.getDelim()
      + this.r.toString(opts, myPrecedence);
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
  toString (opts: RegexpAtom_toString_Opts, parentPrecedence: number) {
    return '(' + (opts.capture ? "?:" : "") + this.list.toString(opts, parentPrecedence);
  }
}

export class SpecialGroup extends RegexpAtom {
  constructor (
    public specialty: string,
    public list: RegexpList,
  ) { super(); }
  getPrecedence (): number { return 7; }
  toString (opts: RegexpAtom_toString_Opts, parentPrecedence: number) {
    return '(' + this.specialty + this.list.toString(opts, parentPrecedence);
  }
}

export class Empty extends RegexpAtom {
  getPrecedence (): number { return 6; }
  toString (opts: RegexpAtom_toString_Opts, parentPrecedence: number) { return ""; }
}

export class Cardinality extends RegexpAtom {
  constructor (
    public inner: RegexpAtom,
    public card: string,
  ) { super(); }
  getPrecedence (): number { return 4; }
  toString (opts: RegexpAtom_toString_Opts, parentPrecedence: number) {
    const {needParen, myPrecedence} = this.getNewPrec(parentPrecedence);
    const innerStr = this.inner.toString(opts, myPrecedence) + this.card;
    return needParen
      ? '(' + innerStr + ')'
      : innerStr;
  }
}

export abstract class LookOut extends RegexpAtom {
  constructor (
    public inner: RegexpAtom,
  ) { super(); }
  getPrecedence (): number { return 7; }
  toString (opts: RegexpAtom_toString_Opts, parentPrecedence: number) {
    const {needParen, myPrecedence} = this.getNewPrec(parentPrecedence);
    const innerStr = this.inner.toString(opts, parentPrecedence);
    return needParen
      ? '(' + this.getOperator() + innerStr + ')'
      : innerStr;
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
  toString (opts: RegexpAtom_toString_Opts, parentPrecedence: number) {
    return '.';
  }
}

export abstract class Anchor extends RegexpAtom {
  getPrecedence (): number { return 7; }
  abstract getOperator (): string;
  toString (_opts: RegexpAtom_toString_Opts, _parentPrecedence: number) {
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
    public target: string,
  ) { super(); }
  getPrecedence (): never { throw Error('Reference.getPrecedence() should never be called'); }
  toString (opts: RegexpAtom_toString_Opts, _parentPrecedence: number) {
    if (opts.debug) return `{${this.target}}`
    throw Error('Reference.toString() should never be called (unless you\'re debugging)');
  }
}

export class String extends RegexpAtom {
  constructor (
    public text: string,
  ) { super(); }
  getPrecedence (): number { return 7; }
  toString (opts: RegexpAtom_toString_Opts, _parentPrecedence: number) { return this.text; }
}

export class CharacterClass extends RegexpAtom {
  constructor (
    public range: string,
  ) { super(); }
  getPrecedence (): number { return 7; }
  toString (opts: RegexpAtom_toString_Opts, _parentPrecedence: number) {
    return '[' + this.range + ']';
  }
}
