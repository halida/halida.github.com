---
layout: post
title: "coffeescript"
date: 2012-09-24 11:01
comments: true
categories: 
---

![image](http://coffeescript.org/documentation/images/logo.png)

什么是coffeescript?
----------------------------------------
我们知道javascript是一门有历史的语言， 在被创造出来的时候， 它只是浏览器的一个附属物， 没有预期能够那么流行， 
拥有一些的设计缺陷， 缺少很多现代语言必须的特性。 为了弥补这些的缺陷， 我们有jQuery， 各种js的库， 
javascript语言本身也非常灵活， 开发者可以做很多扩展。 

但是库的方式并不能解决所有的问题， 我们还需要更重的解决方案。 
coffeescript是能够编译成javascript的一门小的语言， 它的目的是为了能够让大家以更好的方式来写javascript。

简单的说， 就是你采用coffeescript的写法：
```ruby
# Assignment:
number   = 42
opposite = true

# Conditions:
number = -42 if opposite

# Functions:
square = (x) -> x * x
```

coffeescript的工具帮助把上面的代码编译成js：

```javascript
var number, opposite, square;

number = 42;

opposite = true;

if (opposite) {
  number = -42;
}

square = function(x) {
  return x * x;
};
```

具体的语法还是去看[官方网站](http://coffeescript.org/)， 这里我就不多说了。

优点和缺点
----------------------------------------

它解决的问题主要是：
- javascript语言本身是模仿java的语法， 带有很多冗余， coffeescript借鉴了其他一些现代语言的语法， 让代码变得更简洁清晰。
- javascript本身有设计缺陷， 比如全局变量的问题， coffeescript自动把变量变成局部， 减少开发错误。
- javascript本身缺少一些重要的特性， 比如类机制， cofeescript提供这样的机制。

写完coffeescript， 可以通过它提供的一个工具， 转换成javascript， 而转换出来的javascript和coffeescript基本上是一一对应的，
语法也很简单， 会javascript的人看懂不难。

总体上面来说， 使用coffeescript带来的好处是： 增加生产力， 减少代码缺陷， 增加代码的可读性， 
付出的代价是需要建立一整套的编译机制， 以及开发者需要熟悉coffeescript这门语言， 以及项目必须依赖coffeescript。

结论
----------------------------------------

针对coffeescript的使用， 赞同和反对者都有， 具体的意见：

赞同者的意见比较好理解。 因为coffeescript带来的好处很多（上面列出来的）， 付出的代价也没有多少。 
甚至哪天你不想用了， 也可以直接把它丢掉， 编译出来的javascript也是可以继续维护的。

反对者的意见基本上是从项目的角度来考虑， 
一个是写javascript不只是程序员， 可能是设计师， 需要让所有人都学会coffeescript， 而这个是有成本的。
还有就是项目代码一致性， 原先javascript的项目， 如果加上了coffeescript的代码， 就会比较混乱。
以及有人并不喜欢coffeescript里面的一些实现， 比如类机制。

我个人倾向使用cofeescript， 现在我基本不直接写javascript了。
反对的意见我觉得对于普通的开发者来说不重要， 
而它的优点是如此地显著， 以至于我会推荐所有的javascript开发者去使用它。