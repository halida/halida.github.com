---
layout: post
title: "nested set model介绍"
date: 2013-07-27 16:15
comments: true
categories: 
---

{% img /images/posts/2013_07_27_tree.jpg %}

## 问题

我们很多时候，需要在传统的关系型数据库中间实现树状结构，
比如说部门层级图，树状留言图等。

一般来说，针对树状结构的操作有：

- 访问一个节点
- 增加一个节点
- 删除一个节点及其子项
- 移动节点
- 遍历一个节点及其子项

我们可以常用简单的数据结构实现，记录一个项目的父节点就可以了，比如：

    Category: id integer, parent_id: integer, content: string
    
数据就是这样：

    ID  |  PARENT_ID | content
     0  |    null    |   ...  
     1  |      0     |   ...  
     2  |      1     |   ...  
     3  |    null    |   ...  
     4  |      2     |   ...  
     5  |      4     |   ...  

这样的数据结构下面，遍历节点及其子项的操作需要用到迭代，
在关系型数据库中，基本上有多少层的子项，就要多少SQL查询，
为了保证一致性，需要用存储过程来实现这样的遍历，
一个是麻烦另外一个是也会有性能问题。
那么有什么好的解决方案呢？

## Nested Set Model

我们可以换另外一种抽象方式来表示数据，
假设我们把树状图中的每个节点当做一个集合，父节点集合包含了所有的子节点集合，
那么我们可以把树转换成一个集合图：

{% img /images/posts/2013_07_27_set.jpg %}

然后，我们把所有的集合都当做一个数值的范围，父节点集合范围包含了所有子节点集合的范围，
那么集合图就会变成这样：

{% img /images/posts/2013_07_27_set_number.jpg %}

这样一个节点可以用范围的两个数值来表示，比如：

    ID  |  PARENT_ID |  lft  |  rgt  |  content
     0  |    null    |   1   |  10   |  ...  
     1  |      0     |   2   |   9   |  ...  
     2  |      1     |   3   |   8   |  ...  
     3  |    null    |  11   |  12   |  ...  
     4  |      2     |   4   |   7   |  ...  
     5  |      4     |   5   |   6   |  ...  
     
其中，lft和rgt分别代表范围的左边距和右边距。     

这样，我们可以通过这样的SQL来查询一个项目的所有子项：

```sql
    select child.* from
        categories as child, categories as parent
    where
        child.lft between parent.lft and parent.rft
        and parent.id = 1
```

一行SQL就可以解决问题，非常方便。不过带来的代价是添加和移动上面的复杂度。

## 具体实现

首先是如何初始化一棵树。做法很简单，
深度优先遍历这棵树，然后按顺序赋值，维护一个当前最大顺序即可。
ruby代码实现：

```ruby
def init_tree root_nodes
  count = 1

  def set_value node
    node.lft = count

    for child in node.children
      count += 1
      set_value(child)
    end

    count += 1
    node.rgt = count
    node.save
  end

  for root_node in root_nodes
    set_value(root_node)
  end
end
```

添加一个节点，把父节点尾部rgt，以及之后的所有位置统统移后2位即可，
用一行SQL就可以实现：

```sql
    update categories set
        rgt = rgt + 2,
        lft = lft + 2
    where
        lft > 3
```

移动一个节点比较复杂，因为要把范围内的子项也一起移动走。
操作基本上就是把节点范围内的所有项目（包括自己）移动到目标位置，
然后把目标位置和当前位置之间的所有项目也更新到应该对应的位置上面。
具体实现比较复杂，你可以去看[awesome_nested_set的具体实现](https://github.com/collectiveidea/awesome_nested_set/blob/master/lib/awesome_nested_set/move.rb)。

其他的操作非常简单就不给出示例了。

## 结论

采用nested set model可以很方便地实现树状结构，
具有很好的查询效率。不过在添加项目和移动项目上面有比较大的代价。
如果项目非常多，操作可能就不是很经济了。
我在想，应该有好的算法能够让每次更新的项目变得最少，
不知道大家是否知道有这样的算法？

## 使用到的工具和库

Rails下面有一个Gem叫[awesome_nested_set](https://github.com/collectiveidea/awesome_nested_set)来实现这种结构，
利用它来实现的一个树状评论Gem
[acts_as_commentable_with_threading](https://github.com/elight/acts_as_commentable_with_threading)
。如果你有兴趣，可以去看看具体的源码。

## 引用材料

- [wikipedia](http://en.wikipedia.org/wiki/Nested_set_model)
- [tutorial](http://threebit.net/tutorials/nestedset/tutorial1.html)