rake=bundle exec rake

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

install:
	sudo apt install libyajl-dev
