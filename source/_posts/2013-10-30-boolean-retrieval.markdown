---
layout: post
title: "最简单的搜索引擎"
date: 2013-10-30 23:52
comments: true
categories: 
---

{% img /images/posts/2013_07_27_iir.jpg %}

有一堆文本，我们需要能够根据一个或者好几个词语，搜索到含有这些词语的文本。
我们可以简单粗暴地用`find .|xargs grep word`的方式来这样做。
但是每次搜索都需要遍历全部文本，只是搜索一次可以承受，但是重复搜索的话就不能承受了。

处理这种任务，我们用到搜索引擎。可以大如google，也可以小到嵌入在浏览器里面的文本搜索功能。

## Boolean model

一个简单的模型，叫[Boolean model](http://en.wikipedia.org/wiki/Standard_Boolean_model)，
思路是这样的。

我们把要搜索的全体文本叫做corpus，一份文本叫做document，文本可以拆分成一个个的关键字，叫做terms。

为了能够搜索文本，我们需要对文本预处理，把document里面的字一个个拆出来，预处理一番，形成terms。

如果用布尔值来标示一个document是否存在一个terms，我们可以做出来一个矩阵：

```
            term1   term2   term3   ...
Document1     X       .       X
Document2     .       X       .
Document3     X       .       X
...
```

利用这个矩阵进行搜索，只要进行查表工作就可以了。

因为terms的数量远远大于Document数量和长度，这个矩阵是稀疏的。为了节省空间，矩阵可以采用list表示。
我们给document标示上ID：D1, D2, ...，
还有，我们也需要记录一下term出现在所有document里面的次数(document frequency)，列在term名字后面，
缓存用来进行后续的运算。

这样：

```
term1(2) -> D1, D3
term2(1) -> D2
term3(2) -> D1, D3
```

然后是具体的搜索工作。

搜索的语法我们可以支持AND和OR，比如term1 AND term2，
处理的方法就是获取上面term1和term2的document列表，然后求交集即可。
列表可以先排好序，这样交集操作消耗的时间，就和这两个列表元素的和相关。

搜索语句可以归并成`(term or term) and term and ...`这样的形式，
这样搜索语法的执行过程，就是每次取两个document列表，进行集合合并操作，一直到最后只剩下一个结果集合。

这个操作的性能，取决于所有操作中，每次集合操作中两个集合的大小，
而操作的顺序是可以变化的，
一种启发式算法优化就是按照集合大小升序来做交集操作，这样尽量让每次生成的新集合小一些。
这就是为什么要在前面记录document frequency。

总体的思路就是这样。实际实现的话，会有很多东西需要考虑的：

- 把document拆分成terms，需要处理英文文本里面时态变化，缩写，同义词合并，中文文本就要处理分词的问题。
- 要能够根据搜索结果进行排序，比如根据term在文本中出现的词频，term在文本中出现的顺序和区域等。
- 数据结构的保存方法，如何支持动态增加文本和更新文本。
- 搜索语法需要支持更多的语法，两个terms间距搜索，模糊查询。

更多关于这些问题的处理，还是去看教科书比较合适：
[Introduction to Information Retrieval](http://nlp.stanford.edu/IR-book/html/htmledition/boolean-retrieval-1.html)。