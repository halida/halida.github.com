---
layout: post
title: "笔记本结合台式机开发方案"
date: 2022-12-30 10:05:10 +0800
comments: true
categories:
---

作为程序员，需要移动工作，同时开发环境也比较复杂，便携的笔记本性能不够，就算是再好的笔记本也会有功耗墙来阻止性能的发挥。

我的方案是：便携笔记本电脑结合强力台式机进行开发。方法是这样的：

编辑代码需要快速反应，所以编辑代码还是要在笔记本里面，修改自动推到台式机上。

```sh
lsyncd -nodaemon -insist -delay 0 -rsyncssh user/workspace/project/ pc user/workspace/project/
```

台式机有代码和开发环境，跑代码在后台tmux里面，如果不用了就休眠 `sudo systemctl hibernate` 需要使用的时候就用wakeonlan唤醒，ssh登录上去进行操作。

```sh
wakeonlan MAC; while [ True ] ; do ssh pc ; sleep 1 ; done
```

笔记本转发台式机的开发环境网站端口到本地，循环监控保证断点续连。

```sh
while [ True ] ; do ssh -N -L localhost:3000:localhost:3000 pc ; sleep 1 ; done
```

如果是在外面，需要想办法连回家，我的实现方式是家里面有一台24小时开机的服务器，跑wireguard，路由器有外网ip和ddns，转发wireguard端口，
这样我在外面就可以通过ddns的地址连到wireguard端口，进入家庭内网了。

其它考虑：

- 跑通之后，就可以只用轻量级笔记本了，但是轻量级笔记本还是需要使用网页，看视频，开IDE，性能也不能太差。
- 有的时候不需要使用台式机的时候会忘记休眠，可以写一个脚本断开一段时间后自动休眠。
