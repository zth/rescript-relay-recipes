import SchemaBuilder from '@pothos/core'
import RelayPlugin from '@pothos/plugin-relay'
import { resolveArrayConnection } from '@pothos/plugin-relay'

class Counter {
  static counterId = 0

  id: number
  label: string
  count: number

  constructor(label: string) {
    this.id = Counter.counterId++
    this.label = label
    this.count = 0
  }
}

const builder = new SchemaBuilder<{
  DefaultFieldNullability: true
}>({
  plugins: [RelayPlugin],
  defaultFieldNullability: true,
  relayOptions: {
    clientMutationId: 'omit',
    cursorType: 'ID',
  },
})

const counters: Array<Counter> = [new Counter('Default')]
const getCounter = (id: string) => counters.find(counter => String(counter.id) === id)

builder.node(Counter, {
  name: 'Counter',
  description: 'A counter with a label and count',
  id: {
    resolve: counter => counter.id,
  },
  loadMany: ids => ids.map(id => getCounter(id)),
  fields: t => ({
    label: t.exposeString('label'),
    count: t.exposeInt('count'),
  }),
})

builder.queryType({
  fields: t => ({
    defaultCounter: t.field({
      type: Counter,
      resolve: async () => {
        await new Promise(f => setTimeout(f, 1000))
        return counters[0]
      },
    }),
    counters: t.connection({
      type: Counter,
      resolve: (_, args) => {
        return resolveArrayConnection({ args }, counters)
      },
    }),
  }),
})

builder.mutationType({
  fields: t => ({
    incrementCount: t.field({
      type: Counter,
      args: { id: t.arg.globalID({ required: true }) },
      resolve: async (_, { id: globalID }) => {
        const counter = getCounter(globalID.id)
        if (counter) {
          counter.count++
          return counter
        }

        return null
      },
    }),
    decrementCount: t.field({
      type: Counter,
      args: { id: t.arg.globalID({ required: true }) },
      resolve: async (_, { id: globalID }) => {
        const counter = getCounter(globalID.id)
        if (counter) {
          counter.count--
          return counter
        }

        return null
      },
    }),
  }),
})

export const schema = builder.toSchema()
