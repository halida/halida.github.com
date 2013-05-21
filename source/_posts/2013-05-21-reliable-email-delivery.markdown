---
layout: post
title: "提升电子邮件的送达率"
date: 2013-05-21 19:15
comments: true
categories: 
---

{% img /images/posts/email.jpg %}

现在大多数网站都会发送各种各样的邮件，保证邮件送达率至关重要，这里整理一下我调研的一些结果。

要让邮件正常到达用户的收件箱，需要保证几点：

- 让收件方验证邮件来源是非伪造的，需要设置`PTR`，`SPF`，`DKIM`。
- 让收件方认可发送者是可靠的。

## 如何让收件方验证邮件来源是非伪造的

### PTR

ptr是[DNS记录的一种类型](http://en.wikipedia.org/wiki/List_of_DNS_record_types)，有一个用途在于反方向从IP推导到域名，比如：

    dig -x 203.208.36.17

把DNS的`MX`类型记录指向到你邮件服务器的地址一般就可以了。

### SPF

SPF([Sender Policy Framework](http://en.wikipedia.org/wiki/Sender_Policy_Framework))这是一套电子邮件验证系统，通过在DNS记录中添加一个TXT类型的记录，指定谁有权以域名的名义发送邮件。如果你没有设置这条记录，很容易就被当做非法邮件spam掉。

这里是[配置方法](http://www.zytrax.com/books/dns/ch9/spf.html)，以及一个简单的例子：

    v=spf1 a mx ptr include:spf.mtasv.net ~all
    
这一行主要说明spf.mtasv.net([postmark](https://postmarkapp.com/)，一个邮件发送服务商)代发的邮件是被认可的。

如果你域名挂靠在[bluehost](http://bluehost.com)上面，这里是[对应的设置方法](http://www.mail-tester.com/spf/bluehost#create-spf-record)。

设置完毕，等待生效后，可以通过这种方式验证是否设置成功：

    dig txt your-domain.com
    
返回的信息需要带有你设置的SPF记录。

### DKIM

邮件本身是纯文本，协议也没有防止伪造的部分，在发送的过程中很容易被篡改，
DKIM([DomainKeys Identified Mail](http://en.wikipedia.org/wiki/DomainKeys_Identified_Mail))
对邮件用私钥加密，同时公钥信息放在域名DNS上面，这样收件方就可以验证邮件的真实性。

如果你用`ubuntu`以及`postfix`，这里是[设置教程](https://help.ubuntu.com/community/Postfix/DKIM)，以及一个简略的安装过程整理：

- 安装`opendkim` `sudo aptitude install opendkim`
- 设置 `/etc/opendkim.conf`
- 告诉`postfix`采用`opendkim`，设置`/etc/postfix/main.cf`
- 启动和重启对应的服务。

原理很简单，运行`opendkim`进程服务器，然后`postfix`把它当做一个过滤器来用，设置完成之后，对于所有的邮件，都会加上一个`DKIM-Signature`，一个具体的例子：

    DKIM-Signature: v=1; a=rsa-sha256; d=example.net; s=brisbane;
    c=relaxed/simple; q=dns/txt; l=1234; t=1117574938; x=1118006938;
    h=from:to:subject:date:keywords:keywords;
    bh=MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTI=;
    b=dzdVyOfAKCdLXdJOc9G2q8LoXSlEniSbav+yuU4zGeeruD00lszZVoG4ZHRNiYzR

一些参数的含义：

- `b`：具体的数字签名。
- `bh`：body hash。
- `d`：签名的域名。
- `s`：selector。一个域名可能有多个邮件发送服务器，需要用一个selector来区分。

然后接收方就会去检查`brisbane._domainkey.example.net`的DNS记录，你可以通过这种方式来查看是否它设置正确：

    dig txt brisbane._domainkey.example.net
    
内容格式是`k=rsa\; p=MIGfMA0GCSqGSIb3DQEBA...`。

### 检查是否设置成功

发送一封邮件到gmail里面，这样检查信息：

{% img /images/posts/gmail_sign.png %}

出现`mailed-by`表示你SPF设置正确了，出现`signed-by`表示你DKIM设置正确了。

## 让收件方认可发送者是可靠的

上面是一些技术上面的部分，同时还需要在内容上面以及行为上面让收件方认可你：

- 收件人需要认可邮件内容。你发送的东西对于用户是有信息含量的，如果用户看到你的邮件就标注spam，再多的设置也没有用。
- 邮件中带有退订链接。当用户不想收到你的邮件的时候，可以点击退订，防止用户直接把你spam掉。
- 控制发送频率。各个邮箱提供商会检查来自一个IP的邮件投递速率，如果你发送速度过于频繁，也容易进黑名单。

## 第三方的服务

设置了上面的这些东西，你的邮件还是有可能被spam，以及你也不清楚到底邮件的到达率有多少，我建议针对商业的网站，还是需要采用一些第三方的邮件发送服务。这里推荐几个：

- [mailgun](http://www.mailgun.com/)
- [postmark](postmarkapp.com)
- 搜狐的[sendcloud](http://sendcloud.sohu.com/)

采用了这些第三方服务之后，你需要对应地更新`SPF`和`DKIM`。
同时如果可能，尽量选择独立IP的服务，这样不会因为其他人发spam影响到你的邮件送达率。

mailgun和postmark都会[想办法保证你的邮件送达](http://www.quora.com/Why-are-Mailgun-and-Postmark-so-much-more-expensive-than-Sendgrid-and-AWS-SES)，
因此价格也比其他的邮件服务商要贵，但是还是物有所值的。

mailgun带有[campaign服务](http://documentation.mailgun.com/api-campaigns.html)，
你可以设置一个campaign，然后发送带有这个campaign ID的邮件，之后会统计出送达率，开启率，链接点击率等信息给你。

还有就是针对国内垃圾邮件乱飞的状况，很多国内的邮箱服务商会比较严格，造成国外的第三方邮件发送服务不好用的状况，比如：

- mailgun发到QQ邮箱，新浪邮箱里面会被spam掉。
- postmark和mailgun都发不了邮件到tom邮箱里面。

需要注意一下。

## 引用资料以及工具

- [PTR为什么重要](http://aplawrence.com/Blog/B961.html)
- [中文资料](https://idndx.com/2012/04/07/how-to-increase-your-email-delivery-rate/)
- [检查是否进黑名单](http://mxtoolbox.com/SuperTool.aspx?action=blacklist)
