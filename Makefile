.PHONY: all build node_modules_prod

all: build

build:
	./node_modules/.bin/webpack \
	  --debug=false \
		--config webpack.config.js \
		--optimize-minimize \
		--optimize-dedupe \
		--colors

	cp -R ./lib/livefyre-bootstrap/dist/fonts ./src/less/fonts

node_modules: package.json
	npm install
	./node_modules/.bin/bower install
	cp -R ./lib/livefyre-bootstrap/dist/fonts ./src/less/fonts
	touch $@

node_modules_prod:
	npm install --production
	./node_modules/.bin/bower install --production
	cp -R ./lib/livefyre-bootstrap/dist/fonts ./src/less/fonts

dist: node_modules_prod build

version:
	./node_modules/.bin/json -E 'this.version="$(v)"' -f package.json -I
	./node_modules/.bin/json -E 'this.version="$(v)"' -f bower.json -I

test: build
	npm test

clean:
	rm -rf node_modules lib dist

run: server

server:
	node ./tools/dev.js

lint:
	./node_modules/.bin/jsxhint ./src/js/

env=dev
deploy: dist
	./node_modules/.bin/lfcdn -e $(env)

env=dev
build=1
deploy_build: dist
	./node_modules/.bin/lfcdn -e $(env) --build=$(build)
