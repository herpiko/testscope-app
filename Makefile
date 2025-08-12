build-prod:
	NODE_OPTIONS=--openssl-legacy-provider npm run build

run:
	NODE_OPTIONS=--openssl-legacy-provider npm run start

deploy:
	docker build --platform linux/amd64 -t testscopeio-app:latest .
	docker save testscopeio-app:latest > testscopeio-app-latest.img
	scp testscopeio-app-latest.img user@foobar:~/app.img
	ssh user@foobar 'docker load < app.img'
	ssh user@foobar 'docker-compose up -d --force-recreate app'
