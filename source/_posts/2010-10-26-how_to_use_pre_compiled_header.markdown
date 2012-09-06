
---
layout: post
title: 如何使用预编译头以及预编译头的原理
date: 2010-10-26 14:53:37 +0800

comments: true
categories: 
---

问题
====

在c/c++里面,如果一个xxx.c要暴露出接口给其他文件的话,一般是提供一个xxx.h的文件作为接口,然后其他文件会把xxx.h文件包含进自己里面去,这样就可以知道xxx.c提供了什么.

但是会出现这样的问题,如果一个xxx.h文件被包含了N次,那么项目在编译的时候,会把这部分的代码重复编译N次,当这个xxx.h文件非常大的时候,编译速度就很慢了.比如xxx.h代表了一个库.(Qt,
windows等)

解法
====

为了解决这个问题,我们可以先把头文件编译好,然后再包含到其他文件里面去.这样,每个引用了该头文件的源文件就不需要再次编译这部分了.

示例
====

来自:
[http://stackoverflow.com/questions/58841/precompiled-headers-with-gcc](http://stackoverflow.com/questions/58841/precompiled-headers-with-gcc)

建立以下文件:

stdafx.h:

    #include <string>
    #include <stdio.h>

a.cpp:

    #include "stdafx.h"
    int main(int argc, char**argv)
    {
      std::string s = "Hi";
      return 0;
    }

编译和执行命令:

    g++ -c stdafx.h -o stdafx.h.gch
    g++ a.cpp
    ./a.out

删除了stdafx.h文件之后,执行g++ a.cpp照样编译成功.

实现的原理很简单:

> -   首先把一个stdafx.h头文件,编译成stdafx.h.gch.
> -   当执行g++
>     a.cpp的时候,g++编译器会先去找stdafx.h.gch,把它包含进来.这样就节省了编译时间.

如果stdafx.h被很多源文件引用,节省的编译时间是很可观的.

结论
====

利用预编译头文件,可以很明显地感觉到编译速度的提升.建议大家尝试一下.

还有一个有点相关的问题,如果修改了一个用到很多的头文件,就需要把所有用到这个头文件的源文件编译一遍,基本上等于重新编译了.所以,尽量少修改这种头文件.