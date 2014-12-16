---
layout: post
title: "linux分区策略"
date: 2014-12-16 17:21:51 +0800
comments: true
categories: linux
---

![image](http://product-images.www8-hp.com/digmedialib/prodimg/lowres/c03690405.png)

最近我购买了[一台NAS](http://www8.hp.com/cn/zh/products/disk-backup/product-detail.html?oid=6280791)用作家庭服务器，需要考虑如何设置磁盘，如何分区和安排加载linux目录，这里整理一下思路。

我有SSD和HDD（就是我们平常的硬盘），SSD读写更快，但是有写入寿命，以及平均价格更贵。SSD挂载在`/`，这样操作系统跑起来更快。`/home`，`/var`这种经常写操作的目录，就挂载在HDD上面。`/tmp`这种临时目录，可以用内存文件系统`tmpfs`。

SSD的分区用`ext4`就好，不过需要[设置一些参数用来减少写入](http://superuser.com/questions/228657/which-linux-filesystem-works-best-with-ssd)。HDD的分区根据状况，如果是普通操作，`ext4`就可以了，如果用来分享文件和媒体，可以用[ZFS](http://doc.freenas.org/9.3/freenas_intro.html#zfs-primer)，压缩存储，更高的IO性能。

如果用硬盘架设NAS，最简单的方法是RAID0，多磁盘同时读写增加性能。如果有重要数据，用RAID1，2个磁盘镜像备份。RAID1镜像有点浪费空间，可以用软件RAID5增加使用效率，如果你对RAID不熟悉，这里有一个[形象的演示](http://www.acnc.com/raid)。





