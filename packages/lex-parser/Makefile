JISON ?= ../parser-generator/lib/cli.js

all: build test

build: lib/lex-parser.js

test:
	node tests/all-tests.js

src/lex-parser.ts: src/lex.jison
	node $(JISON) -t typescript -n Lex -o $@ src/lex.jison

lib/lex-parser.js: src/lex-parser.ts src/lex-types.ts
	npx tsc -p tsconfig.package.json
