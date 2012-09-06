
---
layout: post
title: 为什么要用纯文本
date: 2010-12-21 21:25:52 +0800

comments: true
categories: 
---

什么是纯文本
============

![image](http://anthrologico.com/wp-content/uploads/2010/11/plaintext.png)
我们所说的纯文本, 有几层含义:

任何信息, 都采用文本的方式来展示
--------------------------------

我们拒绝任何形式的二进制格式, 拒绝任何形式的私有格式, 我们只支持纯文本.

比如: Word, PPT, Excel, 他们都是只能用微软的工具打开的,
并且都是二进制的, 不能被文本编辑工具修改.

文本的编码必须是统一的标准编码
------------------------------

要么ASCII, 要么UTF-8, 拒绝任何其他的编码格式. 比如gbk等.

文本本身的数据, 反映出文本需要展示的信息量
------------------------------------------

比如:

    <elementType id="Book" name="pyqt book">
        <elementType id="chapter" title="python introduce"> 
        </elementType>
        <elementType id="chapter" title="qt introduce"> 
        </elementType>
    </elementType>

虽然格式是纯文本的(xml), 但是不能很好地被人理解, 所以我们认为是坏的,
不符合纯文本的要义.

我们应该这样:

    Book:
        name: pyqt book
    chapter:
        - python introduce
        - qt introduce

一个示例
========

本文就是采用纯文本方式编辑的, 原始文件可以在
[这里](https://bitbucket.org/linjunhalida/blog/src/tip/为什么要用纯文本.rst)
看到.

为什么要用纯文本
================

我们为什么要使用纯文本?

-   纯文本是方便人阅读和修改的 纯文本反映了本文所承载的信息,
    我们阅读和修改都能够针对具体的信息, 而不像某些专有软件,
    需要熟悉软件的特殊功能, 才能获取我们想要的信息.

-   纯文本是自由的, 不依赖任何第三方工具 如果你把纯文本发给其他人,
    其他人可以直接获取到纯文本中的信息, 而不像二进制的文件,
    必须要安装指定的软件. 如果该软件无法获取,
    专有格式文件中的信息就遗失了.

注意点
======

-   我们不反对程序自动生成的文件(不需要人阅读的部分)是其他格式的.
    我们只关心人有可能看的部分.
    如果你用纯文本生成pdf等格式展示给其他人看,
    我们不要求pdf本身是纯文本的.. 因为这只是个中间产物, 如果有需要,
    我们直接去看源码, 而源码 **必须** 是纯文本的.

纯文本工具链
============

为了能够实践我们纯文本主义, 我们需要有强大的工具作为支持:

[reStructuredText](http://docutils.sourceforge.net/rst.html)

> 这是我们的主要文档编写工具. 适合人编写和阅读,
> 也可以很容易地转变为其他需要的格式.

[S5](http://s5project.org/)

> 文本方式写幻灯片. S5本身是html的, 为了能够深刻实践纯文本主义,
> 我们建议你采用
> [rst2s5](http://docutils.sourceforge.net/docs/user/slide-shows.html).

[graphviz](http://www.graphviz.org/)

> 文本方式画图. 文本方式编写图的结构和显示, 没有再适合的了.

[csv](http://en.wikipedia.org/wiki/Comma-separated_values)

> 表格. 单一的符号以及回车符分割开具体的数据, csv非常适合阅读和修改.