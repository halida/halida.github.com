---
layout: post
title: "windows服务器远程跑命令行代码"
date: 2017-12-05 22:26:28 +0800
comments: true
categories: 
---

windows服务器的管理都是通过远程桌面来登录，但是我们程序员不喜欢用GUI操作，
更喜欢执行脚本命令，因为这样更容易自动化。
这里整理一下如何用命令行登录到windows服务器上面执行任务。

windows有一个win-rm服务，类似于ssh，可以让远程连进去执行命令。

在服务器上面用管理员的powershell跑：`Enable-PSRemoting`
就可以了，默认使用http 5985端口。记得设置服务器或者云的安全设置把对应端口开启。
如果要开放给外网，要用https，[这里是](http://www.pstips.net/configure-winrm-under-https-transport.html)配置方法。

如果没有把服务器加到域里面，就必须用https，如果加到了域里面，登录只要用服务器的账户就可以了。
如果在同一个域的其他服务器里面，甚至不需要输入密码。

使用方法：`Enter-PSSession -ComputerName COMPUTER-NAME -Port 5985`

我们可以用ruby代码来执行命令，可以用Gem [winfm](https://github.com/WinRb/WinRM)。

更多资料[见这里](http://www.pstips.net/remote-manage-vm-hosted-on-windows-azure.html)。
