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

export interface RegexpAtomVisitor {
  visit_Choice (visitee: Choice, ...args: any[]): any;
  visit_Concat (visitee: Concat, ...args: any[]): any;
  visit_CaptureGroup (visitee: CaptureGroup, ...args: any[]): any;
  visit_SpecialGroup (visitee: SpecialGroup, ...args: any[]): any;
  visit_Empty (visitee: Empty, ...args: any[]): any;
  visit_Cardinality (visitee: Cardinality, ...args: any[]): any;
  visit_LookAhead (visitee: LookAhead, ...args: any[]): any;
  visit_LookBehind (visitee: LookBehind, ...args: any[]): any;
  visit_Wildcard (visitee: Wildcard, ...args: any[]): any;
  visit_Begin (visitee: Begin, ...args: any[]): any;
  visit_End (visitee: End, ...args: any[]): any;
  visit_Reference (visitee: Reference, ...args: any[]): any;
  visit_Literal (visitee: Literal, ...args: any[]): any;
  visit_CharacterClass (visitee: CharacterClass, ...args: any[]): any;
  visit_Assertion (visitee: EscapedCharacter, ...args: any[]): any;
  visit_Operator (visitee: EscapedCharacter, ...args: any[]): any;
  visit_SimpleCharacter (visitee: SimpleCharacter, ...args: any[]): any;
}

export abstract class RegexpAtom_toString_Visitor implements RegexpAtomVisitor {
  public groups: GroupControl
  public debug: boolean
  constructor ({
    groups,
    debug,
  }: RegexpAtom_toString_Arg) {
    this.groups = groups;
    this.debug = debug;
  }

  static serialize (atom: RegexpAtom, trailingAnchor: boolean, groups: GroupControl, debug: boolean): string {
    const ret = atom.visit(new RegexpAtomToJs({debug, groups}), 0);
    /* could analyze last literal in any nesting Concats:
    let trailingLiteral = atom;
    if (trailingAnchor) {
      while (trailingLiteral instanceof Concat)
        trailingLiteral = trailingLiteral.r;
      if (trailingLiteral instanceof Literal &&
        trailingLiteral.literal.match(/[\w\d]$/) && // ends with ID
        !trailingLiteral.literal.match(/\\(r|f|n|t|v|s|b|c[A-Z]|x[0-9a-fA-F]{2}|u[a-fA-F0-9]{4}|[0-7]{1,3})$/)) // not part of escape
        return ret + "\\b";
    }
    return ret;
    */
    // or just look at ret like zaach did:
    return (trailingAnchor &&
      ret.match(/[\w\d]$/) && // ends with ID
      !ret.match(/\\(r|f|n|t|v|s|b|c[A-Z]|x[0-9a-fA-F]{2}|u[a-fA-F0-9]{4}|[0-7]{1,3})$/)) // not part of escape
      ? ret + "\\b"
      : ret;
  }

