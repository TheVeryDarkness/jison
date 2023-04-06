JISON ?= ../parser-generator/lib/cli.js

all: build test

build: lib/bnf-parser.js lib/ebnf-parser.js

test:
	node tests/all-tests.js

src/bnf-parser.ts: bnf.y bnf.l
	node $(JISON) -t typescript -n Bnf -o $@ bnf.y bnf.l
#	mv bnf.js parser.js

lib/bnf-parser.js: src/bnf-parser.ts
	npx tsc -p tsconfig.package.json

src/ebnf-parser.ts: ebnf.y
	node $(JISON) -t typescript -n Ebnf -o $@ ebnf.y
#	mv ebnf.js transform-parser.js

lib/ebnf-parser.js: src/ebnf-parser.ts
	npx tsc -p tsconfig.package.json
