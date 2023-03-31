const Jison = require("../tests/setup").Jison;
Shared = require("../tests/extend-expect");
Jison.print = Shared.print;
afterEach(Shared.nothingPrinted);

describe("tables", () => {
  it("test right-recursive nullable grammar", () => {

    var grammar = {
      tokens: [ 'x' ],
      startSymbol: "A",
      bnf: {
        "A" :[ 'x A',
               ''      ]
      }
    };

    var gen = new Jison.Generator(grammar, {type: "slr"});
    var gen2 = new Jison.Generator(grammar, {type: "lalr"});

    expect(gen.table.length).toBe(4); // table has 4 states
    expect(gen.nullable('A')).toBe(true); // A is nullable
    expect(gen.conflicts).toBe(0); // should have no conflict
    expect(gen.table).toEqual(gen2.table); // should have identical tables
  });

  it("test slr lalr lr tables are equal", () => {
    var grammar = {
      tokens: [ "ZERO", "PLUS"],
      startSymbol: "E",
      bnf: {
        "E" :[ "E PLUS T",
               "T"      ],
        "T" :[ "ZERO" ]
      }
    };

    var gen = new Jison.Generator(grammar, {type: "slr"});
    var gen2 = new Jison.Generator(grammar, {type: "lalr"});
    var gen3 = new Jison.Generator(grammar, {type: "lr"});

    expect(gen.table).toEqual(gen2.table); // slr lalr should have identical tables
    expect(gen2.table).toEqual(gen3.table); // lalr lr should have identical tables
  });

  it("test LL parse table", () => {

    var grammar = {
      tokens: [ 'x' ],
      startSymbol: "A",
      bnf: {
        "A" :[ 'x A',
               ''      ]
      }
    };

    var gen = new Jison.Generator(grammar, {type: "ll"});

    expect(gen.table).toEqual({$accept:{x:[0], $end:[0]}, A:{x:[1], $end:[2]}}); // ll table has 2 states
  });

  it("test LL parse table with conflict", () => {

    var grammar = {
      tokens: [ 'x' ],
      startSymbol: "L",
      bnf: {
        "L" :[ 'T L T',
               ''      ],
        "T" :[ "x" ]
      }
    };

    var gen = new Jison.Generator(grammar, {type: "ll"});
    expect(gen.conflicts).toBe(1); // should have 1 conflict
  });

  it("test Ambigous grammar", () => {

    var grammar = {
      tokens: [ 'x', 'y' ],
      startSymbol: "A",
      bnf: {
        "A" :[ 'A B A',
               'x'      ],
        "B" :[ '',
               'y'      ]
      }
    };

    var gen = new Jison.Generator(grammar, {type: "lr"});
    expect(gen.conflicts).toBe(2); // should have 2 conflict
    expect().printed([
  `Conflict in grammar: multiple actions possible when lookahead token is y in state 5
- reduce by rule: A -> A B A
- shift token (then go to state 4)`,
  `Conflict in grammar: multiple actions possible when lookahead token is x in state 5
- reduce by rule: B -> 
- reduce by rule: A -> A B A`,
  `
States with conflicts:`,
  `State 5`,
  `  A -> A B A . #lookaheads= $end
  A -> A B A . #lookaheads= x y
  A -> A .B A #lookaheads= $end
  A -> A .B A #lookaheads= x y
  B -> . #lookaheads= x
  B -> .y #lookaheads= x`,
    ]);
  });

  // for Minimal LR testing. Not there yet.
  xit("test Spector grammar G1", () => {

    var grammar = {
      "tokens": "z d b c a",
      "startSymbol": "S",
      "bnf": {
        "S" :[ "a A c",
               "a B d",
               "b A d",
               "b B c"],
        "A" :[ "z" ],
        "B" :[ "z" ]
      }
    };

    var gen = new Jison.Generator(grammar, {type: "mlr", debug:true});
    expect(gen.conflicts).toBe(0); // should have no conflict
  });

  xit("test De Remer G4", () => {

    var grammar = {
      "tokens": "z d b c a",
      "startSymbol": "S",
      "bnf": {
        "S" : "a A d | b A c | b B d",
        "A" : "e A | e",
        "B" : "e B | e" 
      }
    };

    var gen = new Jison.Generator(grammar, {type: "mlr", debug:true});
    expect(gen.conflicts).toBe(0); // should have no conflict
  });
});
