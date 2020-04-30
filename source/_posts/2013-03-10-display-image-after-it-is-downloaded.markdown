---
layout: post
title: "display image after it is downloaded"
date: 2013-03-10 18:40
comments: true
categories: english
---

It is very annoying when you see a image is loading in a webpage:

{% img /images/posts/CPyoOWx.png %}

Lots of website support this kind of effect to get rid of this.
when the image is loading, it is displaying a "loading" effect, like this:

{% img /images/posts/m76L8U5.png %}

So how can we implement it to our website? The method is simple:

1. Display a loading gif, and hide the image.
2. After image loaded, hide gif, and display image.

We can use JQuery `load` method [here](api.jquery.com/load/) to add a callback to do the things in step 2 above.
Use this html:

```html
<img class="loading_image" data-src="/images/demo.png">
...
<div class="resources">
  <img class="image_loader" src="loader.gif">
</div>
```

add run `init_loading_image` javascript list below. 
It is written in [coffeescript](http://coffeescript.org/):

```coffeescript
window.init_loading_image = ()->
    $('.loading_image').each ->
        self = $(this)
        loader = $('.resources .image_loader').clone()
        loader.insertBefore(self)
        self.load ->
            self.prev().hide()
            self.addClass('show')
        self.attr('src', self.data('src'))
$(init_loading_image)
```

For each `.loading_image`, place a loader gif in front of it.
I set the image to opacity 0.0, so the image is downloading, and user will not see this image.
after image loaded, hide the gif, and show the image.

The css is list below. I'm using [sass](http://sass-lang.com/) + [compass](http://compass-style.org/) for clearer css:

```css
.resources
  display: none
.loading_image
  +opacity(0.0)
  &.show
    +opacity(1.0)
    +transition-property(opacity)
    +transition-duration(0.3s)
.image_loader
  position: absolute
  top: 50%
  left: 50%
  margin-top: -6px
  margin-left: -22px
  width: 43px
  height: 11px
```

Very simple process, you can see [the demo here](http://jsfiddle.net/linjunhalida/kU2VU/2/).