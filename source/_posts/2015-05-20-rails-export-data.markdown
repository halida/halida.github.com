---
layout: post
title: "rails导出数据经验整理"
date: 2015-05-20 08:42:25 +0800
comments: true
categories: rails
---

最近做了一些rails数据导出的工作，就是把一些特定的ActiveRecord数据挖出来，保存到表格里面。
需要注意几件事：执行速度，内存消耗，以及调试速度。

## 执行速度

导数据的程序基本上就是一个循环体，外部获取数据集，内部把一条数据转换成表格。
在内部，往往需要通过一条记录作为主体，通过数据库逻辑关系顺藤摸瓜挖出一批数据，
这样会形成一批短查询，因为是在循环体里面，会带来很大时间上的消耗，比如：

```ruby
out = []
Unit.where("active_at" < Time.now).each do |unit|
  out << [unit.company.name]
end
```

可以先把这些查询汇总起来，一次查询掉，然后在循环体内部筛选出对应的数据：

```
out = []
units = Unit.where("active_at" < Time.now)
company_names = Company.where(id: units.pluck(:company_id).uniq).pluck(:id, :name).to_h
units.each do |unit|
  out << [company_names[unit.company_id]]
end
```

## 内存消耗

查询大量数据的时候，可以首先查所有的ID，然后分批查询，这样防止序列化大量的数据库对象：

```ruby
unit_ids = Unit.where("active_at" < Time.now).pluck(:id)
group_size = 100
unit_ids.in_groups_of(group_size, false) do |ids|
  Unit.where(id: ids).each do |unit|
    ...
  end
end
```

数据全部缓存在一个array中的话，会占用大量内存，最好是通过数据流的方式一个个输出处理，用后即丢：

```ruby
def export
  Unit.where("active_at" < Time.now).each do |unit|
    yield([unit.name])
  end
end

CSV.open('out.csv', wb) do |csv|
  export { |row| csv << row }
end
```

在循环体内部，尽量用局部变量，不用的资源会更早释放。

跑数据导出的时候，最好同时注意一下服务器的剩余内存。不要把其它服务搞挂了。

## 调试速度

导数据最花费时间的往往还是调试过程。

调试的时候，可以只返回几条数据，检查完毕之后再全部跑。

```ruby
debug = true
index = 0
Unit.where("active_at" < Time.now).each do |unit|
  yield([unit.name])
  index += 1
  break if debug and index >= 10
end
```

需要考虑数据并不是很规整，做好预防性编程。

```ruby
Unit.where("active_at" < Time.now).each do |unit|
  yield([unit.company.try(:name)]) # 公司可能不存在
end
```

很多时候难免特定数据不符合预设状况，最好循环体内部记录log，出现问题可以跟踪。
比如下面的例子，unit没有oldest_driver的时候，会报错，记录了日志，就知道在哪条上面出现了问题。

```ruby
logs = []
Unit.where("active_at" < Time.now).each do |unit|
  logs << "unit: #{unit.id}"
  oldest_driver = unit.drivers.order('age desc').first
  # 
  yield([ordest_driver.name])
end
```

导出数据可以生成两个版本，一个给客户，另外一个加上一些debug数据方便自己分析。

```ruby
def export
  Unit.where("active_at" < Time.now).each do |unit|
    yield([unit.name, 'debug', unit.id])
  end
end

CSV.open('out.csv', wb) do |csv|
  CSV.open('out_debug.csv', wb) do |debug_csv|
    export { |row|
      debug_csv << row
      csv << row[1..1]
    }
  end
end
```

## 架构设计

代码架构上面最重要的是职责清晰。导出数据的逻辑比较简单，分离出导数据类，以及处理数据类就可以了：

```ruby
module Exporter
  def iterator_to_csv(filename, iterator)
    CSV.open(filename, wb) do |csv|
    iterator.call { |row| csv << row }
  end
end

class ExportActiveUnits
  attr_accessor :time
  def export
    Unit.where("active_at" < time).each do |unit|
      yield([unit.name])
    end
  end
end

eau = ExportActiveUnits.new
eau.time = Time.now
Exporter.iterator_to_csv "out.csv", eau.method(:export)
```
