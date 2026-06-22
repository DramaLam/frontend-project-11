install:
	npm ci

lint:
	npx eslint .

fix:
	npx eslint . --fix

webpack:
	npx webpack serve

publish:
	npm publish --dry-run

run:
	npm install
	npm run dev

test:
	npm run test