import { createServer } from '@graphql-yoga/node'
import { schema } from './schema'
import { Context, makeContext } from './context'

const main = async () => {
  const server = createServer({
    schema,
    context: async ({ req, res }): Promise<Context> => makeContext({ req, res }),
  })

  await server.start()
}

main()
