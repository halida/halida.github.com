---
layout: post
title: "如何支持视网膜屏幕"
date: 2013-07-18 15:42
comments: true
categories: frontend
---

最近网站版本更新，过程中发现有需要针对视网膜屏幕做优化，
不然普通的图片在rmbp或者new iPad上面看起来一片模糊，体验很不好。
调研了一下，发现有无数种方法，这里整理一下，欢迎大家拍砖。

## css background解法

根据[这里的方法](http://cocoathings.blogspot.com/2013/02/safari-and-retina-images.html)，在CSS里面写：

```css
.aClass {
    background: url(image.png);
    background: -webkit-image-set(url(image.png) 1x, url(image_2x.png) 2x);
}
```

这样需要把所有图片都放到css里面，比较复杂，需要设计一个预编译流程。

## gem js解法

如果你用rails，这里有一个针对的gem可以用：[retina_rails](https://github.com/jhnvz/retina_rails)。

它的方法是跑一个[js脚本](https://github.com/imulus/retinajs)，检查是否是retina设备，
如果是的话，搜索所有页面上的img，然后替换成2倍分辨率的图片文件（在原先图片文件名后面加上@2x，当然也有办法自己设置）。

它首先需要页面加载好低分辨率的图片，然后计算大小并且限定，然后替换成高分辨率的图片。
页面的图片会首先模糊，然后变成清晰的，并且它依赖到了js，在js加载之后才会工作，不能直接展示好一个完美的页面。
    
# rewrite解法

在[stackoverflow上面](http://stackoverflow.com/a/16848459/73048)看到的一个有趣的解法，
用js判断是否是retina设备，然后在cookie里面加上是否是retina的标示，服务器端发现如果有这个参数的话，返回对应大小的图片。

这种解法很巧妙，不过需要服务器端支持，并且文件规则要统一，对于rails这种文件名带有tag的部署方式就不太好支持。
    
## svg图片解法

图片全部都用svg，然后就没有模糊的问题了。不过有些浏览器不支持svg，以及不是所有图片都可以做成svg的。

## 缩小大图片解法

直接用一个2倍长宽的大图片，然后设置好大小成小尺寸。实现起来最简单，
但是问题是比较消耗带宽，以及大图片缩小的方式是浏览器的缩放算法，并不是点阵完美的。
    
## 其他网站用到的方法

上面是我看到的一些解决方法，然后我也去看了一下一些著名网站是如何解决这个问题的：

- [apple](http://apple.com/) 图片地址用js获得然后显示，然后一部分图片没有针对retina优化。
- [v2ex](http://v2ex.com/) 直接用2倍图片。
- [ruby-china](http://ruby-china.org/) 也直接用2倍图片。
- [github](https://github.com/) 图片全部放在css里面，好狠！
- [twitter](http://twitter.com/) 没有针对retina优化，图片是模糊的。
- [dribbble](http://dribbble.com/) 也是用大图。
- [google](http://google.com/) 也是放在css里面。

## 我的解决方案

考虑到实现方式，带宽消耗等问题，我首先采用gem的方法，同时做出来了一些简单的修改。
img加上data-at2x，里面放置了retina图片的地址，然后js只针对所有设置这个属性的图片进行修改。

针对会造成图片模糊然后变清晰的状况，我考虑直接返回image是retina的版本。
第一次可以用这个js插件，然后设置cookie，然后服务器返回retina图片的版本。

考虑了上面这个复杂的解决方案，我还是放弃了，还是直接用2x图片吧，最简单。其实图片也不会大多少，
因为大多数图片还是区块比较多的，压缩算法已经很好地处理了这种状况了。