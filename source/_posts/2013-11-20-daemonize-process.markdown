---
layout: post
title: "如何让进程后台执行"
date: 2013-11-20 03:51
comments: true
categories: 
---

{% img /images/posts/2013_11_20_daemon.jpg %}

很多时候我们需要让一个进程在后台执行。

## 终端下面执行命令

比如我们要执行`cmd`，可以简单地在命令行运行`cmd &`。

如果我们希望重定向输出到其他的地方，可以用：

`cmd 2>&1 > run.log &`

里面 `2>&1` 是把`stderr`重导向到`stdout`，然后`> run.log`把`stdout`重导向到文件。

但是如果关闭当前终端，后台跑的进程还是会被退出掉，这个时候需要[工具](http://libslack.org/daemon/manpages/daemon.1.html)：

`daemon cmd`

如果你是用ruby写的程序，也可以[有一个Gem](https://github.com/ghazel/daemons)来帮你完成这个工作。

## 原理

后台化主要做的事情就是让生成的后台进程不被你的命令行以及调用者影响到，
具体需要做的步骤如下：

- 首先是第一遍`fork()`，这样的目的是让新的进程不成为process group leader，后一步操作`setsid()`成功执行依赖这点。
- `setsid()`让新的进程成为session group leader，这样发送给父进程process group的信号就不会影响到子进程。
- 第二遍`fork()`，这样生成的进程不会是session group leader，不会重开终端（PGID和PID不同了）。
- `chdir("/")`，把进程默认目录移动到root，这样进程可以和文件系统无关，当然也可以移动到后台进程管理的牡蛎里面去。
- `umask(0)`限制后台进程的权限，主要是安全考虑，这一步可选。
- `close()`文件描述符0，1，2，其实就是标准输入输出和错误，因为它们是从父进程中继承过来的。你也可以重新导向标准输出和错误用来做日志记录，重新导向标准输入用来做进程控制。

示例代码如下：

```ruby
module Daemon
  extend self

  def run
    5.times.each do
      sleep 1
      puts Time.now
    end
  end

  def start
    Process.fork do
      Process.setsid
      Process.fork do
        Dir.chdir(File.expand_path("."))
        File.umask(0)

        $stdin = File.open('/dev/null')
        $stdout = File.open('s.log', 'w+')
        $stderr = File.open('/dev/null')
        self.run

        exit
      end
      exit
    end
  end
end

Daemon.start
```

保存成daemon.rb，然后执行`ruby daemon.rb`。

我在上面的测试代码中，如果去掉`setsid`和第二遍fork，执行代码，关闭当前的终端，进程还是在后台正常执行。
所以我不是很清楚它们的具体影响，欢迎有知道的人帮忙指导一下。

更新疑问：

有朋友回复，`setsid`用来设置成新的session和process group，这样就不会被来自父进程的killpg等操作影响，
还有就是，第二遍fork是让进程不再是process group leader，这样不能重新获得一个终端。这个操作是可选的。


引用材料：

- [ruby daemons项目](https://github.com/ghazel/daemons)
- [stackoverflow上面的介绍](http://stackoverflow.com/questions/3095566/linux-daemonize)
- [daemon为什么要fork两次](http://blog.csdn.net/luckyaslan/article/details/9094523)