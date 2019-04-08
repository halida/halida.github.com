module NewBlog
  extend self

  BLOG_PATH = File.dirname(File.dirname(File.expand_path(__FILE__)))

  def prompt(text)
    print text + ' '
    $stdin.gets.strip
  end

  def run(cmd)
    puts "run: #{cmd}"
    `cd #{BLOG_PATH}; #{cmd}`
  end

  def open_url(url)
    run "o '#{url}'"
  end

  def log(text)
    puts text
  end

  def perform()
    log "path: #{BLOG_PATH}"

    # get title
    title = ENV['title']
    log "title: #{title}"

    # create file
    result = run "bundle exec rake 'new_post[#{title}]'"
    filename = result.match(/: (.*)/)[1]

    # isolate
    run "bundle exec rake 'isolate[#{filename}]'"

    # open emacs about new file
    run "bash -cl 'cd #{BLOG_PATH}; ecc #{filename}'"

    # and start watcher
    watcher_pid = fork do
      run "bundle exec rake watch"
    end

    # and open webpage
    sleep 1
    open_url 'http://blog.test/blog/archives/'

    # after finish editing
    while prompt("finished?").strip != 'y'; end

    # putback
    run "bundle exec rake integrate"

    # close watcher
    Process.kill("HUP", watcher_pid)
    Process.wait(watcher_pid)

    # ask for publish
    while cond = prompt("publish? [y/q yes/quit]")
      case cond
      when 'y'; break
      when 'q'; exit # no need publish now?
      end
    end

    # publish
    run "make publish"
    run "make push"

    # then open website for checking
    sleep 10
    open_url 'http://blog.linjunhalida.com/blog/archives/'
  end
end

NewBlog.perform
