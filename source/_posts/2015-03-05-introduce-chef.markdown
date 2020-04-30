---
layout: post
title: "chef介绍"
date: 2015-03-05 12:34:16 +0800
comments: true
categories: 
---

[chef](https://www.chef.io/)是一个服务器自动化构建工具。最近我花了好多时间来研究它，
慢慢弄懂了如何使用，这里整理一下介绍。

## 为什么要自动化构建

我们搭建一台服务器，一般情况下是用ssh登录上去，手动执行一系列的安装脚本。这种方式有一些问题：

- 手动操作费时：安装一台rails服务器，等待和操作的时间可能有一个小时。
- 容易出现失误：不小心写错了一个参数或者执行错了一个命令，可能损失好久的调试和重新安装时间。
- 难以复用：每次安装都需要重新手动操作一遍，虽然可以记录下操作的脚本，但是每台服务器多多少少不一样，还需要针对性地修改。
- 难以跟踪改动：运行了一段时间之后，会因为某些需要作出修改。除非流程上面控制必须整理文档，后期完全不知道改了什么。

如果把服务器当作一个应用，针对服务器的操作就是应用的源代码，我们可以用代码库的思路来考虑服务器构建，这就是自动化构建。

## chef的解决方案

服务器的一个状态（比如一个特定内容的文件，一个需要跑的进程服务），可以定义成一个`resource`，
用`provider`控制`resource`的状态（比如删除文件，创建文件，启动进程），
一系列这样的描述，定义了我们想要做的事情，比如安装postgresql，构成了一个`cookbook`。
这些描述和操作，都用ruby语言编写，`cookbook`用源码管控。

在每个服务器（`node`）上面，会跑一个`chef-client`，从`chef-server`获得cookbook，
自己需要跑的东西（`run_list`），服务器给自己设置的属性（`attributes`），通知服务器自己的状态。

更多的文档，请见：http://docs.chef.io/

## 如何学习

chef相当的复杂，我花费了好多时间来学习它。这里是我建议的学习过程：

- 跟随[官方教程](https://learn.chef.io/)走一遍，因为期间需要下载很多库，建议用[Digital Ocean](https://www.digitalocean.com)等云平台进行教程的学习，这样不需要太长的下载等待时间。
- 自己写一个cookbook（比如我就写了[pptp_server](https://supermarket.chef.io/cookbooks/pptp_server)），期间遇到什么概念不明白，去[官方文档](http://docs.chef.io/)阅读，并且可以借鉴第三方cookbook的写法。
- chef引入了一个生态系统，基于chef的工具和概念相当多，请静下心来，一个个弄懂弄透。

## 个人的实践

掌握了工具仅仅是开始，更难的在于如何使用工具。这里整理我的一些实践操作。

- 如果是很简单的服务器搭建，可以登录到服务器上面去，直接按照recipe的写法创建一个文件`install.rb`，然后用chef-apply执行。
- 如果稍微复杂一些，可以用`chef-client --local-mode`，在服务器上面写一个cookbook。
- 如果需要写cookbook，也可以用local-mode在服务器上面测试好，再保存到本地。
- 如果你服务器比较多，或者需要快速搭建不经过server，你可以用[chef-solo](https://docs.chef.io/chef_solo.html)，[knife-solo](http://matschaffer.github.io/knife-solo/)是chef-solo的knife插件。
- 创建服务器也可以自动化，比如[knife-digital_ocean](https://github.com/rmoriz/knife-digital_ocean)。
- 一般可以写一个cookbook构建一个基础系统，带有自动更新，安全管理，创建发布用户，监控等。然后基于这个基础系统来搭建服务。

## 个人的一些思考

- chef很复杂，学习成本比较高，它可能解决一些问题，但是自己的复杂度可能也会引入更多的问题。
- 普通程序员可能只是用chef来搭建一个或几个服务器，用chef可能有点杀鸡用牛刀，但是自动化构建是很有必要的，chef引入的复杂概念，很可能是领域的原生复杂度。
- cookbook的调试过程太痛苦了，等待服务器执行操作，重新创建一个服务器来执行操作花费了好多时间。
- 第三方cookbook库里面比较混乱，安装一个东西可能有好几个cookbook，大家对于如何安装一个东西有不同的理解。
- cookbook可以通过node的attribute配置，也可以重新定义LWRP，我觉得这两个概念有一定程度的覆盖，设计不是很好，可能规整成一个概念。
- 有听说docker，在操作系统上层加上一个容器层，容器层类似集装箱，可以快速导入导出应用的环境，听说docker会取代大部分chef的使用场景。

