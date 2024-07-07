rake=bundle exec rake

# http://localhost:4000/
watch:
	$(rake) watch
publish:
	$(rake) generate
	$(rake) deploy
push:
	git add . && git ci -m 'update' && git push

# title="title" make new
new:
	bundle exec ruby scripts/newblog.rb
preview:
	$(rake) preview
commit:
	git add .;git ci -am "update"

# bundle exec rake setup_github_pages
# git@github.com:halida/halida.github.com.git

# python2: pygments
install:
	sudo apt install libyajl-dev python2

# docker run
PWD=`pwd`
get_env=env RAILS_ENV=$(RAILS_ENV) UID=`id -u` GID=`id -g` PWD=`pwd`

# PROXY_SERVER=http://proxy_server:8080 make docker_bash
docker_bash:
	docker compose --file docker-compose.yml run --rm setup_base bash --login
