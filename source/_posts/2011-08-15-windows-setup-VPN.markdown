---
layout: post
title: windows下面设置VPN连接
date: 2011-08-15 10:24:12 +0800

comments: true
categories: 
---

![image](http://www.clickonf5.org/wp-content/uploads/2009/12/InternetAccessVPN_thumb.png)

什么是VPN
------------------------------

简单地说, VPN就是, 网络上面一台主机, 建立了一个虚拟的网络.
然后我们的电脑登录上去, 加入到这个虚拟的网络里面来.
然后我们就可以利用这个主机做跳板, 访问网站,
或者同属于这个虚拟网络的电脑.

这样可以让物理上分布在不同地点的电脑, 看起来好像在一个局域网络下面.

一般来说, VPN用来做几件事:

-   在外网的电脑, 访问一个局域网络, 方便在家办公.
-   利用提供服务的主机做跳板, 访问这个主机所在位置的资源.
    就是我们说的翻墙.

windows下面设置方法
------------------------------

这里有一个教程:
[http://netfee.ustc.edu.cn/ylxia/help/faq/faq\_howtosetupvpn\_winxp.htm](http://netfee.ustc.edu.cn/ylxia/help/faq/faq_howtosetupvpn_winxp.htm)

我也自己整理了一下:

-   点击控制面板-\>网络连接,
-   左边建立新连接. 下一步, 连接到我的工作网络
-   下一步, 虚拟专用网络.
-   公司名称随便输入
-   设置IP.
-   点击完成.
-   然后输入用户名和密码.
-   然后连接就可以使用了.