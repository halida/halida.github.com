---
layout: post
title: "ubuntu搭建wordpress"
date: 2013-02-28 11:27
comments: true
categories: 
---

虽然ubuntu里面已经有了wordpress的安装包，不过它好像是和apache整合起来的，
我的ubuntu服务器上面主要跑的是nginx，这里整理一下安装的步骤吧。

架构
-------------------------

比较简单，nginx接收到访问wordpress的请求，交给php-cgi进程渲染结果，然后返回。
跑的进程有：nginx, php-cgi, mysql。


安装软件
-------------------------

首先是安装必须的软件：

    sudo aptitude install nginx mysql-server mysql-client unzip php5-cgi php5-mysql
    
安装的时候会提示你输入一下mysql的root密码。

设置mysql
-------------------------
    
mysql默认不是utf8的，我们需要修改一下：

    sudo vi /etc/mysql/my.cnf
    
加上：

    [mysql]
    default-character-set=utf8
    [client]
    default-character-set=utf8
    [mysqld]
    character-set-server=utf8

然后重启mysql：

    sudo service mysql restart
    
给wordpress准备一个数据库：

    mysql -u root -p
    
进入命令行后, 我们需要：

```sh
# 创建一个数据库
create database wordpress;
# 建立对应的mysql的用户
create user wordpress identified by '密码';
# 设置权限
grant all privileges on wordpress.* to wordpress;
```
    
准备php进程
-----------------------------

我们单独跑一个php-cgi服务：

    sudo vi /etc/init.d/php-fastcgi

内容：

```sh
#!/bin/bash
BIND=127.0.0.1:9000
USER=www-data
PHP_FCGI_CHILDREN=15
PHP_FCGI_MAX_REQUESTS=1000

PHP_CGI=/usr/bin/php-cgi
PHP_CGI_NAME=`basename $PHP_CGI`
PHP_CGI_ARGS="- USER=$USER PATH=/usr/bin PHP_FCGI_CHILDREN=$PHP_FCGI_CHILDREN PHP_FCGI_MAX_REQUESTS=$PHP_FCGI_MAX_REQUESTS $PHP_CGI -b $BIND"
RETVAL=0

start() {
      echo -n "Starting PHP FastCGI: "
      start-stop-daemon --quiet --start --background --chuid "$USER" --exec /usr/bin/env -- $PHP_CGI_ARGS
      RETVAL=$?
      echo "$PHP_CGI_NAME."
}
stop() {
      echo -n "Stopping PHP FastCGI: "
      killall -q -w -u $USER $PHP_CGI
      RETVAL=$?
      echo "$PHP_CGI_NAME."
}

case "$1" in
    start)
      start
  ;;
    stop)
      stop
  ;;
    restart)
      stop
      start
  ;;
    *)
      echo "Usage: php-fastcgi {start|stop|restart}"
      exit 1
  ;;
esac
exit $RETVAL
```

把这个服务跑起来：

```sh
sudo chmod u+x /etc/init.d/php-fastcgi
sudo update-rc.d php-fastcgi defaults
sudo service php-fastcgi start
```

设置nginx
-----------------------------

我们增加一个nginx配置文件：

    sudo vi /etc/nginx/sites-available/your-domain.com
    
内容（需要修改对应的参数）：

```
server{
        listen 80;
        server_name your-domain.com;
    
        location / {
          root /home/halida/wordpress;
          index index.php index.html index.htm;
    
          # this serves static files that exist without running other rewrite tests
          if (-f $request_filename) {
              expires 30d;
              break;
          }
    
          # this sends all non-existing file or directory requests to index.php
          if (!-e $request_filename) {
              rewrite ^(.+)$ /index.php?q=$1 last;
          }
        }
    
        location ~ \.php$ {
            root /home/halida/wordpress;
            
            fastcgi_pass    127.0.0.1:9000;
            fastcgi_index   index.php;
            fastcgi_param   SCRIPT_FILENAME /home/halida/wordpress$fastcgi_script_name;
            include         fastcgi_params;
        }
}
```

设置使用这个配置文件：

    sudo ln -s /etc/nginx/sites-available/wordpress /etc/nginx/sites-enabled
    
设置wordpress
-----------------------------

我们直接从官方网站上面下载wordpress：

    wget http://wordpress.org/latest.zip
    unzip latest.zip
    cp wp-config-sample.php wp-config.php
    
修改wp-config.php，填写上我们前面设置的mysql数据库信息。

wordpress就这样安装好了。然后访问你的域名位置，就可以使用了。

引用材料：

- [ubuntu下面nginx安装wordpress](http://tomasz.sterna.tv/2009/04/php-fastcgi-with-nginx-on-ubuntu/)
- [wordpress安装教程](http://codex.wordpress.org/Installing_WordPress#Famous_5-Minute_Install)
