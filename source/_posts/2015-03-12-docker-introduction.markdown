---
layout: post
title: "docker介绍"
date: 2015-03-12 12:55:36 +0800
comments: true
categories: 
---

我们知道虚拟化的层次有：CPU指令集级别虚拟化，操作系统级别虚拟化，
还有一种进程级别虚拟化（container），底层都采用linux内核，在内核之上的CPU资源，内存，文件系统，设备，都用虚拟化技术隔离出来。
[docker](https://www.docker.com/)就是这样的一个工具。

docker用linux内核的资源控制功能（[LXC](http://en.wikipedia.org/wiki/LXC)）来隔离和控制资源，用[AUFS](http://en.wikipedia.org/wiki/aufs)来管理虚拟的文件系统，用docker可以提供一个轻量级的虚拟机，它的特性有：

- 快速启动，一个进程起来可能只需要几秒钟。
- 轻量级文件系统虚拟化，带有版本控制的文件系统，改动只保存变更，存储占用非常小。
- 进程间隔离，保证进程之间不会互相干扰。

用docker可以把应用集装箱化，快速搭建，移动，复制，分发。对于应用开发，它可以让开发和发布环境归一起来，
开发阶段测试完毕之后可以直接装箱进入发布流程。

同时docker[也有一些不适合的场景](http://teahour.fm/2015/02/13/docker-introduction.html)，比如有状态应用（存储），资源占用比较大，或者高性能网络应用，虚拟化会带来性能损耗。

docker以及container思想对于现在系统架构的冲击比较大，现在有一个[CoreOS](https://coreos.com)发行版，所有发布的应用都存放在container里面执行。
