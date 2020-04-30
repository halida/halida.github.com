---
layout: post
title: "systemd初探"
date: 2015-03-12 12:03:05 +0800
comments: true
categories: 
---

<img src="http://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Systemd_components.svg/1440px-Systemd_components.svg.png" style="width: 600px" />

最近[ubuntu准备迁移到systemd](http://www.zdnet.com/article/after-linux-civil-war-ubuntu-to-adopt-systemd/)，基本上linux上面init纷争大局已定，[systemd](http://www.freedesktop.org/wiki/Software/systemd/)赢得了主要的市场。
以后各大linux的发行版都以systemd为主，各种系统进程都会用systemd启动，
对于系统管理员们来说，systemd成为必须学习的一个模块。

那么什么是systemd？我们知道linux系统里面启动各大进程的工作都是由[init](http://en.wikipedia.org/wiki/Init)来完成的，
机器启动有不同的级别（rc level），根据不同的级别设置启动进程的顺序。
这种传统架构已经不适应现代的操作系统进程管理了，问题有：

- 设备管理：传统架构架设设备是静态的，但是现代操作系统里面设备动态插入和拔出的状况非常常见。
- 依赖管理：传统架构靠/etc/rc3.d/下面文件名显式制定启动顺序，无法适应复杂依赖关系。
- 进程管理：传统架构没有进程管理，只负责启动，停止的时候也不能保证进程的子进程正常关闭，往往需要系统管理员单独配置。

做过系统管理员的人，应该知道针对进程管理，需要写多少脚本，搭建各种各样的监控和管理系统。
systemd是init的替代系统，有了它，可以说解决了很大一部分的问题，脚本可以丢掉一大部分了。
systemd的解决方案：

- 所有管理的对象都是[unit](http://www.freedesktop.org/software/systemd/man/systemd.unit.html)，包括系统服务，文件系统，设备等
- 做到比较好的资源依赖管理
- 利用cgroup等工具，做到进程管理和控制
- 内置日志系统来接收和管理各个unit的日志

systemd做的事情很多，体积也很大，网上对此也有争议。我对于它的涉及领域没有意见，因为进程管理相关的事情是很多，彼此也有依赖。
用了systemd，管理一个进程，只需要写好对应的一个配置文件就好了，对于系统管理员来说，事情变得更简单了，
配置文件的格式也不是很复杂。

现在我的主力服务器发行版是ubuntu，等ubuntu正式引入systemd之后，我会用它来进行进程管理，到时候会有更多的心得可供分享。

