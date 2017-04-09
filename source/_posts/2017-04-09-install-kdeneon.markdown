---
layout: post
title: "在新笔记本上安装Kdeneon"
date: 2017-04-09 09:58:40 +0800
comments: true
categories: 
---

最近我2012年底买的rmbp电脑越来越不给力,于是打算换一台新的笔记本,操作系统选回Linux.
为什么要用Linux而不继续买苹果呢,因为看新的苹果笔记本没有什么大的改进,还有我慢慢不喜欢苹果的软件锁死策略了,
Linux可选性更高也更适合开发工作.

新的笔记本我选择Precision 5520 4K屏幕版本.价格比较贵(2万多).
为什么选这个呢,因为是我的主打生产笔记本,期待能够长期使用就选商用版本,
屏幕好一些可以坚持比较久,也对自己眼睛好点.

## 具体笔记本长什么样

[见图册](http://imgur.com/a/Fb7Lt).

笔记本到货之后检查外观,检查系统配置是否和自己买的一样,检查屏幕是否有坏点.

## 安装Linux

现在回到主题,笔记本拿回来还是要安装Linux的.我选择Kdeneon作为发行版.
因为我对debian系比较熟悉,同时也更喜欢KDE桌面.KDE官方网站推荐这个版本.

[官方网站](https://neon.kde.org/)下载稳定版Kdeneon,
下载之后检查了一下checksum防止下载错误,然后用[UNetbootin](https://unetbootin.github.io/)烧录到USB闪存上面准备安装.

第一个坑:**无法进入Live系统**.[查了一下](http://askubuntu.com/questions/38780/how-do-i-set-nomodeset-after-ive-already-installed-ubuntu)发现是开源的nouveau驱动不支持新版的Nvidia显卡驱动,需要在启动的时候关闭,设置方法:
grub里面Linux那一行尾部加上 `nomodeset`,之后就可以进入Live系统了.

系统安装好之后也要改,修改文件`/etc/default/grub`,在`GRUB_CMDLINE_LINUX_DEFAULT`后面加上`nouveau.modeset=0`,
之后执行`sudo update-grub`.

系统安装好之后,可以自动识别一下显卡驱动,执行`sudo ubuntu-drivers devices`,然后根据提示,安装对应的驱动版本,比如:`sudo apt install nvidia-375`.

第二个坑:**磁盘无法识别**,系统安装过程中提示`Ubi-partman failed with exit code 141`,发现是因为硬盘选项SATA->RAID中,用到了Intel RST driver,现在开源系统还不能很好地处理,需要换成其他设置.

第三个坑:**无法休眠**,我已经习惯苹果笔记本的合起来休眠功能,但是系统装好之后,却发现只有Sleep,却没有Hibernate.
[找了一下](http://askubuntu.com/questions/868208/how-to-activate-hibernation-in-16-04-1-systemd),
发现是需要关闭`Secure boot`,不然无法控制休眠.回到BIOS关闭之后,执行`systemctl hibernate`成功了.

但是在KDE下面还是没有办法使用Hiberrnate,我下载了KDE的电源控制UI`Powerdevil`,看到原理是ibus查询org.freedesktop.login1.Manager的CanHibernate,后端是logind.根据[这篇文档](https://help.ubuntu.com/stable/ubuntu-help/power-hibernate.html),增加了logind允许使用Hibernate的配置就可以了.

第四个坑:**中文输入法**.系统安装好之后没有UI设置如何选输入法,以及什么中文输入法比较好,找来找去,还是用ibus-pinyin吧.
安装:`sudo apt-get install ibus-qt4 ibus-gtk ibus-gtk3 ibus-pinyin`,启动执行`ibus-setup`.

但是各个窗口都没有办法输入中文,怎么办?查了以下,设置了环境变量之后,窗口才会响应输入法,环境变量设置方法如下:

```sh
export XMODIFIERS="@im=ibus"
export GTK_IM_MODULE="ibus"
export QT_IM_MODULE="ibus"
```

其实不用自己手动选择,用`im-config`,它会修改`~/.xinputrc`,增加`run_im ibus`,在进入桌面环境的时候设置这些环境变量.
但是终端里面的环境变量还是要手动加到自己的shell初始化脚本里面.

第五个坑:**4K屏幕分辨率**,因为屏幕分辨率很高,窗口都会很小,在KDE下,可以通过设置Display->Scale解决.
不过还是有很多非KDE的程序,比如Steam,TeamViewer没有办法改,他们没有用到Qt的基础架构就没有办法scale了.
我现在暂时没有找到简单的解决方案,就放着吧.

第六个坑:**PPTP客户端**,设置好了之后,可以连接,但是连接之后本地的DNS死活解析不到,实在找不到原因,莫非是因为本地安装的dnsmasq的问题?现在只能用kcptun加ss解决问题.

好吧弄了那么久,终于可以正常使用系统了.

## 常用软件

这些是我常用的工具:

- 基础支持: `build-essential openssh-server default-jre curl`
- 常用软件: `tmux zsh tree etherwake`
- 开发相关: `emacs git-core ack-grep mysql-server redis-server`

然后一些手动安装的工具:

- Chrome: 官方下载
- Steam: 记得安装源里面的,官方下载的安装有问题
- proxychains-ng: github下载编译好的可执行文件
- ss: 源里面就有
- Dropbox: 官方下载
- OverDrive: Google Drive linux客户端,需要购买

开发环境相关软件:

- Virtualbox: 官方下载就好
- [oh-my-zsh](https://github.com/robbyrussell/oh-my-zsh): zsh配置环境
- rvm: ruby环境
- [prax](https://github.com/ysbaddaden/prax.cr): linux下类似[pow](http://pow.cx/)的工具,可以输入域名:app.dev,自动启动和访问本地的ruby项目.




