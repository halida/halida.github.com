
---
layout: post
title: rails ubuntu 下安装
date: 2011-05-24 10:23:21 +0800

comments: true
categories: 
---

![image](http://rubyonrails.org/images/rails.png)

安装rvm
------------------------------

首先, 安装源里面的ruby, git, curl等依赖

```bash
sudo aptitude install ruby git-core curl zlib1g-dev libssl-dev libsqlite3-dev libreadline-dev g++ gcc libxml2-dev libxslt1-dev libmysqlclient-dev libyaml-dev autoconf build-essential
```

然后安装rvm (按照
[rvm.io](http://rvm.io)/
)

```bash
\curl -L https://get.rvm.io | bash -s stable --ruby
```

把环境加到shell path里面

```bash
echo '[[ -s "$HOME/.rvm/scripts/rvm" ]] && . "$HOME/.rvm/scripts/rvm" # Load RVM function' >> ~/.bash_profile
```

不过我发现bash好像不调用.bash\_profile, 所以还是用.bashrc吧

```bash
echo '[[ -s "$HOME/.rvm/scripts/rvm" ]] && . "$HOME/.rvm/scripts/rvm" # Load RVM function' >> ~/.bashrc
```

重新加载

```bash
source .bash_profile
```

如果你用的是zsh，在~/.zshrc最后加上：

```bash
[[ -s "$HOME/.rvm/scripts/rvm" ]] && . "$HOME/.rvm/scripts/rvm" 

PATH=$PATH:$HOME/.rvm/bin # Add RVM to PATH for scripting
```

测试rvm是否装好了

```bash
type rvm | head -1
```

安装ruby1.9.3

```bash
rvm install 1.9.3
```

设置默认环境

```bash
rvm use 1.9.3 --default
```

安装rails
------------------------------

gem安装即可

```bash
gem install rails
```

mysql设置
------------------------------

rails默认db是sqlite, 为了调试, 也可能整成mysql的,
这里也加上mysql方面的设置方式.

安装mysql

```bash
sudo apt-get install mysql-server
```

mysql默认编码是latin, 我们要改成utf8, 修改/etc/mysql/my.cnf,

    [mysql]
    default-character-set=utf8
    [client]
    default-character-set=utf8
    [mysqld]
    character-set-server=utf8

设置完后需要重启mysql:

```bash
sudo service mysql restart
```

然后我们重置mysql root密码

```bash
sudo dpkg-reconfigure mysql-server 
```

进入命令行: mysql -u root -p

然后在密码提示上面设置一个root密码.

进入命令行后, 我们需要

```sh
# 创建一个数据库
create database test;
# 建立对应的mysql的用户
create user tester identified by '密码';
# 设置权限
grant all privileges on test.* to tester;
```

postgresql设置
------------------------------

我们也可以设置采用postgresql。

安装postgresql

```bash
sudo apt-get install postgresql postgresql-client
```

进入命令行后, 我们需要加上用户和数据库：

```bash
sudo -u postgres psql postgres << EOF
CREATE DATABASE test;                           
CREATE USER test WITH PASSWORD 'test';          
GRANT ALL PRIVILEGES ON DATABASE test to test;  
EOF
```

好了, 现在东西都已经可以用了, 开始干活吧.

issues
------------------------------

如果sqlite安装出现问题, 需要

```bash
sudo apt-get install libsqlite3-dev
gem install sqlite3-ruby
```
