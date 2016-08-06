import test from 'ava'
import url from 'url'
import fetch from 'node-fetch'
import micro from 'micro-core'
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString
} from 'graphql'

import createHandler from '../'

// From https://github.com/zeit/micro/blob/master/test/index.js
const listen = (fn, opts) => {
  const srv = micro(fn, opts)

  return new Promise((resolve, reject) => {
    srv.listen(err => {
      if (err) return reject(err)
      const { port } = srv.address()
      resolve(`http://localhost:${port}`)
    })
  })
}

const addQueryParams = (urlString, params) => {
  let urlObject = url.parse(urlString, true)
  return url.format({ ...urlObject, query: { ...urlObject.query, ...params }})
}

const get = async (urlString, query = {}) => {
  let res = await fetch(addQueryParams(urlString, query))
  return res.json()
}

const TestSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'QueryRoot',
    fields: {
      test: {
        type: GraphQLString,
        args: {
          who: {
            type: GraphQLString
          }
        },
        resolve: (root, { who }) => 'Hello ' + (who || 'World')
      },
      throws: {
        type: new GraphQLNonNull(GraphQLString),
        resolve: () => { throw new Error('Throws!'); }
      }
    }
  })
})

test('query params', async t => {
  const handler = createHandler({ schema: TestSchema })

  const url = await listen(handler)
  const res = await get(url, {
    query: '{ test }'
  })

  t.deepEqual(res, { data: { test: 'Hello World' }})
})
