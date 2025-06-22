
In [this part](https://fullstackopen.com/en/part8/fragments_and_subscriptions#subscriptions-on-the-server), should use:
```
const { useServer } = require('graphql-ws/use/ws')
```
instead of this
```
const { useServer } = require('graphql-ws/lib/use/ws')
```

The reason for this please see this [Github Issue](https://github.com/enisdenjo/graphql-ws/issues/617)