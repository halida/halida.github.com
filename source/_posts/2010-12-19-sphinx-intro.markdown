---
layout: post
title: sphinx介绍
date: 2010-12-19 19:17:22 +0800

comments: true
categories: 
---
什么是sphinx?
-------------

![image](http://www.crystalinks.com/sphinx.jpg)

它有什么特性?
-------------

-   python文档所使用的系统
-   输出HTML, LaTeX, manual pages, 纯文本..
-   层级结构, 内链
-   自动索引
-   语法高亮
-   扩展: graphivz, docstrings, 等等..

让我们开始尝试一下
------------------

安装
  ~ easy\_install -U Sphinx

教程
  ~ [http://sphinx.pocoo.org/tutorial.html](http://sphinx.pocoo.org/tutorial.html)

创建一个项目
------------

    sphinx-quickstart

目录
----

    $ find
    .
    ./Makefile               # 工具帮我们生成的makefile
    ./build                  # 生成文档后放置的目录
    ./source                 # 文档源码的位置
    ./source/index.rst       # 文档的入口
    ./source/conf.py         # 项目的一些设置, 上面quickstart设置的部分内容可以在里面修改
    ./source/_static         # 静态文档存放目录
    ./source/_templates      # 模板存放目录

开写哈
------

    Contents:

    .. toctree::
       :maxdepth: 2

    # 我们在这里加内容
    intro
    tutorial

文档对象
--------

    .. py:function:: enumerate(sequence[, start=0])

    Return an iterator that yields tuples of an index and an item of the
    *sequence*. (And so on.)

    这里是连接 :py:func:`enumerate`

自动导入代码中的文档
--------------------

    .. autofunction:: io.open

    .. automodule:: io
       :members:

生成我们需要的格式
------------------

sphinx-build

    $ sphinx-build -b html sourcedir builddir

make

    $ make html

资源
----

官方文档 [http://sphinx.pocoo.org](http://sphinx.pocoo.org)


