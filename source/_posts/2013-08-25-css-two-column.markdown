---
layout: post
title: "css实现双栏同等高度"
date: 2013-08-25 08:05
comments: true
categories: frontend
---

# 问题

我们用css做双栏的方法，一般是通过边栏`float: right`，
或者`position: absolute; right: 0; top: 0`来实现的。

但是这样存在一个问题，如果左右栏的底色不一样以及他们高度不一致，
会显示出来底下区块的颜色。那么底下区块应该用左栏的背景色，还是用右栏的背景色就很难说了，
因为如果用左栏颜色，右栏高度不够的时候颜色不对；用右栏颜色，左栏高度不够的时候颜色不对。

如图所示：

<img src="https://docs.google.com/drawings/d/1JEqmNAwmnBN4ZxW6Mw_--qMD4F5yaNoUwBDYv0C0uRQ/pub?w=600&amp;h=720">

那么我们应该怎么解决这个问题呢？解法很巧妙，采用下面的布局：

<img src="https://docs.google.com/drawings/d/1TfJHqsQmOBuV9rDg9eF5A2VX9yjOO8tUYBQDm0mcB_Y/pub?w=600&amp;h=720">

继承关系：

```
.L1
  .L2
    .L3l
    .L3r
    .clearfix
```

这样，L2的高度是L3l和L3r中长的那个的高度，
L3都透明，左栏的底色设置在L2上面，右栏的底色设置在L1上面，
这样无论左右栏的高度如何变化，左右栏的颜色都是正确的。

示例代码如下：

<iframe width="100%" height="300" src="http://jsfiddle.net/linjunhalida/w4NgN/3/embedded/result,js,html,css/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>