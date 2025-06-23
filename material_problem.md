# Problem

## 1. useServer
In [this part](https://fullstackopen.com/en/part8/fragments_and_subscriptions#subscriptions-on-the-server), should use:
```
const { useServer } = require('graphql-ws/use/ws')
```
instead of this
```
const { useServer } = require('graphql-ws/lib/use/ws')
```

The reason for this please see this [Github Issue](https://github.com/enisdenjo/graphql-ws/issues/617)


## 2. express 5.0

npm install express@4

设置 Apollo Server 与 ExpressJS 后，GraphQL IDE（如 GraphQL Playground）无法显示。

浏览器报错如下：

    req.body is not set; this probably means you forgot to set up the json middleware before the Apollo Server middleware.


可能是express 5.0不兼容Apollo Server，需要降级到4.0


```bash
$ npm list express
graphql_intro@1.0.0 D:\Projects\CodeFiles\Front-End\HelsinkiU-part8\GraphQL_intro
├─┬ @apollo/server@4.12.0
│ └── express@4.21.2
└── express@5.1.0
```

运行：

```bash
$ npm install express@4
...
$ npm list express
graphql_intro@1.0.0 D:\Projects\CodeFiles\Front-End\HelsinkiU-part8\GraphQL_intro
├─┬ @apollo/server@4.12.0
│ └── express@4.21.2 deduped
└── express@4.21.2
```


# Tips

# Subscription

Implementing subscriptions involves a lot of configurations. You will be able to cope with the few exercises of this course without worrying much about the details. If you are planning to use subscriptions in an production use application, you should definitely read [Apollo's documentation](https://www.apollographql.com/docs/apollo-server/data/subscriptions) on subscriptions carefully.

测试：
在一个浏览器tab里运行subscribe，然后在另一个tab里运行addBook，在前者的Subscriptions栏就可以看到更新了


# BUG

在网页端修改author的birth之后，无法请求到Author的信息，提示bookCount变成Null了

排查后：疑似Add books title length不够时候的bug, 复现过程：

1. 添加title length不足的book
2. 再到Author页面刷新就会崩溃

原因可能是因为字数不够，没有添加book, 但是author被添加了，导致请求AllAuthor的时候，添加的author书籍count变成了undefined

可能的解决方法：在addBook的后端resolver里添加验证字符数的代码