  protected visit_RegexpList (visitee: RegexpList, delim: string, parentPrecedence: number, ...args: any[]): any {
    const {needParen, myPrecedence} = this.getNewPrec(visitee, parentPrecedence);
    const innerStr = visitee.l.visit(this, myPrecedence)
      + delim
      + visitee.r.visit(this, myPrecedence);
    return needParen
      ? '(' + innerStr + ')'
      : innerStr;
  }
  visit_Choice (visitee: Choice, parentPrecedence: number, ...args: any[]): any {
    return this.visit_RegexpList(visitee, '|', parentPrecedence, args);
  }
  visit_Concat (visitee: Concat, parentPrecedence: number, ...args: any[]): any {
    return this.visit_RegexpList(visitee, '', parentPrecedence, args);
  }
  visit_CaptureGroup (visitee: CaptureGroup, parentPrecedence: number, ...args: any[]): any {
    switch (this.groups) {
      case "simplify": return visitee.list.visit(this, parentPrecedence)
      case "preserve": return '(' + visitee.list.visit(this, 1) + ')';
      case "capture":
      default: return '(' + visitee.list.visit(this, 1) + ')';
    }
  }
  visit_SpecialGroup (visitee: SpecialGroup, parentPrecedence: number, ...args: any[]): any {
    const ret = '(' + visitee.specialty + visitee.list.visit(this, 0) + ')';
    return ret;
  }
  visit_Empty (visitee: Empty, parentPrecedence: number, ...args: any[]): any {
    return "";
  }
  visit_Cardinality (visitee: Cardinality, parentPrecedence: number, ...args: any[]): any {
    const {needParen, myPrecedence} = this.getNewPrec(visitee, parentPrecedence);
    const innerStr = visitee.repeated.visit(this, myPrecedence) + visitee.card;
    return needParen
      ? '(' + innerStr + ')'
      : innerStr;
  }
  protected visit_LookOut (visitee: LookOut, operator: string, parentPrecedence: number, ...args: any[]): any {
    const {needParen, myPrecedence} = this.getNewPrec(visitee, parentPrecedence);
    const innerStr = visitee.lookFor.visit(this, parentPrecedence);
    return '(' + operator + innerStr + ')';
  }
  visit_LookAhead (visitee: LookAhead, parentPrecedence: number, ...args: any[]): any {
    return this.visit_LookOut(visitee, "?=", parentPrecedence, args);
  }
  visit_LookBehind (visitee: LookBehind, parentPrecedence: number, ...args: any[]): any {
    return this.visit_LookOut(visitee, "?!", parentPrecedence, args);
  }
  visit_Wildcard (visitee: Wildcard, parentPrecedence: number, ...args: any[]): any {
    return '.';
  }
  // protected visit_Anchor (visitee: Anchor, operator: string, parentPrecedence: number, ...args: any[]): any {}
  visit_Begin (visitee: Begin, parentPrecedence: number, ...args: any[]): any {
    return '^';
  }
  visit_End (visitee: End, parentPrecedence: number, ...args: any[]): any {
    return '$';
  }
  visit_Reference (visitee: Reference, parentPrecedence: number, ...args: any[]): any {
    if (this.debug) return `{${visitee.ref}}`
    throw Error('Reference.visit() should never be called (unless you\'re debugging)');
  }
  visit_Literal (visitee: Literal, parentPrecedence: number, ...args: any[]): any {
    return this.escapeLiteral(visitee.literal);
  }
  visit_CharacterClass (visitee: CharacterClass, parentPrecedence: number, ...args: any[]): any {
    return '[' + this.escapeCharacterClass(visitee.charClass) + ']';
  }
  // protected visit_EscapedCharacter (visitee: EscapedCharacter, parentPrecedence: number, ...args: any[]): any {}
  visit_Assertion (visitee: Assertion, parentPrecedence: number, ...args: any[]): any {
    return '\\' + visitee.escapedChar;
  }
  visit_Operator (visitee: Operator, parentPrecedence: number, ...args: any[]): any {
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

/**
@startuml
abstract class RegexpList extends RegexpAtom
  class Choice extends RegexpList
  class Concat extends RegexpList
class CaptureGroup extends RegexpAtom
class SpecialGroup extends RegexpAtom
class Empty extends RegexpAtom
class Cardinality extends RegexpAtom
abstract class LookOut extends RegexpAtom
  class LookAhead extends LookOut
  class LookBehind extends LookOut
class Wildcard extends RegexpAtom
abstract class Anchor extends RegexpAtom
  class Begin extends Anchor
  class End extends Anchor
class Reference extends RegexpAtom
class Literal extends RegexpAtom
class CharacterClass extends RegexpAtom
class EscapedCharacter extends RegexpAtom
  class Assertion extends EscapedCharacter
  class Operator extends EscapedCharacter
class SimpleCharacter extends RegexpAtom
@enduml
 */

export abstract class RegexpAtom {
  abstract visit (visitor: RegexpAtomVisitor, ...args: any[]): string;
  abstract getPrecedence (): number;
}

export abstract class RegexpList extends RegexpAtom {
  constructor (
    public l: RegexpAtom,
    public r: RegexpAtom,
  ) { super(); }
}

export class Choice extends RegexpList {
  visit (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_Choice(this, args);
  }
  getPrecedence (): number { return 1; }
}

export class Concat extends RegexpList {
  visit (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_Concat(this, args);
  }
  getPrecedence (): number { return 3; }
}

export class CaptureGroup extends RegexpAtom {
  constructor (
    public list: RegexpList,
  ) { super(); }
  getPrecedence (): number { return 7; }
  visit (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_CaptureGroup(this, args);
  }
}

export class SpecialGroup extends RegexpAtom {
  constructor (
    public specialty: string,
    public list: RegexpList,
  ) { super(); }
  getPrecedence (): number { return 7; }
  visit (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_SpecialGroup(this, args);
  }
}

export class Empty extends RegexpAtom {
  getPrecedence (): number { return 6; }
  visit (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_Empty(this, args);
  }
}

export class Cardinality extends RegexpAtom {
  constructor (
    public repeated: RegexpAtom,
    public card: string,
  ) { super(); }
  getPrecedence (): number { return 4; }
  visit (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_Cardinality(this, args);
  }
}

export abstract class LookOut extends RegexpAtom {
  constructor (
    public lookFor: RegexpAtom,
  ) { super(); }
  getPrecedence (): number { return 7; }
}

export class LookAhead extends LookOut {
  constructor (inner: RegexpAtom) { super(inner); }
  visit (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_LookAhead(this, args);
  }
}

export class LookBehind extends LookOut {
  constructor (inner: RegexpAtom) { super(inner); }
  visit (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_LookBehind(this, args);
  }
}

export class Wildcard extends RegexpAtom {
  getPrecedence (): number { return 7; }
  visit (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_Wildcard(this, args);
  }
}

export abstract class Anchor extends RegexpAtom {
  getPrecedence (): number { return 7; }
}

export class Begin extends Anchor {
  visit (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_Begin(this, args);
  }
}

export class End extends Anchor {
  visit (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_End(this, args);
  }
}

// this isn't really a RegexpAtom, but will be replaced before serailization.
export class Reference extends RegexpAtom {
  constructor (
    public ref: string,
  ) { super(); }
  getPrecedence (): never { throw Error('Reference.getPrecedence() should never be called'); }
  visit (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_Reference(this, args);
  }
}

export class Literal extends RegexpAtom {
  constructor (
    public literal: string,
  ) { super(); }
  getPrecedence (): number { return 7; }
  visit (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_Literal(this, args);
  }
}

export class CharacterClass extends RegexpAtom {
  constructor (
    public charClass: string,
  ) { super(); }
  getPrecedence (): number { return 7; }
  visit (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_CharacterClass(this, args);
  }
}

export abstract class EscapedCharacter extends RegexpAtom {
  constructor (
    public escapedChar: string,
  ) { super(); }
  getPrecedence (): number { return 7; }
}

export class Assertion extends EscapedCharacter {
  constructor (char: string) { super(char); }
  visit (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_Assertion(this, args);
  }
}

export class Operator extends EscapedCharacter {
  constructor (char: string) { super(char); }
  visit (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_Operator(this, args);
  }
}


export class SimpleCharacter extends RegexpAtom {
  constructor (
    public simpleChar: string,
  ) { super(); }
  getPrecedence (): number { return 7; }
  visit (visitor: RegexpAtomVisitor, ...args: any[]): any {
    return visitor.visit_SimpleCharacter(this, args);
  }
}
