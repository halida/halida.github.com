---
layout: post
title: "调试rails autolink"
date: 2013-05-09 22:03
comments: true
categories: 
---

{% img /images/posts/debug-rails-autolink.jpg %}

今天遇到一个bug，在我们网站GuruDigger里面的留言或者私信中，会自动把网址转换成链接，比如：


    我今天发现一个好的网站，它是：www.dreamore.com


而对于下面这种状况，就错误地把后面的内容（就是那个句号）全部加到链接里面去了。

    我今天发现一个好的网站，它是：www.dreamore.com。


我首先判断一下这个问题是否是一个问题。在使用中，中文的逗号和句号都是参见的分割符，用户会很容易就使用这种方法。我觉得这个问题需要解决。

首先是界定问题。这个很明显是渲染链接出错。我采用的是`rails_autolink`gem，因为在rails3.2中，原先的`autolink`功能被移除了。

我下载了它的代码库，找到具体做这件事的文件：`lib/rails_autolink/helpers.rb`，和对应的位置：

```ruby
AUTO_LINK_RE = %r{
  (?: ((?:ed2k|ftp|http|https|irc|mailto|news|gopher|nntp|telnet|webcal|xmpp|callto|feed|svn|urn|aim|rsync|tag|ssh|sftp|rtsp|afs|file):)// | www\. )
  [^\s<]+
}x
```

它是利用正则来找到链接位置，然后替换的。在`[^\s<]+`里面，没有取消掉中文的分隔符，这样把后面的东西全部匹配掉了。

找到了问题，如何解决呢？我尝试去掉分隔符，把它替换成`[^\s<\p{P}]+`，但是发现`.`是应该被匹配到的，也被包含在了`\p{P}`里面，于是我要细分以下。
文档中有：

    /\p{Pc}/ - 'Punctuation: Connector'
    /\p{Pd}/ - 'Punctuation: Dash'
    /\p{Ps}/ - 'Punctuation: Open'
    /\p{Pe}/ - 'Punctuation: Close'
    /\p{Pi}/ - 'Punctuation: Initial Quote'
    /\p{Pf}/ - 'Punctuation: Final Quote'
    /\p{Po}/ - 'Punctuation: Other'
    
然后我完全不清楚每一个组里面有什么符号，google也找不到解释，这个时候我只能去挖ruby源码了。
我用`find | grep`来找`Punctuation`，被我找到具体的定义位置在：`enc/unicode/name2ctype.h`里面。英文的句号被分组在`Punctuation: Other`中。

这条路走不通，我又回头好好思考了一下，我觉得这个需求并不是全局的，只是针对采用中文的用户有效。我放弃做一个全局的方案，然后提交`Pull Request`，
改成自己客制化一个repo算了。于是我`fork`了这个项目，然后把`[^\s<]+`改成`[^\s<，。]+`，`push`上去，`Gemfile`里面换成`gem 'rails_autolink', github: "halida/rails_autolink"`，
发布到服务器上面去，问题解决了。

但是问题并没有完全结束，我必须在以后的版本里面注意到采用了一个客制化的gem，可能会有各种问题出现。未来的地雷需要小心不要踩到。
这是一个简单的bug处理，上面是我debug的整个过程，体力活，是以为记，大家对于这个过程有什么看法吗？