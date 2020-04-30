---
layout: post
title: "pow介绍"
date: 2013-03-24 19:30
comments: true
categories: development ruby
---

![image](http://pow.cx/images/logo-pow.png)

[Pow](http://pow.cx/)是一个神奇的东西，原先你需要跑一个服务器应用，你可能需要在命令行下面执行一个命令，以及你自己需要时刻监控到这个程序的运行。但是有了POW，你需要做的事情只是做一个`ln`软链接就可以了。对了，它只能在OSX下面使用。

安装：

```sh
curl get.pow.cx | sh
```
    
删除：

```
curl get.pow.cx/uninstall.sh | sh
```
    
如果你需要设置一个基于[Rack](http://rack.github.com/)的应用，你需要做的是：

```sh
cd ~/.pow
ln -s /path/to/myapp
```

就是这么简单。

原理
------------------

- Pow把目录当做Rack应用来执行，目录主要含有`config.ru`配置文件和`public`静态文件目录。
- 在访问到目录的时候，它自动创建一个worker，最多每个应用2个worker，15分钟没有请求后自动回收。

一些特性整理
------------------

- 链接到`~/.pow`里面的目录比如myapp会映射到`http://myapp.dev/`。
- `www.myapp.dev`这种子域名都会映射到`myapp.dev`，除非你重新创建一个`www.myapp`目录。
- `~/pow`多个软链接到同一个目录，只会生成一个worker。
- 如果没有`myapp`，访问`myapp.dev`会给出提示。
- Pow支持端口转发功能，只要`echo 8080 > ~/.pow/proxiedapp`，访问`proxiedapp.dev`就是访问本地端口8080。
- Pow支持只含有`public`目录，直接serve静态文件。
- 重新启动服务：`touch tmp/restart.txt`，或者直接杀掉进程就好了。会重新加载环境。
- 每次访问都重启服务：生成这个文件：`tmp/always_restart.txt`。但是它不会重新加载环境。
- log放在`~/Library/Logs/Pow`里面。
- 重启Pow：`touch ~/.pow/restart.txt`

设置
------------------

Pow启动前会去执行目录下`.powrc`和`.powenv`这2个脚本。

如何设定ruby版本？

- 用[rbenv](https://github.com/sstephenson/rbenv)： `rbenv local 1.9.3-p194`
- 用rvm，添加.rvmrc：`rvm 1.8.7`
  因为rvm需要加载环境变量，你需要修改上面的2个脚本之一：
  ```sh
  if [ -f "$rvm_path/scripts/rvm" ] && [ -f ".rvmrc" ]; then
  source "$rvm_path/scripts/rvm"
  source ".rvmrc"
  fi
  ```
- 或者直接设置`PATH`就好了。

FAQ
------------------

** 手动设置软链接太烦了，有什么方便的方法？**

有的。 `gem install powder`，cd到你应用的目录，然后执行：

    powder link

文档在[这里](https://github.com/Rodreegez/powder#readme)。

**如何让局域网的其他人访问到这个服务？**

用[xip.io](http://xip.io/)，它是一个把网络地址转换到具体IP的服务，方便进行一些调试。
比如你的ip是`10.0.0.2`，用Pow跑的服务是`app`，那么同一个局域网的人就可以用`app.10.0.0.2.xip.io`来访问你的服务。

**如何让外网的其他人访问到这个服务？**

用[forward](https://forwardhq.com/)。

资料

- [Pow文档](http://pow.cx/manual.html)