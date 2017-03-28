---
layout: post
title: "长时API调用设计方案"
date: 2017-03-28 20:59:03 +0800
comments: true
categories: 
---

App B提供一个计算服务，App A需要访问这个服务。可以有两种模式：Pull和Push，各有优缺点。

App A请求App B之后，B返回Job ID，
Pull模式下，A定时获取一下Job执行状况，当Job完成之后，A获得结果。
Push模式下，B完成请求之后调用A的Callback，发送结果给A。

Pull模式下网络通讯消耗更多资源，并且不能第一时间返回结果。Push模式需要AB端都提供接口，复杂度更高，并且callback有可能丢失请求。

伪代码如下：


```ruby
# Pull模式

# App A
result = HTTP.post "B/api/works", {type: 'square', value: "12"}
result == {job_id: 12, status: "init", percent: 0}
sleep 3
result = HTTP.post "B/api/jobs/12"
result == {status: "running", percent: 30}
sleep 3
result = HTTP.post "B/api/jobs/12"
result == {status: "done", percent: 100, result: 144}

# Push模式

# App A
result = HTTP.post "B/api/works", {type: 'square', value: "12", callback: 'A/api/check_job/:job_id'}
result == {job_id: 12, status: "init", percent: 0}

on 'api/check_job' do
  handle_result(params)
end


# App B

on 'api/works' do
  job = Job.create(params)
  Worker.perform_async(job.id)
end

on 'api/jobs' do
  Job = Job.find(params[:job_id])
  Job.as_json
end

class Job < Model
  def perform
    case self.type
    when 'square'
      self.percent = 10
      self.status = :running
      self.save

      sleep 3
      self.percent = 30
      self.save

      sleep 3
      self.result = self.value ** 2
      self.status = :done
    end
    if self.callback
      HTTP.post self.callback, self.as_json
    end
  end
end

class Worker
  def perform(job_id)
    job = Job.find(job_id)
    job.perform
  end
end
```


