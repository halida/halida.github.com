---
layout: post
title: "更好的命令行"
date: 2015-05-23 08:56:28 +0800
comments: true
categories: 
---

命令行大家应该都熟悉了，但是命令行其实是很烂的，
输入和输出都采用字符串的方式，而不是一个规整的数据结构。
这样的后果是，每个程序都需要自己解析输入，以及提供一个特殊结构的输出，
很容易出现解析上面的问题。

从本质上面说，命令行就是一个函数执行的接口，终端就是一个状态机，
每一个命令就是一个函数。那么为什么不像通用的编程语言的函数一样来定义？

比如这样来写：

```ruby
# 普通操作
$> date
=> "Sat May 23 09:18:38 CST 2015"
$> rm('/fdas/fdas/fda', directory: true, force: true)
=> true

# 输出结构化
$> ls
=> [{mode: 'drwxr-xr-x', user: 'halida', group: 'halida', size: 123, name: 'Gemfile.lock'}]
$> ls(columns: [:name, :size])
=> {name: 'Gemfile.lock', size: 123}

# 管道
$> history >> select{|row| row[:cmd] =~ /mina/ }
=> [cmd: {'mina init'}, run_at: '2014-02-01 10:00:21']
$> ls >> filter(:name)
=> ['Gemfile.lock']

# 很多命令应该用面向对象的方式来执行，更容易理解
$> master = git-get-commit('master')
$> master.files.count
=>3
$> master.committer
{name: 'James', email: 'james@gmail.com'}

# 输出日志就算是以文字的方式体现，也最好结构化起来，方便解析
$> log = log("Process file (filename) finished, spend time (spendtime)", filename: "xxx.mov", spendtime: 220.seconds)
$> log.spendtime
=> 220.seconds
```

网上搜索了一下，看起来没有什么好的解决方案，有时间我可以开发一个看看。
