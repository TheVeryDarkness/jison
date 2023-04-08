JISON ?= ../parser-generator/lib/cli.js

all: build test

build: lib/bnf-parser.js lib/ebnf-parser.js

test:
	node tests/all-tests.js

src/bnf-parser.ts: src/bnf.jison
	node $(JISON) -t typescript -n Bnf -o $@ src/bnf.jison

lib/bnf-parser.js: src/bnf-parser.ts
	npx tsc -p tsconfig.package.json

src/ebnf-parser.ts: src/ebnf.jison
	node $(JISON) -t typescript -n Ebnf -o $@ src/ebnf.jison

lib/ebnf-parser.js: src/ebnf-parser.ts
	npx tsc -p tsconfig.package.json
