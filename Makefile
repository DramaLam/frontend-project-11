install:
	npm ci --include=dev

lint:
	eslint .

fix:
	eslint . --fix

webpack:
	npx webpack serve

publish:
	npm publish --dry-run

run:
	npm install
	npm run dev

test:
	npm run test