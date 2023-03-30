JISON ?= ../parser-generator/lib/cli.js

all: install build test

install:
	npm install

build:
	node $(JISON) bnf.y bnf.l
	mv bnf.js parser.js

	node $(JISON) ebnf.y
	mv ebnf.js transform-parser.js

test:
	node tests/all-tests.js

clean:

superclean: clean
	-find . -type d -name 'node_modules' -exec rm -rf "{}" \;

