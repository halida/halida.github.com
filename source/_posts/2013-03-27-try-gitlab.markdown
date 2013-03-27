---
layout: post
title: "试用gitlab"
date: 2013-03-27 12:10
comments: true
categories: rails ruby
---

![image](http://gitlab.org/images/gitlab_hq.png)

今天我试着安装了一下[gitlab](http://gitlab.org/)，它是一个开源的类似github的系统，
利用它可以本地搭建一个github网站出来。可以解决一些需要客制化代码库，或者私有化管理的需求。

安装过程
---------------
按照[文档](https://github.com/gitlabhq/gitlabhq/blob/5-0-stable/doc/install/installation.md)进行，我中间走了一些弯路：

- 安装ruby的时候，我是采用rvm，而不是教程里面的采用系统ruby，后来发现不对，必须安装成系统的版本，不然服务起不起来。
- postgres用户gitlab不能登陆，后来搜索了一下，发现[需要修改权限](http://blog.deliciousrobots.com/2011/12/13/get-postgres-working-on-ubuntu-or-linux-mint/)

其他过程比较顺利，基本按照教程来就可以了。

架构
---------------

其实整体系统还是比较简单的，安装了一个系统服务，后面主要是把gitlab当做一个rails应用来跑，后台启动了一个sidekiq。

针对git的部分，分离出来了git-shell，其实就是在系统里面安装了一个shell，用户用git连过来的时候，就用这个shell来进行版本库的操作，它是调用rails网站服务器的API来做权限管控之类的事情。

试用感觉
---------------

因为我只是试用一下，没有用于生产，只是稍微浏览了一下功能。
github有的功能它都有，还加上了用户管理，群组管理，查看系统日志等功能。
功能上面感觉还是够用的。

关于这个项目的架构思路，我觉得还是挺好的。
网站的部分归网站，git的部分归git，中间通过API来通讯。
git-shell的方式减少另外跑一个服务的成本，对于小用户群的环境来说可以，
但是不是很适应用户数量过多的状况，但是场景不多，问题不大。
不过需要安装系统的ruby环境倒是挺麻烦的，希望他们以后针对这个问题提出改进方案。


