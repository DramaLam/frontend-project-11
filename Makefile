install:
	npm ci --include=dev

lint:
	./node_modules/.bin/eslint .

fix:
	./node_modules/.bin/eslint . --fix

webpack:
	npx webpack serve

publish:
	npm publish --dry-run

run:
	npm install
	npm run dev

test:
	npm run test