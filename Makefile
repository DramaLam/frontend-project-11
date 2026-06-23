install:
	npm ci
	
lint:
	npm ci
	npm run lint

fix:
	npm run fix

webpack:
	npx webpack serve

publish:
	npm publish --dry-run

run:
	npm install
	npm run dev

test:
	npm run test