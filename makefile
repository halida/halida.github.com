rake=bundle exec rake

watch:
	$(rake) watch
deploy:
	$(rake) generate
	$(rake) deploy

new:
	$(rake) "new_post[xxx]"
preview:
	$(rake) preview
commit:
	git add .;git ci -am "update"
