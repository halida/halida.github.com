---
layout: post
title: "考虑买电脑"
date: 2016-12-03 11:17:36 +0800
comments: true
categories: 
---

我现在用的rmbp是2012年底买的，用起来越来越不舒服了。主要原因是当时为了省钱，没有买256G的版本，而是128G，
现在存储空间越来越不够，每个季度都要手动清除一遍内容。开始考虑替换笔记本。

[新的rmbp](http://www.apple.com/macbook-pro/)出来，但是我已经不再想用苹果的笔记本了。一方面是其它厂商（比如dell，hp，华硕，联想）的高端笔记本已经追赶上来，
另一方面是苹果的锁定策略把用户绑定在设备上面：新版的rmbp用了touch bar，也是一个通过体验来锁死用户的方法。
虽然苹果的体验是最好的，但是使用上并不想根据苹果的方式来，就会千难万难。所以我考虑下一个笔记本安装linux。
我一直是kde的粉丝，现在有了针对kde的ubuntu定制版[KDE neon](https://neon.kde.org/)，我会考虑使用它。

![image](http://images.apple.com/v/macbook-pro/l/images/specs/touchbar13_mbp_large_2x.jpg)

经过研究，现在主流笔记本对linux支持比较好的是联想和dell，原先我给爸爸买了海淘代购的联想thinkpad，但是感觉没有想象中的好。
只有考虑dell。dell的笔记本分民用商用XPS工作站，我考虑工作站precision系列以及高端机XPS。
发现现在主流笔记本一般15寸才会有4核CPU，缺点是体积大一些；不过[dell xps](http://www.dell.com/en-us/shop/productdetails/xps-15-9550-laptop)采用微边框，体积其实还好。

![image](http://i.dell.com/das/dih.ashx/527x340/sites/imagecontent/products/publishingimages/hero/22617-home-laptop-xps-15-9550-non-touch-504x350.png)

继续研究配置，发现笔记本都会有功耗和散热问题，性能会比台式机缩水一些：CPU要么是低压，要么虽然是标压但是散热不良会有限制。
比较起来台式机的价格和性能有优势，因此很多人用便携本+台式机工作。我每天在家，这种工作方式应该适合我。

我好久没有研究台式机了，发现现在的接口标准变化了很多，还有各种器件的型号和厂商要再再研究研究。
最后得出适合我的机器：

- CPU：i7-6700 编译不会慢，但是价格也不会太贵。我也没有超频的需求
- 内存：16G一张，以后可以最多拓展到64G，现在16G对于开虚拟机也够用了
- 显卡：主流稳定的显卡就可以，并不会追最新的游戏，而是等steam打折入

组装还是品牌机？组装机更便宜，但是要自己装，以及可能稳定性差一些。
品牌机的话有质保，厂商考虑应该比自己更专业，但是价格贵好多。
我考虑稳定和不折腾，还是看看品牌机。还是回到dell。为什么选择它呢？看官方网站上面的文档很细致，
以及公司背景（dell被创始人重新回购），比较起来联想偏商业，HP胡搅瞎搞，华硕台企，
感觉dell做事还是比较靠谱的，算是比较稳重的一个厂商。

台式机dell也有民用商用XPS工作站，民用商用普通电脑性能达不到我的要求，
工作站很多是图形方面或者高性能运算的，超出了我的需求（可以插1T内存的主板），
最后还是用[XPS台式机8910](http://china.dell.com/cn/business/p/xps-8910-desktop/pd?ref=PD_Family)。刚好双11打折，就买了（加了上门保修和无线鼠标键盘，7千出头）。
dell的模式是下单后生产，等了一个多星期才到货。

![image](http://i.dell.com/das/dih.ashx/527x340/sites/imagecontent/products/publishingimages/hero/desktop-xps-tower-8910-right-hero-504x350.png)

配置如下：

- 处理器	第六代智能英特尔® 酷睿™i7-6700 处理器 (8M 缓存, 最高至 4.0 GHz)
- 操作系统	Windows 10 家庭版 64位 简体中文
- Microsoft 软件	Microsoft Office 家庭与学生版
- 安全软件	McAfee Live Safe 12 个月 订阅
- 戴尔服务: 硬件保修服务	3年 Premium Support: 上门服务 (消费者客户)
- 光驱	托盘载入式 DVD光驱(读写 DVD/CD)
- 键盘	Dell KM636 无线键盘&鼠标 黑色, 英文
- FGA Module	VMAX1705_135_R/CN/HK/TW/BTO
- 基本系统	XPS 8910
- 硬盘	2TB 7200 rpm硬盘 + 32GB M.2 SSD 缓存
- 显卡	NVIDIA® GeForce® GTX750Ti 含 2GB GDDR5 显卡内存
- 无线	英特尔® 3165 1x1 802.11ac Wi-Fi 无线 LAN 和蓝牙
- 内存	16GB 单通道 DDR4 2133MHz (16GBx1)    
- 无线驱动程序	无线 3165 驱动器
- Bundle	XPS 8910-D18N8
- 芯片组 H170

官方网站上面有[完整拆装文档](http://content.etilize.com/User-Manual/1035806854.pdf)，看这个可以了解这个产品的结构。
里面通过电源横移来节省空间还是很有意思的。dell allenware台式机也用了这个设计。
内置无线网卡省得我拉线，多了一个用不到的光驱。

![image](http://i.dell.com/sites/imagecontent/products/PublishingImages/xps-8910-desktop/desktop-tower-xps-pdp-Module-02.jpg)

到货了之后检查状况良好之后使用。系统预装windows10，暂时我还是用这个系统，因为还有一些windows下的开发要做。
机器存储采用2T硬盘加32G SSD缓存，这种架构我是第一次见，采用了Intel的[RST快速存储技术](http://www.pcpop.com/doc/0/827/827899.shtml)，
把SSD当作硬盘的缓存，同时兼顾大空间和快速读取的优势。实际用起来还是不错的，不需要另外再买大空间SSD。
然后下载了几个steam的去年主流游戏（Bioshock Infinite），跑起来还不错。

以后开发就在台式机上面跑linux虚拟机，rmbp连过去操作和在浏览器里面看效果。
我重新买了一个rmbp的[256G的存储拓展卡](https://detail.tmall.com/item.htm?id=45379525357&sku_properties=5919063:6536025)解决空间问题，如果出门就拷贝虚拟机到笔记本里面临时用着。
等明年黑五rmbp差不多该退休的时候，再考虑换一台dell的15寸XPS。

现在还缺一个显示器没有买：我用惯了rmbp，最好还是要高清4K屏幕，等下次发现有打折再买吧。

