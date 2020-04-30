---
layout: post
title: "how to mount disk to linux operation system"
date: 2014-12-16 17:33:42 +0800
comments: true
categories: english
---

![image](http://product-images.www8-hp.com/digmedialib/prodimg/lowres/c03690405.png)

I've bought a [NAS](http://www8.hp.com/cn/zh/products/disk-backup/product-detail.html?oid=6280791) as home server recently, so I've considered how to mount disk on it by using linux operating system.

I've got SSD and HDD, SSD is faster, but is more expensive, and write time limit. So SSD should mount at `/`, OS will run faster. Writing frequently location like `/home`, `/var` should mount on HDD, Temporary location `/tmp` should mount to file system `tmpfs`.

About choosing file system. SSD can use `ext4` with [some adjustment](http://superuser.com/questions/228657/which-linux-filesystem-works-best-with-ssd) to reduce write, HDD can use `ext4` for ordinary use, if used for file sharing and service, [ZFS](http://doc.freenas.org/9.3/freenas_intro.html#zfs-primer) is a good fit: Compressed storage, higher ID throughput.

If you want setup NAS disk array, RAID0 is the simplest solution, multiple disks handle IO in the same time. If you have to store some important data, use RAID2: dual disk write the same data. But RAID1 spend too much disk space, software RAID5 can balance it well enough. If you know nothing about RAID, you can watch [this demo](http://www.acnc.com/raid).





