JISON ?= ../parser-generator/lib/cli.js

all: build test

build:
	node $(JISON) lex.y lex.l
	mv lex.js lex-parser.js

test:
	node tests/all-tests.js

clean:

superclean: clean
	-find . -type d -name 'node_modules' -exec rm -rf "{}" \;


