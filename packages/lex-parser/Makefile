JISON ?= ../parser-generator/lib/cli.js

all: build test

build: lib/lex-parser.js

test:
	node tests/all-tests.js

src/lex-parser.ts: lex.y lex.l
	node $(JISON) -t typescript -n Lex -o $@ lex.y lex.l

lib/lex-parser.js: src/lex-parser.ts
	npx tsc -p tsconfig.package.json
