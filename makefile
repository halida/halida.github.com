deploy:
	bundle exec rake generate
	bundle exec rake deploy

new:
	bundle exec rake "new_post[xxx]"
preview:
	bundle exec rake preview
