---
layout: post
title: "用chef对少量服务器进行配置管理"
date: 2015-05-05 10:12:09 +0800
comments: true
categories: 
---

原先[介绍了chef](http://blog.dev/blog/introduce-chef/)，现在需要面对一个实际的问题：如何用chef管理少量的服务器。

我希望：

- 能够对几台或者十几台服务器进行配置管理。
- 针对每台服务器，写yml格式的配置文件，执行一个命令之后，就可以配置好这台服务器，同时源码管控这个yml文件的变更。
- 支持复杂的服务器配置，包括启动项目管理，自动告警，日志归总等。
- 不需要管理服务器，比如chef-server这样的东西，只需要留有本地的配置文件。

我采用的解决方案：

- 用[littlechef](https://github.com/tobami/littlechef)，这个项目可以把[chef-solo](https://docs.chef.io/chef_solo.html)，一个本地跑chef的方法，部署到远端服务器上面去，同时拷贝本地的recipe和配置文件到远端，执行需要的操作。
- 写recipe，让部署能够通过写node配置文件进行配置，比如启动服务，日志归总，服务器管理员用户，自动重启更新等。
- 用yml格式撰写node配置文件，以及datatag配置文件，然后用自动化脚本转换成json格式。手动写json太反人类了。
- 远端的脚本用ruby写，脚本里面的参数不是用erb渲染出来的，而是把配置序列化成yml，ruby脚本再读取它们。这样远端服务器上面的执行代码是规整的，人可以阅读。

都弄好之后，可以写这样的服务器配置文件：

```yml
---
  # 服务器名字
  name: "test"
  # 基础配置的recipe
  base-system:
    # 是否跑软件包更新
    update: false
    # 是否设置自动更新
    auto-upgrade: true

    # base-system会自动创建一个deployer管理员用户，谁可以通过公钥的方式访问这个用户
    authorized_keys:
      - "linjunhalida"

    # 写在databags里面的配置参数，可以连接到slack发提醒
    notify: 'test'
    # 是否每天判断服务器是否需要重启或者更新
    check:
      need_reboot: true
      need_upgrade: true
    # 设置服务器定期重启
    schedule-reboot:
      minute: '26'
      hour: '8'
      weekday: '2'
    # 设置服务器自动升级安全更新
    schedule-upgrade:
      reboot: true
      minute: '1'
      hour: '0'
      weekday: '1'
    # 服务器启动的时候跑的应用
    start:
      - name: "railsapp"
        user: 'deployer'
        pwd: '/home/deployer/apps/railsapp/current'
        cmds:
          - 'bundle exec thin restart -C config/thin.yml'
          - 'RAILS_ENV=staging bundle exec rake resque:restart_workers'
          - 'RAILS_ENV=staging bundle exec rake ts:restart'

  run_list:
    - "recipe[chef-solo-search]" # so chef-solo search can work
    - "recipe[base-system]"
```

chef部署之后，会创建目录`/etc/base-system`，里面存放各种配置和执行脚本，同时安装到crontab，/etc/rc.local等各种地方。
服务器的关键操作，比如重启，安全更新结果，都会通过notify功能汇报到slack上面。
我可以通过node配置文件，清晰看到每台服务器是如何配置的。并且这个系统可以演化，更换一种配置方式，只需要重新跑一下部署。

不过还是有一些难办的问题：

- littlechef项目成熟度不高，使用起来不是很舒服。
- 架构复杂：chef已经很复杂了，远端还要部署一个ruby环境，架构复杂带来调试和理解上面的难度。
- 学习成本高：维护者需要弄懂chef，远端编织起来的ruby框架，之后才能配置服务器，最后可能只是需要加上一个小东西。
- 维护成本：又多了一个项目了。

