---
layout: post
title: "智能家居之全屋音乐方案"
date: 2022-12-26 09:28:40 +0800
comments: true
categories: smarthome
---

目标：每个房间都有音箱，可以通过手机以及智能中控根据需要在每个房间播放音乐。
可以同时播放同一首，也可以不同房间播放不同的音乐。

选择协议：airplay2，支持多个音箱同时播放，并且有时序控制保持播放进度一致。
可以用iphone手机控制播放什么音乐，同时linux也有插件可以输出到airplay。

选用设备：如果有钱每个房间丢一个homepod，但是价格比较贵，我的方案是用便宜的电视盒子做主机，
操作系统armbian，按照这里的教程编译安装[Shairport Sync](https://sspai.com/post/74318)这种开源的airplay2实现。
设备选择M401A电视盒子或者N1，usb声卡PCM2704，音箱找一个淘宝桌面音箱就可以。

ubuntu接入airplay方法如下，然后就可以局域网内自动发现和手动选择输出设备了。

```sh
sudo apt-get install paprefs pulseaudio-module-raop

# 处理pulseaudio问题
sudo ln -s /usr/lib/pulse-13.99.1/ /usr/lib/pulse-13.99
```

价格：电视盒子72，usb声卡20，音箱158，控制通断的wifi开关插座20。

实现的场景：
- 想要听音乐的时候，用HA开启wifi开关，手机音乐软件播放音乐，选择airplay输出的音箱。
- 未来还可以接入Home Assistant，armbian里面跑VLC telnet，HA控制播放声音提醒。
