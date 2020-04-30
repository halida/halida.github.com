---
layout: post
title: 回的四种写法
date: 2010-10-29 20:42:05 +0800

comments: true
categories: 
---

2010/5/30聚会，沈大侠分享了一下python dict get的四种方法:

```python
# method 1
# 采用异常捕捉来处理KeyError
# 查询1次
try:
    v = data[k]
except KeyError:
    v = 12

# method 2
# 取值前先进行条件判断
# 查询2次
if data.has_key(k):
    v = data[k]
else:
    v = 12

# method 3
# 和method2类似，只是利用in取代函数调用
# 查询2次
if k in data:
    v = data[k]
else:
    v = 12

# method 4
# 函数调用
# 查询1次
v = data.get(k)
if v == None:
    v = 12
```

提到几点： 函数调用是比较慢的，不如data[key]和key in data快。
所以method2完全可以被method3替代。 method4在多数情况下也没有method2好。

异常处理因为需要建立Error的对象，是最慢的。
所以method1不很适用命中率低的状况。

method1和method4都只查询一次， method2和method3都要查询两次，
在某些查询是性能瓶颈的时候，不如method1和2快。

为了对上面的估计作实际验证，我写了测试程序，如下:

```python
#!/usr/bin/env python
#-*- coding:utf-8 -*-
import time, json

def test(data, k, count):
    times = []

    start = time.time()
    for i in range(count):
        #method 1
        try:
            v = data[k]
        except KeyError:
            v = 12
    end = time.time()
    print "method 1 spend time: %f s." % (end - start)
    times.append(end - start)

    start = time.time()
    for i in range(count):
        #method 2
        if data.has_key(k):
            v = data[k]
        else:
            v = 12
    end = time.time()
    print "method 2 spend time: %f s." % (end - start)
    times.append(end - start)

    start = time.time()
    for i in range(count):
        #method 3
        if k in data:
            v = data[k]
        else:
            v = 12
    end = time.time()
    print "method 3 spend time: %f s." % (end - start)
    times.append(end - start)

    start = time.time()
    for i in range(count):
        #method 4
        v = data.get(k)
        if v == None:
            v = 12
    end = time.time()
    print "method 4 spend time: %f s." % (end - start)
    times.append(end - start)

    return times

def main():
    print "test hit"
    data = {'a': 12}
    k = 'a'
    times1 = test(data, k, 1000000)
    print 

    print "test not hit"
    data = {'a': 12}
    k = 'ab'
    times2 = test(data, k, 1000000)
    print

    print "test data IO"
    data = {'a': 12}
    k = 'a'
    fd = FileDict(data)
    times3 = test(fd, k, 5000)
    print

    import numpy as np
    import matplotlib.pyplot as plt

    ind = np.arange(4)
    p1 = plt.bar(ind, times1, width=0.2, color='r')
    p2 = plt.bar(ind+0.2, times2, width=0.2, color='g')
    p3 = plt.bar(ind+0.4, times3, width=0.2, color='b')
    plt.xticks(ind, ('method 1', 'method 2', 'method 3', 'method 4') )
    plt.legend( (p1[0], p2[0], p3[0]), ('hit', 'not hit', 'IO') )
    plt.show()

class FileDict:
    def __init__(self, data):
        open('temp.txt','w').write(json.dumps(data))

    def get(self, key):
        return json.load(open('temp.txt'))[key]
    __getitem__ = get

    def has_key(self, key):
        return json.load(open('temp.txt')).has_key(key)
    __contains__ = has_key

if __name__=="__main__":
    main()
```

结果如图 (ubuntu9.10 + python2.6):

![image](http://lh6.ggpht.com/_os_zrveP8Ns/TMrAxqHFJwI/AAAAAAAADK4/1aJhy9uAV_w/s800/Screenshot-Figure%201-2.png)
method3性能比method2好，method1在not hit的情况下时间消耗最多，
在get消耗大的情况下method1和method4消耗的时间要比method2和method3少一半。