---
layout: post
title: "命令行下使用全局代理"
date: 2013-05-21 15:15
comments: true
categories: 
---

{% img /images/posts/wlogo.png %}

最近[Bitbucket](http://bitbucket.org/)的git ssh访问被墙了，如果设置电脑全局翻墙会很麻烦，我需要能够有针对一个terminal，一个命令的翻墙方式。

询问了友邻之后，有几个工具浮出水面：`tsocks`以及`proxychains`。

调研了一下`tsocks`，2002年就不再更新了，osx下面编译没有成功，不过ubuntu的源里面是有的。下载下来发现，它需要修改一个设置文件`/etc/tsocks.conf`，比较麻烦，于是我放弃使用这个工具。

`proxychains`要好一些，[github上面的页面](https://github.com/haad/proxychains)有mac下面用`homebrew`的安装方法，ubuntu的源里面也有，使用起来也是一行代码可以搞定的。

首先需要跑一个socks5 proxy，使用：

    $ ssh -fN -D 4321 some.example.com
    
然后设置参数执行命令就好了：

    $ PROXYCHAINS_SOCKS5=4321 proxychains wget http://wikileaks.org/IMG/wlogo.png


