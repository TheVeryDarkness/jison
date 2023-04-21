JISON ?= ../parser-generator/lib/cli.js

all: build test

build: lib/lex-parser.js lib/lex-regexp-parser.js

test:
	node tests/all-tests.js

src/lex-parser.ts: src/lex.jison
	node $(JISON) -t typescript -n Lex -o $@ $<

lib/lex-parser.js: src/lex-parser.ts src/RegexpAtom.ts src/RegexpAtomToStringVisitor.ts
	npx tsc -p tsconfig.package.json

src/lex-regexp-parser.ts: src/lex-regexp.jison
	node $(JISON) -t typescript -n LexRegexp -o $@ $<

lib/lex-regexp-parser.js: src/lex-regexp-parser.ts src/RegexpAtom.ts
	npx tsc -p tsconfig.package.json
