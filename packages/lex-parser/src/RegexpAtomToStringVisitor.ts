import {
  Assertion,
  Begin,
  CaptureGroup, Cardinality, CharacterClass,
  Choice,
  Concat,
  Empty, End, PatternLiteral, CharClassLiteral, LookAhead, LookBehind, LookOut, Operator, Reference,
  RegexpAtom,
  RegexpAtomVisitor,
  RegexpList,
  SpecialGroup, Wildcard
} from "./RegexpAtom";

type GroupControl = "capture" | "simplify" | "preserve";

interface RegexpAtom_toString_Arg {
  groups: GroupControl,
  debug: boolean,
}

export abstract class RegexpAtomToStringVisitor implements RegexpAtomVisitor {
  public groups: GroupControl
  public debug: boolean
  constructor ({
    groups,
    debug,
  }: RegexpAtom_toString_Arg) {
    this.groups = groups;
    this.debug = debug;
  }

  static serialize (atom: RegexpAtom, groups: GroupControl, debug: boolean): string {
    return atom.visit(new RegexpAtomToJs({debug, groups}), 0);
  }

  protected visit_RegexpList (visitee: RegexpList, delim: string, parentPrecedence: number, ...args: any[]): any {
    const {needParen, myPrecedence} = this.getNewPrec(visitee, parentPrecedence);
    const innerStr = visitee.l.visit(this, myPrecedence)
      + delim
      + visitee.r.visit(this, myPrecedence);
    return needParen
      ? '(?:' + innerStr + ')'
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
      case "preserve": return '(?:' + visitee.list.visit(this, 1) + ')';
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
      ? '(?:' + innerStr + ')'
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
  visit_PatternLiteral (visitee: PatternLiteral, parentPrecedence: number, ...args: any[]): any {
    return this.escapeLiteral(visitee.literal);
  }
  visit_CharacterClass (visitee: CharacterClass, parentPrecedence: number, ...args: any[]): any {
    return '[' + (visitee.negated ? '^' : '') + visitee.ranges.map(range => this.escapeCharacterClass(range.visit(this, parentPrecedence))).join('') + ']';
  }
  visit_CharClassLiteral (visitee: CharClassLiteral, parentPrecedence: number, ...args: any[]): any {
    return this.escapeCharacterClass(visitee.literal);
  }
  // protected visit_EscapedCharacter (visitee: EscapedCharacter, parentPrecedence: number, ...args: any[]): any {}
  visit_Assertion (visitee: Assertion, parentPrecedence: number, ...args: any[]): any {
    return '\\' + visitee.escapedChar;
  }
  visit_Operator (visitee: Operator, parentPrecedence: number, ...args: any[]): any {
    return '\\' + visitee.escapedChar;
  }
  // visit_SimpleCharacter (visitee: SimpleCharacter, parentPrecedence: number, ...args: any[]): any {
  //   return this.escapeLiteral(visitee.simpleChar);
  // }

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
export class RegexpAtomToJs extends RegexpAtomToStringVisitor {
  escapeLiteral (literal: string): string {
    return literal.replace(/([\r\f\n\t\v])|([\x00-\x1f\x7f-\xff])|([\u0100-\ufffd])|([.*+?^${}()|[\]\/\\])/g, RegexpAtomToJs.escapeGroupMatch);
  }
  escapeCharacterClass (literal: string): string {
    return literal.replace(/([\r\f\n\t\v])|([\x00-\x1f\x7f-\xff])|([\u0100-\ufffd])/g, RegexpAtomToJs.escapeGroupMatch);
  }
  protected static escapeGroupMatch (text: string, str: StrEscapes|undefined, crl: string|undefined, uni: string|undefined, operator: string|undefined) {
    if (str) return ToStrEscape[str];
    if (crl) return '\\x' + crl.charCodeAt(0).toString(16).padStart(2, '0');
    if (uni) return '\\u' + uni.charCodeAt(0).toString(16).padStart(4, '0');
    if (operator) return '\\' + operator;
    throw Error(`none of str, crl, uni set in ${arguments}`);
  }
}

