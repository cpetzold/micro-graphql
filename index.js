import url from 'url'
import { createError, json } from 'micro-core'
import {
  graphql,
  formatError as defaultFormatError,
} from 'graphql'

async function getQueryInfo(req) {
  const {
    query: urlQuery,
    variables: urlVariables
  } = url.parse(req.url, true).query

  const {
    query: bodyQuery,
    variables: bodyVariables
  } = req.body ? await json(req) : {}

  return {
    query: urlQuery || bodyQuery,
    variables: urlVariables || bodyVariables
  }
}

export default function graphqlListener (opts) {
  return async (req, res) => {
    const options = await (typeof opts === 'function' ? opts(req, res) : opts)

    if (!options || typeof options !== 'object') {
      throw new Error(
        'GraphQL middleware option function must return an options object ' +
        'or a promise which will be resolved to an options object.'
      )
    }

    const {
      schema,
      context,
      root,
      formatError
    } = options

    if (!schema) {
      throw new Error('GraphQL middleware options must contain a schema.')
    }

    if (req.method !== 'GET' && req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST');
      throw createError(405, 'GraphQL only supports GET and POST requests.');
    }

    const {
      query,
      variables
    } = await getQueryInfo(req)

    const result = await graphql(schema, query, root, context, variables)

    if (result && result.errors) {
      result.errors = result.errors.map(defaultFormatError)
    }

    return result
  }
}
