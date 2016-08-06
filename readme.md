# Micro GraphQL

Create a performant graphql server with [micro](https://github.com/zeit/micro) and [graphql-js](https://github.com/graphql/graphql-js).

```js
// server.js
import createHandler from 'micro-graphql'
import schema from './schema'

export default createHandler({ schema })
```

```shell
$ micro -p 3000 server.js
```

## Documentation

### Installation

Install from NPM:

```js
$ npm install micro-graphql --save
```

### API

#### createHandler
**`createHandler({ schema, context = null, root = null, formatError = defaultFormatError })`**

- `schema` is a non-optional instance of `GraphQLSchema` from [graphql-js](https://github.com/graphql/graphql-js)
- `context` can be anything, and is passed to all `resolve` functions in your schema
- `root` can be anything, and is the root value of your executed query
- `formatError` is a function which allows custom error formatting; defaults to [graphql-js#formatError](https://github.com/graphql/graphql-js/blob/master/src/error/formatError.js)
- This function is exposed as the `default` export.
- Returns a [`micro request handler`](https://github.com/zeit/micro#micro) which executes GraphQL queries and responds with JSON
- _Tip_: To configure the handler per-request, simply wrap it:

```js
export default async (req, res) => {
  const handler = createHandler({
    schema,
    context: { req }
  })
  return handler(req, res)
}
```
