install:
	npm ci

lint:
	npx eslint .

webpack:
	npx webpack serve

publish:
	npm publish --dry-run

run:
	npm install
	npm run dev