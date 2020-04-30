---
layout: post
title: "给Rails加上https支持"
date: 2013-03-24 18:46
comments: true
categories: rails
---

{% img /images/posts/4mClj73.jpg %}

https是针对http的加密协议，它可以保证用户访问网站的过程中，通讯的数据是加密的，这样可以防止第三方监听，保护用户隐私。这里总结一下如何给Rails加上https的支持。

首先，假设你的rails已经跑起来了，在`http://yourserver.com`，服务器是ubuntu，本地的访问方式是`127.0.0.1:8787`，那么你需要利用`nginx`来提供https的服务。

首先安装`nginx`和`openssl`：

    sudo apt-get install nginx openssl
    
生成服务器的秘钥公钥：

    openssl req -new -nodes -keyout server.key -out server.csr
    openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt
    
生成的几个文件解释：

- `server.key` 服务器的私钥。
- `server.csr` (certificate signing request) https证书签名请求。
- `server.crt` 生成的服务器证书。

然后有这些文件，我们可以配置nginx服务了。

生成nginx的配置文件：

    sudo touch /etc/nginx/sites-available/yourserver
    sudo ln -s /etc/nginx/sites-available/yourserver /etc/nginx/sites-enabled
    sudo vi /etc/nginx/sites-available/yourserver
    
里面的内容：

```
upstream unicorn {
  server 127.0.0.1:8787 fail_timeout=0;
}
server {
  listen       443;
  server_name  yourserver.com;
    
  ssl                  on;
  ssl_certificate      yourpath/server.crt;
  ssl_certificate_key  yourpath/server.key;
    
  ssl_session_timeout  5m;
    
  ssl_protocols  SSLv2 SSLv3 TLSv1;
  ssl_ciphers  HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers   on;
    
  location / {
      proxy_set_header Host $host;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto https;
      proxy_redirect off;
      proxy_pass http://localserver;
  }
}
```

需要修改里面的`server_name，yourpath`。

然后重新启动nginx:

    sudo service nginx restart
    
如果没有报错，那么你就可以通过`https://yourserver.com`来访问你的网站了。

不过，浏览器会阻止你继续访问，或者需要你的确认。
浏览器会保存一份可信网站的列表，你的服务器加密是自己生成的，不在里面。
如果你的网站是商用的，最好去注册一下。[这里](https://www.name.com/ssl)有一个指引。

引用资料：

- [railscast](http://railscasts.com/episodes/357-adding-ssl?view=asciicast)