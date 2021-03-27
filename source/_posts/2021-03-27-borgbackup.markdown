---
layout: post
title: "更合理的文件备份方法"
date: 2021-03-27 13:30:20 +0800
comments: true
categories: 
---

重要资料需要通过备份保证不丢失，这里整理一下我研究的备份策略。

首先资料应该远程备份，不能和当前的存储介质在一个区域，不然出事了就一起完蛋了。

资料备份应该自动和定期，手动太繁琐，很容易坚持不下去。不定期备份起不到备份的效果。

资料应该可以增量备份，不然空间占用太多。

增量备份需要和备份比较计算，所以远端机器必须参与计算。
现在大家常用的工具是rsync，但是并不能很好地做到增量计算。

我推荐用[borgbackup](https://borgbackup.readthedocs.io/)，
服务器安装borgbackup之后，并不需要跑服务，执行备份的时候，会通过ssh执行服务器端的可执行文件来跑服务器的工作，架构比较简单。
其它还有一些工具都比较重量级需要跑服务，就不推荐了。

安装：`sudo apt install borgbackup`

本地机器可以通过命令行工具查看备份，比较备份结果，把某个历史镜像加载到本地，具体可以看[教程](https://borgbackup.readthedocs.io/en/stable/quickstart.html)，
或者快速例子：

```sh
mkdir -p ~/data/workspace/borg
cd ~/data/workspace/borg

borg init -e none backup
borg create backup::1 data
borg create backup::2 data
borg list backup
# 1                                    Wed, 2020-10-28 13:55:56 [xxx]
# 2                                    Wed, 2020-10-28 13:56:13 [xxx]

# 换名称
borg create backup::`date +%FT%T` data

# list files
borg list backup::2
# recover
borg extract backup::1
borg extract backup::1 data/a.txt

borg delete backup::1

borg diff backup::1 2

# 加载备份到本地，可以拷贝需要恢复的文件出来
borg mount
borg umount
```

如果需要定期备份到远端，
本地机器加上一个cronjob定期跑备份即可：

```
crontab -e
1 14 * * * ~/scripts/backup_laptop.sh
```

脚本内容在[这里](https://gist.github.com/halida/e2de6c3704c7febf139d5ff39d1756fb)。

