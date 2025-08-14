build-prod:
	NODE_OPTIONS=--openssl-legacy-provider yarn build

build-docker:
	docker build --platform linux/amd64 -t herpiko/testscope-app:latest .

run:
	NODE_OPTIONS=--openssl-legacy-provider yarn start

deploy: build-docker
	docker save testscope-app:latest > testscope-app-latest.img
	scp testscopeio-app-latest.img user@foobar:~/app.img
	ssh user@foobar 'docker load < app.img'
	ssh user@foobar 'docker-compose up -d --force-recreate app'
