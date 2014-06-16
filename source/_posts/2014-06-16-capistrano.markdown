---
layout: post
title: "capistrano介绍和入门"
date: 2014-06-16 10:28:51 +0800
comments: true
categories: ruby
---

{% img /images/posts/2014_06_16_cap.png %}

[Capistrano](http://capistranorb.com/)是一个ruby写的远程服务器自动化和部署工具。

虽然我们可以直接连上服务器操作部署，甚至可以写脚本自动来做，但是比起自动化工具来说，有以下缺点：

- 多台服务器任务量巨大。
- 手动操作的话，需要连上服务器手动执行，步骤烦琐，容易操作错误和忘记事项。
- 写脚本自动操作不能重用到其他项目里面去。

用了自动化工具，可能第一次配置比较复杂，但是配置好了之后，发布工作就简单得只需要执行一个命令，轻松愉快。
它也有学习复杂，因为有抽象出现问题难以找到原因，造成额外心智负担的问题，
这个要开发者根据项目大小和类型来做权衡。

看了官方文档，wiki，看了一天都没有看出门道，后来看官方网站上面的文档才慢慢弄懂。

Capistrano的原理是这样：

- 需要部署的服务器根据角色(role)区分: 比如有app，db，web，然后每个角色可以有多台服务器。
- 针对不同角色，设置各类的任务，设置执行一些命令。
- 可以根据阶段设置不同的stage，比如staging/production，staging用来本地测试环境的部署，production用来进行生产环境的部署。
- 默认的一套发布流程包括了检查服务器环境，更新代码，初始化，上线等各种过程。
- 每个过程都提供了钩子，把任务链接到钩子上面，就能够保证部署过程按照期待的状况进行。

弄懂如何用cap比较麻烦，我整理了一下如何学习的资料：

- 首先是去看[官方文档](http://capistranorb.com/)，对于基础概念，有一定的了解。
- 一定要实际部署一下，可以用本地环境测试，repo_url设置成本地，比如"user@localhost:/home/user/testapp"。
- 弄清楚发布到服务器上面的文件架构。本地测试部署一次就清楚概念了。
- 如果需要自动部署rails，可看[别人整理的一份详细文档](https://ruby-china.org/topics/18616?page=2#replies)。

然后学习一些原理性质的资料：

- 弄清楚[发布过程和逻辑](http://capistranorb.com/documentation/getting-started/flow/)。
- 如何在服务器上面执行代码是用SSHKit库，需要[看一遍文档](https://github.com/capistrano/sshkit)。
- 看一遍用到的cap相关Gem，包括[capistrano](https://github.com/capistrano/capistrano/tree/master/lib/capistrano/tasks), [capistrano-bundle](https://github.com/capistrano/bundler/blob/master/lib/capistrano/tasks/bundler.cap), [capistrano-rvm](https://github.com/capistrano/rvm/blob/master/lib/capistrano/tasks/rvm.rake), [capistrano-rails](https://github.com/capistrano/rails/blob/master/lib/capistrano/tasks/)里面rake是怎么执行的，弄清楚原理。

