---
layout: post
title: "ruby内存泄漏调试方法"
date: 2013-11-27 20:44
comments: true
categories: ruby
---

{% img /images/posts/2013_11_27_leak.jpg %}

只要是跑起来的服务器程序，都有可能遇到内存泄露问题，或大或小。
可以用简单的看门狗方法，内存增加到一定程度就重启；
但是重启只是隐藏问题，遇到严重的内存泄露，只能正视问题，想办法找到内存泄露的源点。
这里我整理了一下ruby语言的内存泄露查找方法，欢迎反馈。

基本思路是这样：等待内存泄露到一定程度，进程的内存里面会大量充斥着没有被释放的对象，
随机获取内存中的数据，就可以知道是什么对象泄露了，从而定位问题。

我们先开始一个实验。创建文件leak.rb：

```ruby
s = []
1000000.times { s << "hello" }
while true
  sleep(1)
end
```

这个文件生成了太多没有释放的字符串，并且一直处于循环等待状态。

实际的应用程序代码比较多，不是那么明显就能发现内存泄露的代码，需要通过调试寻找线索。

首先我们要编译一个带有debug信息的ruby版本。参数加上`-O0 -g`，`O0`是为了防止优化掉一些调试的符号表信息。
如果你用的是rvm，可以采用下面的脚本：

```sh
# 清空rvm编译环境参数
unset rvm_configure_env

# 编译一个单独的ruby版本，需要花费一定时间
rvm install 2.0.0-debug --debug -j 3 -- --enable-shared optflags="-O0 -ggdb" debugflags="-ggdb3"

# 采用并且检查设置
rvm use 2.0.0-debug
ruby -rrbconfig -e 'puts RbConfig::CONFIG["optflags"]'
# 结果应该带有：-O0 -ggdb
```

然后我们在这个环境中执行程序，实际程序不要忘记安装支持的gem：

```
ruby leak.rb
```

之后，我们需要调试这个程序。如果你在linux下面，请使用`gdb`，
如果在OSX下面，请使用编译ruby工具链中的debug工具，
在我的机器OSX上面是用clang来编译的，所以我采用的是`lldb`，
下面的例子以我的机器为准，gdb的命令其实也是一样的。

另外开一个终端，启动`lldb`，然后连接上跑起来的进程：

```
(lldb) attach 77226
```

上面改成你用`ps aux|grep ruby`找到的进程号。

attach做的事情就是在你调试进程里面开一个线程，这样就能够获得所有的内存信息，
同时也不影响程序正常运行（只要你保证线程安全）。

然后我们要知道进程内存消耗状况。在调试环境里面，我们可以执行C语言的函数，
其中`rb_eval_string`可以用来直接执行ruby代码。
我们首先需要做的是用`ObjectSpace`来遍历和列出所有ruby对象：

```ruby
p rb_eval_string("GC.start")
p rb_eval_string("$db_objs = Hash.new 0")
p rb_eval_string("ObjectSpace.each_object {|o| $db_objs[o.class] += 1}")
p rb_eval_string("puts $db_objs.to_s")
```

列出来之前先要垃圾处理一下。因为ruby有解释器全局锁，执行上面的代码应该不会造成线程安全问题。
回到执行`ruby leak.rb`的终端，可以看到打印出来的结果。
如果是实际运行的程序，你可能需要开启一个文件，把结果打印进去，而不是打印到标准输出里面：

```ruby
p rb_eval_string("File.write('sys.log', $db_objs.to_s)")
```

结果如下：

```ruby
{
  String=>1005019,
  RubyVM::InstructionSequence=>577,
  Hash=>28,
  ...
}
```

发现String对象出奇地多，应该是内存泄露的主要组成部分。我们采样一下数据，看看是什么样的字符串：

```ruby
p rb_eval_string("$db_strs = []")
p rb_eval_string("ObjectSpace.each_object.each_with_index {|o, i| $db_strs << o if o.class == String and i%1000==0}")
p rb_eval_string("puts $db_strs.sample(10).to_s")
```

结果：

```
["hello", "hello", "hello", "hello", "hello", "hello", "hello", "hello", "hello", "hello"]
```

根据这个信息，我们回到源代码里面，找到对应的部分，思考为什么没有释放这个字符串，从而解决内存泄露的问题。

我们甚至可以利用`rb_eval_string`来动态修改代码和解决bug，不过在这个例子里面没有办法删除掉造成内存泄露的`s`对象。如果你发现有方法，还请告诉我。

但是如果内存泄露发生在C语言部分，应该如何发现？这个留到下次再介绍。
还有就是如何调试生产环境的进程，这个也请等我研究清楚之后再分享给大家。

引用资料：

- [http://blog.nelhage.com/2013/03/tracking-an-eventmachine-leak/](http://blog.nelhage.com/2013/03/tracking-an-eventmachine-leak/)
- [http://tech.3scale.net/2013/04/09/using-gdb-to-inspect-ruby-processes-on-os-x/](http://tech.3scale.net/2013/04/09/using-gdb-to-inspect-ruby-processes-on-os-x/)