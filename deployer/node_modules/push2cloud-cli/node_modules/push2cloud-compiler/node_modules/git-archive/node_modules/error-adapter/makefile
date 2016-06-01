MOCHA?=node_modules/.bin/mocha
REPORTER?=spec
DEBUG?=
FLAGS?=$(DEBUG) --reporter $(REPORTER)

test:
	$(MOCHA) $(shell find test -name *-test.js) $(FLAGS)

.PHONY: test

