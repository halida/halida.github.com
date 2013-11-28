---
layout: post
title: "记一次调试ruby内存问题"
date: 2013-11-28 10:36
comments: true
categories: 
---

{% img /images/posts/2013_11_28_bug.jpg %}

最近我自己开发一个小项目[librr](https://github.com/halida/librr/)玩，是一个本地索引文件夹的工具，在这个项目里面我用到了[eventmachine](https://github.com/eventmachine/eventmachine)，用来同时跑一个http服务器，监控两个进程。

开发过程中遇到一个bug：很多时候会发生CPU冲高的现象，并且内存消耗会快速变大。
这个问题可以重现，所以是[好bug](http://ruby-china.org/topics/14898)，
但是没有找到办法绕过去，如果不解决，这个项目就废了。

这种没有数据提供的问题一般相对难解一些，
如果是报错，就可以定位到问题所在，
如果数据结果有问题，可以二分法定位出错位置。
为了能够调查原因，我研究了[如何在ruby下调试内存泄漏](http://blog.linjunhalida.com/blog/ruby-memory-leak-debug/)。
用这个方法，我发现在出现问题的进程里面，创建了无数的Proc对象：

```ruby
{
  Proc=>1233820,
  RubyVM::Env=>1277897,
  String=>23125,
  ...
}
```

采样几个Proc，用`proc.source_location`，定位到了是eventmachine里面`run_deferred_callbacks`中的[一个地方](https://github.com/eventmachine/eventmachine/blob/cfb1f71a35b1a10e5821bca9841fee3080ec1685/lib/eventmachine.rb#L975)，但是为什么会发生这种现象？我走到了死胡同里面。

`run_deferred_callbacks`是eventmachine的核心方法，用来处理回调方法，我于是修改了librr的代码，
一个个去掉回调，看看哪里有问题，结果发现，所有的回调都去掉了，还是有这样的问题发生，
那么应该是跑evenmachine的主线有问题了。
然后我用二分法隔离代码，终于发现问题的所在点，这是一个最小重现代码：

```ruby
require 'eventmachine'

def run
  EventMachine.run do
    EM.next_tick{ puts "12" }
  end
end

def main
  begin
    raise
  rescue Exception
    run
  end
end

main
```

在异常捕捉里面跑eventmachine，同时调用回调，就会出现问题。[修改之后](https://github.com/halida/librr/commit/48241915804eff62b724c58e576784fc0cd04b47)，问题不再发生。

如果有时间的话，我可能会研究一下eventmachine源码，定位到核心地点，这个bug才算真正解决掉。
但是现在我要先把librr做完，先提交了[一个bug](https://github.com/eventmachine/eventmachine/issues/482)，如果他们没有受理的话，我再继续寻找核心问题所在。

总结一下学到了什么：

- 二分法是定位bug的核心方法。
- 这个bug消耗了我半周的时间，占据了开发过程中很大一部分比例，bug是项目的时间黑洞。
- debug需要的是逻辑思考，数据越多，脑子越清醒，思路越开阔，bug解决就越快。
- 各种debug工具，比如gdb，perftools.rb，帮助了解状况，验证猜想，极大地提升效率。

