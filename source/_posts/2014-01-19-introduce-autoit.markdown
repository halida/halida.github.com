---
layout: post
title: "autoit介绍"
date: 2014-01-19 20:47:06 +0800
comments: true
categories: 
---

最近回到老家干IT，工作中遇到很多安装无聊软件的事情，为了能够自动化操作，我去寻找了一下类似按键精灵这种自动化工具，被我发现了[autoit]()这个工具兼脚本语言。

简单介绍一下核心逻辑。比如说每次你希望每次打开记事本，都会自动输入一个抬头信息，比如"author: halida"，那么你可以写以下的autoit脚本：

    Run('notepad')
    WinWaitActive("xxx", "")
    Send("!N")


