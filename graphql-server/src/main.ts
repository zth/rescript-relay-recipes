import { createServer } from '@graphql-yoga/node'
import { schema, contextFactory } from './schema'

const main = async () => {
  const server = createServer({
    schema,
    context: contextFactory,
  })

  await server.start()
}

main()
