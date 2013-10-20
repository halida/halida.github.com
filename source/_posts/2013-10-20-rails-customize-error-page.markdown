---
layout: post
title: "rails定制报错页面"
date: 2013-10-20 10:58
comments: true
categories: 
---

{% img /images/posts/2013_10_20_404.jpg %}

需求
----------------

rails的默认报错处理，是返回`public/400.html`，`public/500.html`的内容。
我们一般期望能够定制化它，根据用户登录或者状况返回一个动态渲染的页面。

我们一般希望能够定制：500服务器错误，400地址不存在。

解决方案
----------------

在你的`app/controllers/application_controller.rb`的`ApplicationController`里面用`rescue_from`捕捉他们，并且只在生产环境这样做：

```ruby
class ApplicationController < ActionController::Base
  ...
  unless Rails.application.config.consider_all_requests_local
    rescue_from Exception, with: lambda { |exception|
      render_error 500, exception
      ExceptionNotifier::Notifier.exception_notification(request.env, exception).deliver
      true
    }
    rescue_from ActionController::UnknownController, ActiveRecord::RecordNotFound, with: lambda { |exception|
      render_error 404, exception
    }
  end
  ...
```

500报错需要能够通知管理员，上面的`exception_notification`是我利用[exception_notification](https://github.com/smartinez87/exception_notification)gem2.6版本中发送报错信息邮件的功能来做到这件事。

然后加上`render_error`方法，用来渲染报错页面，你可以在这里做定制渲染：

```
def render_error(status, exception)
  respond_to do |format|
    format.html { render template: "errors/error_#{status}", layout: 'layouts/application', status: status }
    format.all { render nothing: true, status: status }
  end
end
```

还是有一个问题，无法捕捉`ActionController::RoutingError`和`AbstractController::ActionNotFound`，需要在`config/route.rb`里面最后捕捉：

```ruby
unless Rails.application.config.consider_all_requests_local
  match '*not_found', to: 'errors#error_404'
end
```

加上`errors_controller.rb`，里面：

```ruby
class ErrorsController < ApplicationController
  def error_404
    @not_found_path = params[:not_found]
    render_error 404, nil
  end
```


资源引用：

- [http://ramblinglabs.com/blog/2012/01/rails-3-1-adding-custom-404-and-500-error-pages](http://ramblinglabs.com/blog/2012/01/rails-3-1-adding-custom-404-and-500-error-pages)
- [http://stackoverflow.com/questions/7342851/catch-unknown-action-in-rails-3-for-custom-404](http://stackoverflow.com/questions/7342851/catch-unknown-action-in-rails-3-for-custom-404)


