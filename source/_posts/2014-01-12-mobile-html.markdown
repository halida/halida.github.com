---
layout: post
title: "针对手机端写网页的方法"
date: 2014-01-12 18:33:37 +0800
comments: true
categories: 
---

现在趋势是移动互联网，这方面的需求比较多，如何写一个适应手机的html页面？

首先要能够根据浏览器端的user-agent来判断设备是否是手机，有一个Gem [mobile-fu](https://github.com/brendanlim/mobile-fu)来做这个事情。

然后是写对应的页面模板，要让页面的宽度适应屏幕。在`header`里面加上设置：

    <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no,maximum-scale=1">
    
就是让页面宽度适应屏幕，同时锁定客户端不让屏幕缩放。

html里面的元素设置`width: 100%`，让它们自动撑大到整个屏幕范围。
同时最好设置一个`max-width`，这样万一电脑访问到这个页面，不至于显得太丑。

如果有一个标题图片，需要这样设置，保证根据屏幕大小自动等比例缩放：

    img
      width: 100%
      height: auto
      
如果你觉得不要放得太大，可以加上一个`max-width`。

chrome最新版本支持[手机模拟](https://developers.google.com/chrome-developer-tools/docs/mobile-emulation)，出来的结果就是这个样子：


{% img /images/posts/2014_01_12_demo.jpg %}


参考文档：

- [viewport](https://developer.mozilla.org/en-US/docs/Mozilla/Mobile/Viewport_meta_tag)
- [图片保持比例缩放](http://stackoverflow.com/questions/12991351/css-force-image-resize-and-keep-aspect-ratio)
