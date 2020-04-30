---
layout: post
title: "how to use gem"
date: 2014-12-07 09:48:29 +0800
comments: true
categories: ruby english
---

I'm a rails developer, as a benefit of rails developer, I've got lots of [Gems](http://rubygems.org/).
Gem is flaring, but handle without enough care, it may cut your finger bleeding.
As a jeweler, I can share some knowledge about it.

## Search

First thing to do is search the gem. search google by describe it, like `rails tagging`,
or you can browse the list at [ruby toolbox](https://www.ruby-toolbox.com/).

## Pick

You should pick the right gem with enough quality. there are lots of unqualified, unmaintained shitty gems there,
you don't want to touch them. take a look at the following count on its github project page, and update activity.

You should think first before import it into your project, how its complexity level? is is stable enough? can it be extended?
Other than use the whole gem, you can copy one of it's files into your project to reduce the overhead.
Some gem may change rails module, handle them with caution.

## Use

Gem version need to be fixed, accidentially upgrading it may cause unexpected bug.

You must know what you have done, read gem documents, wiki, know how to use it.
I prefer figure out how gem works by read the source code, so if something goes wrong, you know how to deal with it.

When something bad happens, check the gem project issue page,
or you can debug it yourself by add log to the gem source code.

You need write document about what you have learned, history repeats itself, you don't want to solve the same issue more than once, like [install issue of rmagick](http://stackoverflow.com/questions/9050419/cant-install-rmagick-2-13-1-cant-find-magickwand-h).

