---
layout: post
title: "一种简单的前端框架写法"
date: 2013-08-18 00:04
comments: true
categories: 
---

{% img /images/posts/mvc.png %}

现在网站基本上js漫天飞，一不小心就写得乱七八糟，得需要好好整理才行。
这里分享一个简易整理法，不需要很复杂就可以把js弄得非常清爽。

我们大多数的js操作，都是针对用户事件，做一个具体的反应，
比如说点击一个按钮弹出一个对话框，当用户提交表单的时候做一些验证之类。
这种用户操作模型已经被研究很多了，通用的抽象方式就是著名的[MVC模型](http://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller)。
我们写js也可以这样抽象隔离，不过一般并不需要抽象出MVC里面的Model。
View就是html的页面，Controller就是针对事件做出的反应。

我们可以把一个逻辑相关的功能划分成一个Controller类，类里面记录相对应的一个页面区块，
列出需要监听的事件，把事件绑定到类方法上面，方法里面修改和更新区块中特定的元素。
一个轻量的前端框架[Spine](http://spinejs.com/)，提供了这样的一个Controller类来满足我们的需求。

## 例子

假设我们需要做一个简单的功能，页面上面一个按钮，点击一次按钮，页面上面显示的数量就加一。

页面部分包含了我们需要展示的东西：

```html
<div class="counter">
  <a class="click">Click Me</a>
  <div class="result">0</div>
</div>
```

对应的javascript（用[coffeescript](http://coffeescript.org/)写）：

```coffeescript
class CounterController extends Spine.Controller
    # 列出我们需要交互的页面元素
    elements:
        ".result": "result"
    # 绑定我们关心的事件到on_click
    events:
        "click a.click": "on_click"

    constructor: ->
        # 在Controller初始化的时候，会帮你做好上面的事件和元素绑定
        super
        # 初始化变量
        @count = 0

    # 处理事件
    on_click: ->
        @count += 1
        @update()

    # 更新页面
    update: ->
        @result.val(@count)

# 初始化
new CounterController(el: '.counter')
```

我一般会再做一个启动器，这样可以自动挂载，以及限定好作用域不超出对应的区块：

页面修改成：

```html
<div data-controller="Counter">
  ...
</div>
```

增加代码：

```coffeescript
init_controllers = ->
    $('[data-controller]').each ->
        init_controller($(this))
        
init_controller = (obj)->        
    controller = obj.data('controller') + "Controller"
    data = obj.data()
    data.el = obj
    new window[controller](data)
    
$(init_controllers)
```

所有常规的js页面操作都可以抽象成一个Controller类，
按照这样的方法来组织js代码，复杂的js就能管理得井井有条，
并且只需要引入Spine(几十K左右)，不需要复杂的框架代码和理解。
当然我们还可以进一步，自动绑定页面元素和数据，比如[Angularjs](http://angularjs.org/)。
不过我个人觉得，普通功能不需要做得那么复杂，用我上面的方法组织就已经OK了。
