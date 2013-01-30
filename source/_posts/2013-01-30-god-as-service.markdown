# -*- coding: utf-8 -*-
---
layout: post
title: "进程监控遇到的麻烦事"
date: 2013-01-30 12:58
comments: true
categories:
---

此为技术死磕贴，非技术人士请跳过。

明天回家，为了能够让我在家里面连到公司的网络，以及让公司留下来的人能够使用到翻墙服务，我需要把几个脚本监控起来。
这样不管这些脚本跑挂了，还是机器重启了，还是网络断掉又重新连起来了，这些进程都能够在状况恢复的时候立刻起来。

需要跑的脚本其实很简单，ssh翻墙，以及ssh链接到服务器上面一个端口用作外网访问内网。都用一行脚本搞定：

```bash
autossh -M 2121 -D 10.78.78.105:7070 linjunhalida.com -N -p 2201  -zZ OOO
autossh -M 2132 linjunhalida.com -N -p 2200 -zZ OOO -R 6333:localhost:22
```

为了能够让ssh自动重连，我采用了[autossh](http://www.harding.motd.ca/autossh/)。
因为我的ssh是[打过混淆包头补丁](http://blog.linjunhalida.com/blog/obfuscated-openssh/)的，
加了一个参数(-zZ)，autossh我也修改了一下源码支持这个参数。

我的服务器是ubuntu，我还需要用一个工具来监控autossh，需要能够机器启动的时候执行它，以及它挂掉的时候自动起来。

然后请教了各个网站的友邻，这里列一下大家给出来的办法：

- /etc/rc.local
- monit
- crontab
- supervisor
- /etc/init.d
- anacron

最后我考量到学习成本，还是采用了[god](http://godrb.com/)加/etc/init.d启动脚本的解决方案。

god脚本：

```ruby
god_path = File.expand_path(File.dirname(__FILE__))

God.watch do |w|
  w.name = "gfw"
  w.uid = 'halida'

  w.dir = "/home/halida/workspace/sources/autossh"
  w.env = {"AUTOSSH_PATH" => "/home/halida/Dropbox/sync/bin/ssh"}
  w.start = "./autossh -M 2121 -D 10.78.78.105:7070 linjunhalida.com -N -p 2201  -zZ OOO"
  w.log = File.join god_path, "log/gfw.log"
  w.keepalive
end

God.watch do |w|
  w.name = "bypass"
  w.uid = 'halida'

  w.dir = "/home/halida/workspace/sources/autossh"
  w.env = {"AUTOSSH_PATH" => "/home/halida/Dropbox/sync/bin/ssh"}
  w.start = "./autossh -M 2132 linjunhalida.com -N -p 2200 -zZ OOO -R 6333:localhost:22"
  w.log = File.join god_path, "log/bypass.log"
  w.keepalive
end
```

当前用户跑起来没有问题，但是god本身是需要设置成service跑起来的。
还好我找到了别人分享的把god当做service的办法，
丢到/etc/init.d里面的脚本如下(拷贝自[这里](https://gist.github.com/1640121))：

```bash
#!/bin/bash
 
### BEGIN INIT INFO
# Provides:             god
# Required-Start:       $all
# Required-Stop:        $all
# Default-Start:        2 3 4 5
# Default-Stop:         0 1 6
# Short-Description:    God
### END INIT INFO
 
NAME=god
DESC=god
GOD_BIN=/usr/local/bin/god
UHOME=/home/halida
GOD_CONFIG=$UHOME/workspace/god/god.rb
GOD_LOG=$UHOME/workspace/god/log/god.log
GOD_PID=/var/run/god.pid
 
set -e
 
# Make sure the binary and the config file are present before proceeding
if ! test -x $GOD_BIN; then
  echo "Config file not found at ${GOD_BIN}"
  exit 0
fi
 
# Create this file and put in a variable called GOD_CONFIG, pointing to
# your God configuration file
if ! test -f $GOD_CONFIG; then
  echo "Config file not found at ${GOD_CONFIG}"
  exit 0
fi
 
RETVAL=0
 

case "$1" in
  start)
    echo -n "Starting $DESC: "
    $GOD_BIN -c $GOD_CONFIG -l $GOD_LOG -P $GOD_PID
    RETVAL=$?
    echo "$NAME."
    ;;
  stop)
    echo -n "Stopping $DESC: "
    $GOD_BIN quit
    RETVAL=$?
    echo "$NAME."
    ;;
  terminate)
    echo -n "Stopping $DESC and all tasks: "
    $GOD_BIN terminate
    RETVAL=$?
    echo "$NAME."
    ;;
  restart)
    echo -n "Restarting $DESC: "
    $GOD_BIN quit
    $GOD_BIN -c $GOD_CONFIG -l $GOD_LOG -P $GOD_PID
    RETVAL=$?
    echo "$NAME."
    ;;
  status)
    $GOD_BIN status
    RETVAL=$?
    ;;
  *)
    echo "Usage: god {start|stop|terminate|restart|status}"
    exit 1
    ;;
esac

exit $RETVAL
```

然后设置启动执行这个服务：

    sudo update-rc.d god default


跑god的时候遇到了问题，这个时候我浪费了非常多的时间。问题在于我的god是采用rvm以及非root用户安装的。环境不对。各种报错。

然后我各种尝试，还打算丢掉god，采用其他的方式来跑脚本，但是都可耻地失败了。

最后第二天我想到了办法，系统安装god：

    sudo gem install god

重启之后验证成功。

结论
-------------------

最后我的解决方案就是：god as a service，监控autossh。log都丢掉god目录下面。

总结一下经验：

- 请教友邻可以获得很多的帮助，前提是问题描述清楚。
- 遇到难题不要死磕，休息一下，睡一觉或者放一段时间，就会有结果。
- 死磕了之后要总结，下次就能少死磕一点。

以上。


