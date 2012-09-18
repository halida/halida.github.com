---
layout: post
title: "coffeescript里面的类机制"
date: 2012-09-18 09:40
comments: true
categories: 
---

这里假设你知道什么是[coffeescript](http://coffeescript.org/)， 也知道coffeescript里面的类和类继承是怎么使用的。
这里面主要是分析一下coffeescript是如何实现类机制的。

代码
------------------------------------------

首先看代码。 下面是全部的代码， 后面会介绍里面发生了什么。

```ruby
class People
    constructor: (@name)->
    hello: -> "hello, I'm #{@name}."
    
class Programmer extends People
    constructor: -> super
    hello: -> 
        result = super()
        result += " I like programming."
        
p = new Programmer('halida')
console.log p.hello()
```

很简单的一个继承。

这里是生成的代码：

```javascript
var People, Programmer, p,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

People = (function() {

  function People(name) {
    this.name = name;
  }

  People.prototype.hello = function() {
    return "hello, I'm " + this.name + ".";
  };

  return People;

})();

Programmer = (function(_super) {

  __extends(Programmer, _super);

  function Programmer() {
    Programmer.__super__.constructor.apply(this, arguments);
  }

  Programmer.prototype.hello = function() {
    var result;
    result = Programmer.__super__.hello.call(this);
    return result += " I like programming.";
  };

  return Programmer;

})(People);

p = new Programmer('halida');

console.log(p.hello());
```

类定义
---------------------

前面的先不看， 先看后面的部分。 弄清楚coffeescript的接口， 以及实现。

```javascript
Programmer = (function(_super) {

  __extends(Programmer, _super);

  function Programmer() {
    Programmer.__super__.constructor.apply(this, arguments);
  }
  
  Programmer.prototype.hello = function() {
    var result;
    result = Programmer.__super__.hello.call(this);
    return result += " I like programming.";
  };

  return Programmer;
})(People);
```

Programmer类， 做的事情就是创建了一个闭包， 在闭包里面生成了一个Programmer构造函数， 并且返回，
这样就可以通过`p = new Programmer('halida');`来创建一个对象。

对于对象方法的创建， 是在闭包里面给prototype赋值新函数来实现， coffeescript里面可以用`super`这个关键词来继承父类里面同样名称的方法。

```javascript
Programmer.prototype.hello = function() {
  var result;
  result = Programmer.__super__.hello.call(this);
  return result += " I like programming.";
};
```

然后是继承， 首先是Programmer的构造函数：
```javascript
function Programmer() {
  Programmer.__super__.constructor.apply(this, arguments);
}
```

`Programmer.__super__`是父类的构造函数（后面在讲__extends会提到是如何生成它的）， 
直接获取父类的构造函数constructor（这个是coffeescript缓存的， 下面会讲）， 
传给它本函数的参数`arguments`， 然后在`this`这个环境里面执行它。

`Programmer.hello`里面， 也采用了同样的方式来继承父类的方法：

```javascript
result = Programmer.__super__.hello.call(this);
```

里面`call(this)`是为了把当前环境切换到当前对象中去。

这样我们大致知道了类部分的代码到底发生了什么， 但是， `__extends`里面才是实现类继承功能的核心代码。

__extends
--------------------------------------
首先整理一下代码：

```javascript
__hasProp = {}.hasOwnProperty,
__extends = function(child, parent) {
    for (var key in parent) { 
        if (__hasProp.call(parent, key)) 
            child[key] = parent[key]; 
    } 
    function ctor() { 
        this.constructor = child; 
    }
    ctor.prototype = parent.prototype; 
    child.prototype = new ctor(); 
    child.__super__ = parent.prototype; return child; 
};
```
我们来实际看一下执行 `__extends(Programmer, People);`发生了什么：

首先是第一个循环：

```javascript
for (var key in parent) { 
    if (__hasProp.call(parent, key)) 
        child[key] = parent[key]; 
} 
```

`__hasProp.call(parent, key)`是用来判断key是否是parent本身定义的属性。
这段代码是循环People里面所有的属性， 如果是People本身定义的， 就赋值到child里面去，

它的目的是继承父类的类方法和属性。 如果`People.CLASS_NAME = "People";`， 那么结果就是`Programmer.CLASS_NAME = People";`，
通过拷贝的方式来继承父类的类方法。

然后是难懂的部分了， 如何继承父类的对象方法呢？

首先给child生成一个prototype对象构造函数， 在里面还会缓存child的构造函数constructor， 
这样child的child就可以通过调用它来执行父类的方法（实现了上面类定义部分的调用父类对象方法）。

```javascript
function ctor() { 
    this.constructor = child; 
}
```

最顶层的父类People里面没有定义constructor， 
是因为js里面返回函数的对象构造函数， 它本身的prototype里面就有constructor， 
console里面执行：`People.prototype.constructor`， 返回的是：

```javascript
function People(name) {
    this.name = name;
}
```

然后， child的prototype对象的prototype就是父类的prototype， 
这样， 子类对象找一个方法的时候， 如果在prototype， 也就是ctor里面找不到对应的方法， 
就会找ctor的prototype里面是不是有这样的方法，然后就可以从父类里面找到对应的方法了。
这就是为什么要用`new ctor()`来创建一个prototype对象， 这样才能形成一个prototype链。

```javascript
ctor.prototype = parent.prototype; 
child.prototype = new ctor();
```

以及上面提到的， `__super__`缓存了父类的prototype。

```javascript
child.__super__ = parent.prototype;
```

走一遍
-----------------------------------
上面是对代码本身的分析， 要弄懂， 我们还需要根据实际的状况， 模拟执行一下。

比如一个创建一个对象： `p = new Programmer('halida');`

如果需要找Programmer里面定义的函数， 我们假设是`coding`吧， 那么过程是：

- 执行`p.coding()`
- 在p对象里面找是否有coding。
- 在p的prototype`new ctor();`里面找是否有coding。定义类里面， 添加的方法都是塞到它里面去的。
- 在prototype的prototype： Programmer的prototype里面找是否有coding。

这个是对象方法的执行， 还有类方法的执行。 比如`Programmer.CLASS_NAME`， 那么过程是：

- 执行`Programmer.CLASS_NAME`
- 在Programmer里面找是否有CLASS_NAME

继承父类的时候， 会拷贝出所有的父类方法， 在子类定义的时候， 如果定义了类方法， 就会覆盖父类的类方法。
