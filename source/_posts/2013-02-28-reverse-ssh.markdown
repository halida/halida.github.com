---
layout: post
title: "如何从外网访问内网主机"
date: 2013-02-28 11:11
comments: true
categories: 
---

![image](http://i.imgur.com/Ay4f5YX.jpg)

很多时候，我们需要在外面访问公司，或者家里面的电脑，但是我们一般情况下这些电脑没有办法直接暴露到外部网络中，那么我们应该怎么做呢？我们需要一个外面的VPS，或者另外一台暴露到公网的主机作为跳板。

假设：

- A主机（$A_IP）：我们内网需要被访问的主机。
- B主机（$B_IP）：有一个公网IP的主机，可以是购买的VPS。
- C主机（$C_IP）：需要访问A主机的电脑，比如我们随身的笔记本或者手机。

首先我们需要把A主机的ssh链接到B主机上面：

    autossh -M 2132 $B_IP -N -R 6333:localhost:22
    
我们用autossh来保证A主机的ssh一直保持连接。这个命令把A主机的ssh端口绑定到B主机的6333端口上面。

然后我们需要把B主机的6333端口暴露到公网，工具采用的是万能的端口接口工具socat：

    socat TCP-LISTEN:6335,fork TCP:localhost:6333
    
这样在公网的C主机就可以通过B主机的6335端口访问到A主机了：

    ssh $B_IP -p 6335
    

