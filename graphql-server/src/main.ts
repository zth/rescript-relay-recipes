import { createServer } from '@graphql-yoga/node'
import { schema } from './schema'

const main = async () => {
  const server = createServer({
    schema,
  })

  await server.start()
}

main()
