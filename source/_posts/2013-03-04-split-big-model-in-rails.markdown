---
layout: post
title: rails里面拆分大的model
date: 2013-03-04 22:07
comments: true
categories: rails
---

有的时候，rails里面一个model的工作太多，在一个文件里面都放不下了，于是我需要拆分出不同的模块。我的拆分方法是这样的：

user.rb里面：

```ruby
class User < ActiveRecord::Base

  def self.has_module name
    eval "
    define_method :#{name} do
      @#{name} ||= User#{name.to_s.camelize}.new(self)
    end
    "
  end

  has_module :account
  has_module :displayer
  has_module :privacy
  has_module :message

end
```

然后对应的职责模块：

```ruby
class UserDisplayer

  def initialize user
    @user = user
  end

  def address
    "#{@user.city}#{', ' unless @user.city.blank? or @user.country.blank?}#{@user.country}"
  end

end
```

然后调用的方式：

```ruby
user = User.find 5
user.displayer.address
```

当用到对应模块的时候，才会加载该模块。

原先我考虑过采用concerns，但是看起来只是把代码移动到另外的地方去，
当需要调试的时候很不方便，不知道代码放到哪里了。所以不觉得好用。

大家有什么看法？
