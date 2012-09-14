
---
layout: post
title: pyqt介绍
date: 2010-11-10 08:59:03 +0800

comments: true
categories: 
---

最强大的GUI库 -- PyQt4
------------------------------

Authors
  ~ 机械唯物主义
    <[linjunhalida@gmai.com](mailto:linjunhalida@gmai.com)\>

一个简单的实例
--------------

-   计算器
-   10分钟

![image](http://lh6.ggpht.com/_os_zrveP8Ns/TNnrsk8C64I/AAAAAAAADMc/TMTjkv1is7k/s800/caculator_ui.png)
代码
----

![image](http://lh3.ggpht.com/_os_zrveP8Ns/TNnooDH5dtI/AAAAAAAADLo/KK7FwKekTRo/s800/caculator.JPG)
```python
#!/usr/bin/env python
#-*- coding:utf-8 -*-
from PyQt4.QtCore import *
from PyQt4.QtGui import *

class Caculator(QDialog):
    def __init__(self):
        super(Caculator, self).__init__()
        #widgets
        self.leInput = QLineEdit()
        self.lwResult = QListWidget()
        #layouts
        l = QVBoxLayout(self)
        for w in self.leInput, self.lwResult:
            l.addWidget(w)
        #events
        self.leInput.returnPressed.connect(self.caculate)

    def caculate(self):
        data = unicode(self.leInput.text())
        if not data: return
        self.leInput.clear()

        try:
            result = unicode(eval(data))
        except Exception as e:
            result = unicode(e)

        self.lwResult.addItem(result)


def main():
    app = QApplication([])
    Caculator().exec_()

if __name__=="__main__":
    main()
```

类层级
------

    QObject
       |----- QWidget
                 |----- QDialog
                 |----- QLineEdit
                 |----- QListWidget

layout
------

![image](http://lh3.ggpht.com/_os_zrveP8Ns/TNnoon5j6aI/AAAAAAAADLw/ITJ9fVU9YtE/s800/layout.JPG)
layout
------

-   层级:

        QDialog (QVBoxLayout)
           |----- QLineEdit
           |----- QListWidget

-   代码:

```python
l = QVBoxLayout(self)
for w in self.leInput, self.lwResult:
    l.addWidget(w)
```

Signal and Slot in Qt
---------------------

![image](http://lh4.ggpht.com/_os_zrveP8Ns/TNnoo68TzKI/AAAAAAAADL4/jPjbRhwQEI8/s800/signal_and_slot.JPG)
Qt和PyQt 事件机制区别
---------------------

-   Qt:

```c++
this->connect(leInput, SINGAL(returnPressed()), this, caculate))
```

-   PyQt:

```python
self.leInput.returnPressed.connect(self.caculate)
```

一个复杂的实例: 扫雷
--------------------

-   花费时间: 2个晚上, 基础:2.5小时, 一点点提升:1小时
-   扫雷下载: [pyqtmine](https://bitbucket.org/linjunhalida/pyqtmine/)

![image](http://lh6.ggpht.com/_os_zrveP8Ns/TNnoooQuryI/AAAAAAAADL0/MLwyt5qromk/s800/pyqtmine.JPG)
UI designer
-----------

![image](http://lh4.ggpht.com/_os_zrveP8Ns/TNnoodk5clI/AAAAAAAADLs/cbHdyQCMco8/s800/designer.JPG)
UI with Code
------------

```python
form, base = uic.loadUiType("score.ui")
class ScoreDlg(QDialog, form):
    def __init__(self):
        super(ScoreDlg, self).__init__()
        self.setupUi(self)
```

Event
-----

```python
def mouseReleaseEvent(self, event):
    if event.button() == Qt.LeftButton:
        ...

def paintEvent(self, event=None):
    p = QPainter(self)
    ...
p.drawLine(mx+i*sx, my, mx+i*sx, my+y*sy)
```

其他强大特性
------------

-   足够多和好用的控件/自定控件/整合到designer中
-   webkit/script支持
-   强大/方便/快速的绘图控件
-   富文本/文本解析
-   多国语言支持
-   其他第三方控件支持: pyqwt

发布
----

[pyinstaller](http://www.pyinstaller.org/)!

资源
----

-   PyQt安装
      ~ -   ubuntu:

                sudo apt-get install pyqt4-dev-tools

        -   windows可以下载一个python包:
            [pythonxy](http://www.pythonxy.com)

-   学习材料
      ~ -   [qt](http://qt.nokia.com/products/) 以及
            [pyqt](http://www.riverbankcomputing.co.uk/software/pyqt/intro)
            官方网站
        -   书籍请google: pyqt book or qt book

        -   中文资料: [qteverywhere](http://www.qteverywhere.com/)
