rake=bundle exec rake

watch:
	$(rake) atch
deploy:
	$(rake) generate
	$(rake) deploy

new:
	$(rake) "new_post[xxx]"
preview:
	$(rake) preview
