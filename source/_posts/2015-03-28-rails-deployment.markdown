---
layout: post
title: "rails项目的发布"
date: 2015-03-28 10:34:22 +0800
comments: true
categories: 
---

[capistrano](http://capistranorb.com/)/[mina](https://github.com/mina-deploy/mina)可以用来发布rails项目，它们是应用发布的最佳实践。

关于应用发布，需要满足以下要求：

- 发布的版本确保可以运行之后，才替代现有版本。
- 留存有旧的版本，必要的时候可以恢复。
- 发布版本不应该带有版本管控信息，防止不必要的信息泄漏。
- 配置文件，数据文件和代码分离：另外存放，不和发布的代码混在一起。

capistrano/mina的解决方案：

- 发布的各个项目版本放在releases目录下面，各个版本的目录名称按照1，2，3的顺序递增。
- current是真正跑的版本，是指向release的软链接，当新项目发布成功的时候，再修改软链接。
- scm目录存放带有项目管控的代码。
- shared目录存放配置文件，数据文件，按照需要软链接到各个发布版本里面去。

配置：

capistrano（以下简称cap）写一个`config/deploy.rb`，里面定义了一系列的rake任务，以及一系列的role（角色，比如数据库，应用服务器，网站服务器），
rake任务定义了在什么role上面执行什么命令。各种配置环境写在config/deploy/文件夹里面，命名`producton`, `staging`等，
当需要发布项目的时候，执行`cap production deploy`，就根据配置环境和deploy脚本执行操作。

执行任务过程如下：

- 创建目标环境releases/n
- scm获取最新的项目，然后根据配置中指定的版本号，拷贝代码到releases/n
- 初始化releases/n
- 把app/release/23链接到app/current，然后重启服务
- 清理releases/目录，只保留最新的几个版本

cap在服务器上面执行代码的方式，是通过维护一个ssh连接实现的，每次执行任务都要上传命令，返回结果，如果ssh连接比较慢的话，整体消耗时间就很长。
mina它的原理是生成一个bash脚本，上传到服务器上面执行，这样执行效率比cap高太多，大家可以考虑作为替代使用。

这种方式是传统的编译发布，另外有直接发布环境的方法，比如用docker。不过这种发布方式我没有研究清楚，等研究过之后再比较吧。
