---
layout: post
title: reStructuredText介绍
date: 2010-11-10 15:39:39 +0800

comments: true
categories: 
---

什么是reStructuredText?
-----------------------

一种写文档的方式. 简称:
[ReST](http://docutils.sourceforge.net/rst.html#try-it-online)

-   简单, 现场学,现场会
-   易读
-   方便生成html/pdf等其他格式

怎么玩?
-------

不多说, 直接用: [http://goo.gl/1jNF4](http://goo.gl/1jNF4)

语法
----

There should be one-- and preferably only one --obvious way to do it.

google: rest

[http://docutils.sourceforge.net/docs/user/rst/quickstart.html](http://docutils.sourceforge.net/docs/user/rst/quickstart.html)
[http://docutils.sourceforge.net/docs/user/rst/quickref.html](http://docutils.sourceforge.net/docs/user/rst/quickref.html)

如何生成其他格式
----------------

需要安装docutils

-   html: 有个东西叫rst2html:

        rst2html xxx.rst xxx.html

-   pdf: 有个东西叫rst2pdf:

        rst2pdf xxx.rst

-   latex: 有个东西叫rst2latex:

        rst2latex --input-encoding=utf-8 --output-encoding=utf-8 xxx.rst >> s.tex

python code
-----------

```python
from docutils.core import publish_string
content = publish_string(
    source="doc here"
    writer_name='html'
    )
```

我用它来干什么?
---------------

-   写博客
-   写文档
-   问题: 好像没有支持ReST的网站..

连接
----

-   官方网站:
    [ReST](http://docutils.sourceforge.net/rst.html#try-it-online)