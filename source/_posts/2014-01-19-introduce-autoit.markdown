---
layout: post
title: "autoit介绍"
date: 2014-01-19 20:47:06 +0800
comments: true
categories: 
---

{% img /images/posts/2014_01_19_autoit.jpg %}

最近回到老家干IT，工作中遇到很多安装无聊软件的事情，为了能够自动化操作，我去寻找了一下类似按键精灵这种自动化工具，被我发现了[autoit](http://www.autoitscript.com/site/)这个工具兼脚本语言。

简单介绍一下核心逻辑。比如说每次你希望每次打开记事本，都会自动输入一个抬头信息，比如”author: halida”，那么你可以写以下的autoit脚本：

    Run('notepad.exe')
    WinWaitActive("无标题 - 记事本", "")
    Send("author: halida")
    
简单的三部曲。执行命令，等待特定窗口出现，发送内容给窗口。 autoit也可以直接发送内容和操作给特定的窗口中的控件。

一些核心特性：

- 能够把脚本解释执行，或者编译成exe。exe非常小以及无其它依赖。
- autoit脚本是完备的语言，控制流，函数，数据结构都有，可能不如现代动态语言那么强大，但是足够方便地编写程序了。
- 带有丰富的API支持，随机数，进程处理，文件操作，窗口操作，网络，硬件，鼠标键盘，COM，声音，剪贴板。。应有尽有。
- 可以用autoit来做简单和稍微有一些些复杂的GUI界面。
- 足够大的社区支持。同时有[官方社区](http://www.autoitscript.com/forum/)和[中文社区](http://www.autoitx.com/)。

那么autoit可以做哪些事情呢？我觉得可以做的事情有：

- 自动化windows下面的操作。节省人力。
- 编写脚本来自动化软件安装和删除，方便运维管理。
- 编写大型软件的加载页面，提升用户体验。
- 写简单的windows程序，和复杂的MFC说再见。

对于我来说，可以填补windows下面自动化操作的空白，从此我在所有领域都不再担心不能自动化操作了。

那么如何学习呢？我的建议是按照下面的顺序：

- 过一遍[官方教程](http://www.autoitscript.com/autoit3/docs/)，按照官方教程写点简单的用例。
- 过一遍[官方文档](http://www.autoitscript.com/autoit3/docs/)，对于autoit能够干什么有概念。
- 开始编写你自己需要的简单程序，巩固上面学习到的东西。
- 然后多翻翻社区和[wiki](http://www.autoitscript.com/wiki)，收集一些最佳实践，成为一个靠谱的autoit开发者。

前3步我想任何一个程序员一周内都就可以搞定，带来的收益是节省下无数枯燥的重复操作时间。


