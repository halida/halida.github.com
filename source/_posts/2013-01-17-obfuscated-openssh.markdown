---
layout: post
title: "obfuscated-openssh介绍"
date: 2013-01-17 22:58
comments: true
categories: 
---

{% img /images/posts/aM4KX.jpg %}

缘由
--------------------

我一直采用的翻墙方法是这样的，我在linode上面买了一台vps，然后这台vps上面跑了pptp，openvpn，然后我连接VPN翻墙。

十八大来临的时候，pptp，openvpn都不太好用了，我只好采用ssh SOCK5的方式来翻墙。

但是前几天，GFW好像又升级了，识别到我的ssh的主要用途是翻墙，然后把我的ssh端口给封掉了。这下就麻烦了。我在网络上面搜索，发现切换端口后，还会把整个服务器给封掉。

他们封锁的逻辑是这样的：识别到ssh的协议，然后对协议的流量进行机器识别的分析，当发现疑似采用ssh翻墙的时候，就下黑手。

我考虑了各种解决方案，最后还是选择了采用 [obfuscated-openssh](https://github.com/brl/obfuscated-openssh)。

介绍
---------------------
虽然ssh的内容本身是加密传输的，但是ssh协议本身带有明显的包头特征，因此，DPI可以分析得出采用的协议是ssh，然后就可以根据流量状况来判断到底是做什么类型的操作，从而以此为依据搞鬼。

那么反制措施就很简单，把包头混淆掉就可以了。 obfuscated-openssh就是做这样的事情的。在它[Github项目主页](https://github.com/brl/obfuscated-openssh)上面的介绍如下：

首先发送含有一个神秘magic key的数据包，magic key前面是一定数量的随机数作为seed，后面也跟着一个长度，然后是这个长度数量的随机数，如下图：


    [     16 byte random seed           ][  magic  ][ plength ][ .. plength bytes of random padding ... ]
    |___________________________________||______________________________________________________________|
                    |                                                   |
                Plaintext                                Encrypted with key derived from seed 

这样保证第三方在不知道magic key的前提下，完全分析不出有用的数据从哪里开始，从而不知道协议是什么。

获取了random seed之后，加上一个只有服务器和客户端知道的密码，来生成解密后续内容的钥匙，然后服务器和客户端就可以继续通讯了，对于中间的窃听者而言，是不能获知协议类型的。

安装和使用
---------------------
在ubuntu机器上面编译的方法：

```bash
# 下载
git clone git://github.com/brl/obfuscated-openssh.git
# 移动到目录下面
cd obfuscated-openssh
# 准备编译环境
sudo apt-get build-dep openssh
# 编译
./configure; make
```

服务器端需要做的配置，首先修改sshd_config，里面几个重要参数：

- ObfuscatedPort 设置成需要服务的端口
- ObfuscateKeyword 只有服务器和客户端知道的密码

一个具体的示例：

```
ObfuscatedPort 2200
ObfuscateKeyword xxx

Port 2201
Protocol 2

HostKey /home/crawler/sources/obfuscated-openssh/ssh_host_rsa_key

RSAAuthentication yes
PubkeyAuthentication yes

Subsystem       sftp    /usr/libexec/sftp-server   
```

因为不要和系统的sshd冲突，需要生成一个新的rsa_key，安装和执行的代码如下：

```bash
# 生成秘钥:
ssh-keygen    # ssh_host_rsa_key
# 创建/var/temp
sudo mkdir /var/temp
sudo mkdir /var/empty
# sudo执行服务sshd:
sudo `pwd`/sshd -f ./sshd_config
```

然后客户端也是需要编译的，执行的方式：

```bash
# 执行ssh tunnel
./ssh -D 7070 your-username@yourserver.com  -N -p 2200 -zZ xxx
```

安装脚本
---------------------

为了方便使用，我整理了安装脚本：

服务器端：

```bash
sudo su
wget --no-check-certificate https://github.com/halida/install_script/raw/master/obsh_server.sh -O - | bash
```

客户端：

```bash
sudo su
wget --no-check-certificate https://github.com/halida/install_script/raw/master/obsh_client.sh -O - | bash
```

最后
---------------------

虽然包混淆能够让别人不知道我们采用的是ssh，但是流量分析还是可以做的，这样还是有很大可能性被发现是在翻墙，从而把服务器干掉。
还有就是如果以后采用了白名单制度，那么再怎么弄都没有办法了，因为只有特定外网才能访问。不过这种状况不太可能发生。
这样矛与盾的斗争还会一直进行下去，直到中国人获得自由的那一天到来。