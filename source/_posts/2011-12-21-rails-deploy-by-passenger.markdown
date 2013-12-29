---
layout: post
title: rails_deploy方法之采用passenger
date: 2011-12-21 09:32:08 +0800

comments: true
categories: 
---

这里整理一下rails deploy的几种方法.

Passenger
------------------------------

首先是最简单的采用 [Phusion
Passenger](http://www.modrails.com/documentation.html),
现在大家都用nginx了吧, 那么下面主要还是看
[passenger和nginx的配置](http://www.modrails.com/documentation/Users%20guide%20Nginx.html).

首先安装passenger:

```sh
gem install passenger
```

然后安装nginx插件， 需要系统权限， 所以采用rvmsudo:

```sh
rvmsudo passenger-install-nginx-module
```

然后设置nginx: (sudo vi /opt/nginx/conf/nginx.conf)

```sh
http {
    passenger_root /somewhere/passenger-x.x.x;
    passenger_ruby /usr/bin/ruby;
    passenger_max_pool_size 10;

    gzip on;

    server {
        server_name www.foo.com;
        listen 80;
        root /webapps/foo/public;
        passenger_enabled on;
        passenger_use_global_queue on;
    }
}
```

修改完设置之后重新启动nginx:

```sh
sudo /opt/nginx/sbin/nginx -s reload
```

重启服务的话只要:

```sh
touch /webapps/mycook/tmp/restart.txt
```

基本上这样就可以了. passenger工作的方式还是基于多进程, 它会根据一套算法,
来计算开启多少个线程, 以及如何生成进程, 来响应用户请求.

最好要看一下 passenger\_spawn\_method 和 Spawning methods explained
的部分, 了解一下工作原理. Analysis and system
maintenance这部分也最好看看.

不过听说passenger只是给初学者用的, 大家会用其他的可配置的工具. 比如
[unicorn](http://unicorn.bogomips.org/) 等等.

这里再补充一下unicorn的使用方法, 基本上gem install unicorn,
然后执行unicorn\_rails -p 8080就可以了.
在nginx上面设置一下端口转发80到8080就能用了. 这里有一个 [unicorn
nginx的示例](http://unicorn.bogomips.org/examples/nginx.conf) 可以抄.