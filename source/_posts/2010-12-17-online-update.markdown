---
layout: post
title: 程序如何作在线更新
date: 2010-12-17 11:01:49 +0800

comments: true
categories: 
---

问题
------------------------------

![image](http://lh4.ggpht.com/_os_zrveP8Ns/TQrJ7IXV-_I/AAAAAAAADOU/AFzkVbp1W_8/s800/101118-Caribou-web.jpg)

我们的客户端程序庞大, 笨重, 更为严重的是, 当我们的程序发布给用户之后,
如果没有问题还好, 遇到了bug, 修改很成问题.
如何把更新后的程序发布给用户呢? 很多项目在做架构的时候,
选择采用web方式来绕过这样的问题. 但是很多时候还是非用客户端程序不可.
如何让客户端程序实现在线更新功能? 这里提供我的一个非常简单的解决方案.

思路
------------------------------

更新的业务逻辑很简单. 只需要下面几步:

-   去某个服务器, 下载一个记录有版本信息的文档.
-   与本地程序的版本号做比较, 如果不是最新的, 提示用户更新程序.
-   更新程序的方法: 去服务器下载一个压缩包, 解压覆盖本地程序.

然后是具体实现上面的逻辑.

要点
------------------------------

-   服务器必须能够被客户访问到.

    如果是在外网的话, 必须有一个存放更新文件的公共服务器. 我采用 [google
    code](http://code.google.com) 存放文件. 一个项目上传文件的限额是2G,
    足够用了. 你也可以选择自己搭建一个http/ftp服务器,
    或者用dropbox(被墙掉了), everbox(现在还不支持共享文件).

-   更新程序. 下载程序后, 需要覆盖当前程序目录, windows下面,
    开启后的程序会加锁执行文件, 所以需要运行另外的一个程序来做更新.
    下面是具体的逻辑.

更新程序解决方案
------------------------------

比如旧程序在dir\_a目录下面, 可执行文件是a.exe.
星号括起来的是当前正在执行的文件.

    dir_a: **a.exe**

我们把dir\_a拷贝出一份, 到dir\_backup, 最新的程序保存到dir\_backup里面,
保存为new.tar.gz. 下载完毕后, 我们在dir\_b里面建立一个文件,
叫need\_update, 作为标识.

    dir_a: **a.exe**
    dir_backup: a.exe, new.tar.gz, need_update

用 [execl](http://docs.python.org/library/os.html#os.execl)
(c/c++/python/都可以用类似的函数调用), 关闭当前程序,
跳到dir\_backup环境里面, 执行dir\_backup/a.exe.

    dir_a: a.exe
    dir_backup: **a.exe**, new.tar.gz, need_update

dir\_backup/a.exe启动的时候检查当前目录下面是否有need\_update, 有的话,
就解压new.tar.gz, 覆盖dir\_a. 这个时候程序已经更新完成了.

    dir_a: new.exe
    dir_backup: **a.exe**, new.tar.gz, need_update

然后再用 \`execl\`, 放弃当前程序, 执行dir\_a/new.exe.

    dir_a: **new.exe**
    dir_backup: a.exe, new.tar.gz, need_update

步骤虽然有点复杂, 但是顶用, 也不需要另外加一个更新程序.
对于python发布出去的代码来说, 一个可执行文件就上M了, 少一个是一个.

下面是实际代码, 因为是从实际项目中挖出来的, 保证不能用.
都是update.py这一个源文件的:

```python
from qtlib import *
from qtlib.download import download
from config import add_config, conf
from tools.progresser import Progresser

import tarfile
from distutils.dir_util import copy_tree
SERVER = "http://project.googlecode.com/files/"

def update(program, version):
    """具体更新的方法"""
    if not confirm(None, '开始准备更新, 是否继续?'):
        return

    # 检查是否有更新
    if not check_update(program, version):
        return

    # 复制program
    temp_path = '../%s.backup' % program
    shutil.rmtree(temp_path, True)
    shutil.copytree(os.path.join('..', program),
                    temp_path)

    # 下载程序
    tar_file = program + '.tar.gz'
    local_tar_file = os.path.join(temp_path, tar_file)

    with Progresser("下载中, 比较忙, 你可以离开位置休息一下..","退出",0,100, None) as p:
        result = download(SERVER + tar_file,
                          local_tar_file,
                          stepper = p)
        if result == False:
            showMsg("无法连接到服务器, 请检查是否连上外部网络!")
            return
        elif result == None:
            showMsg('取消下载, 不好意思, 下次还得从头开始下载..')
            return

    showMsg('下载完成, 现在安装新程序.')
    os.chdir(temp_path)
    # 解压
    unzip(tar_file)
    # 标示一下是新程序
    with open('need_update', 'w+') as f:
        f.write(program)
    # 执行新程序
    program_name = program+'.exe'
    os.execl(program_name, program_name)

def check_update(program, version):
    """检查是否有更新"""
    # 下载versions文件
    if download(SERVER+'versions', 'temp/versions') == False:
        showMsg("无法连接到服务器, 请检查是否连上外部网络!")
        return False

    # 读取里面的信息
    data = open('temp/versions').read()
    # 格式是: program + 空格 + 版本号
    for line in data.split('\n'):
        if line.startswith(program):
            new_version = line.split(' ')[1]
            # 把版本号当作浮点来检查
            if float(version) < float(new_version):
                return True
            else:
                showMsg("程序已经是最新版本: %s, %s" % (program, version))


def check_finish_update():
    # 检查当前是否是需要更新的临时文件
    if not os.path.isfile('need_update'):
        return
    # 读取程序名称
    with open('need_update') as f:
        program = f.read()
    os.remove('need_update')
    # 然后把新程序复制回去
    old_path = '../%s'%program
    copy_tree(program, old_path)
    # 执行程序
    os.chdir(old_path)
    program_name = program + '.exe'
    os.execl(program_name, program_name)

# 加载update.py模块的时候, 判断当前是否为在backup过程中执行的..
check_finish_update()
```

其他
------------------------------

基于上面的更新逻辑, 我们还可以根据需求, 补充一些功能:

-   启动的时候检查更新. 只需要用threading.Thread(target=check\_update,
    ...)来用一个线程跑更新检查就可以了.
-   后台更新. 也可以用一个线程跑下载, 下载完毕后, 再通知主线程.
-   增量更新, 减少下载时间. 可以考虑用diff之类工具.

如果有人觉得这样的更新脚本有价值的话, 可以联系我,
让我整理出一份不依赖其他模块的代码出来.