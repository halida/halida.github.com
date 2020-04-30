---
layout: post
title: "如何一个人管理一堆服务器"
date: 2017-07-08 19:45:17 +0800
comments: true
categories: 
---

现在有一些服务器自动化配置工具，比如ansible，chef，puppet等，
利用它们，可以实现我的一个想法：用配置文件定义服务器架构，从而实现一个人管理好一堆服务器。

比如用ansible，我们可以用一个YAML文件申明一台服务器上面有什么：安装了什么应用，存在什么配置文件，跑了什么服务。
然后用命令行工具，比如ansible-playbook，就可以构建出来这样的服务器。

这样操作的优点：

- 可视化：原先服务器手工构建，其他人，甚至构建者自己都会不清楚服务器的状况。现在有了配置文件，大家就可以知道服务器上面有什么，是如何配置的。
- 自动化：可以一条命令构建服务器，修改配置文件之后可以批量改动影响到的服务器，增加带有同样应用的服务器也非常简单，只要拷贝配置即可。如何搭建应用的知识可以复用。
- 版本控制架构变更：可以用git版本库管理服务器配置文件，我们可以记录每次服务器架构的变更了。

具体操作：针对一组服务器架构，比如一个Rails应用以及附属的各个服务器，
可以创建一个git版本库记录所有的ansible playbook，
然后把敏感的配置文件，放到另外一个私密git版本库里面，
[加密存储](http://blog.linjunhalida.com/blog/encrypted-git-repo/)，保障安全性。

我搭建了一个演示用例，包括：

- [一个Rails应用](https://github.com/halida/haterslist)
- [ansible配置](https://github.com/halida/haterslist_ansible)
- [私密配置](https://github.com/halida/haterslist_conf)（仅限于演示）

里面包含几台服务器：

- [app.yml](https://github.com/halida/haterslist_ansible/blob/master/playbooks/app.yml)
搭建Rails服务器，包括mysql数据库，nginx，systemd自动启动和监控脚本。
- [backup.yml](https://github.com/halida/haterslist_ansible/blob/master/playbooks/backup.yml)
自动备份mysql数据库
- [zabbix.yml](https://github.com/halida/haterslist_ansible/blob/master/playbooks/zabbix.yml)
对应的监控服务器（未完工）

私密配置版本库里面存放了所有的配置文件，构建一些应用需要的用户名和密码，一些初始化数据等。
在playbook里面会去读取这些配置文件，或者拷贝这些文件到服务器上面去。

管理Rails应用还需要一些其他的功能，限于时间，我就没有实现了，包括：

- jenkins 自动化测试
- sandbox，staging环境
- mysql多主从架构
- 多app负载均衡

综上所述，一个复杂的多服务器应用架构，可以用上面的几个版本库定义出来，并且可以根据需要动态进行修改。
这种配置方式适用于几十台机器之内的半静态架构，并且可以多人同时管理。

更进一步，如果利用aws或者digitalocean的api，服务器创建也可以采用配置文件定义。
不过我觉得使用起来并不是很方便，就没有这样做了。

如果机器数量多，或者需要动态伸缩，配置文件可能就不太适合了，可以用ansible-tower这种在线配置管理工具。
不过我觉得大多数的公司都不会达到这样的级别，因此配置文件就够用了。
