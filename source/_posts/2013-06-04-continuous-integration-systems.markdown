---
layout: post
title: "持续集成测试系统评估"
date: 2013-06-04 23:11
comments: true
categories: 
---

{% img /images/posts/Continuous_Integration.png %}

今天打算弄一个[持续集成](http://en.wikipedia.org/wiki/Continuous_Integration)系统，
用来自动化测试我们[GuruDigger](http://gurudigger.com/)的代码。选型和测试结果如下。

## gitlab-ci

[gitlab-ci](http://gitlab.org/)和GitLab是一起的，安装过程非常复杂，需要创建系统用户等等，我安装失败就没有继续了。

## cruisecontrol.rb

[cruisecontrol.rb](https://github.com/thoughtworks/cruisecontrol.rb)是thoughtworks的一个东西，安装还是比较简单的。

- 首先把源代码下载下来。
- 替换gemspec里面的`rcov`成`"simplecov-rcov", '0.2.3'`，因为rcov不支持1.9.x之后的版本。
- `bundle install`。
- `./cruise start`启动服务器。
- 访问3333端口网站，或者用`./cruise`命令行进行操作。

不过这个项目看起来很老了，也没有什么更新，功能上面看起来也很简单，只是点击跑一下测试显示结果，不是很满足要求。

## travis-ci

[travis-ci](https://travis-ci.org)它可以针对github的开源项目免费测试，针对私有项目就没有办法了，可以去[下载安装源码](https://github.com/travis-ci/travis-ci)，不过上面说还不稳定不推荐自己折腾。

## cijoe

[看起来](https://github.com/defunkt/cijoe)使用比较简单，不过我死活没有跑起来。
更新也还是2年以前，放弃之。

## jenkins

[好像是](https://wiki.jenkins-ci.org/display/JENKINS/Meet+Jenkins)比较受欢迎的CI系统，
安装非常简单，只要下载war文件，然后执行`java -jar jenkins.war`，之后访问8080端口网站即可。
不过添加测试用例的过程就有点复杂，我还没有深入。看起来jenkins是我需要的东西。(待续)




