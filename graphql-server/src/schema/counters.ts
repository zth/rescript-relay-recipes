import { decodeGlobalID } from '@pothos/plugin-relay'
import { resolveArrayConnection } from '@pothos/plugin-relay'
import { builder, prisma } from './builder'

const Counter = builder.prismaNode('Counter', {
  name: 'Counter',
  description: 'A counter with a label and count',
  id: {
    field: 'id',
  },
  fields: t => ({
    label: t.exposeString('label'),
    count: t.exposeInt('value'),
  }),
})

builder.queryFields(t => ({
  defaultCounter: t.field({
    type: Counter,
    resolve: async () => {
      await new Promise(f => setTimeout(f, 1000))
      return null
    },
  }),
  myCounter: t.field({
    type: Counter,
    resolve: async () => {
      await new Promise(f => setTimeout(f, 1000))
      return null
    },
  }),
  counters: t.connection({
    type: Counter,
    resolve: (_, args) => {
      return resolveArrayConnection({ args }, [])
    },
  }),
}))

builder.mutationFields(t => ({
  incrementCount: t.field({
    type: Counter,
    args: { id: t.arg.globalID({ required: true }) },
    resolve: async (_, { id: globalID }) => {
      if (globalID.typename !== 'Counter') {
        throw new Error(`${globalID} is not a Node id of a Counter`)
      }

      const counterId = Number(globalID.id)

      // TODO: Add ownership checks
      const counter = await prisma.counter.findUnique({ where: { id: counterId } })

      if (counter) {
        return prisma.counter.update({
          where: { id: counterId },
          data: { value: counter.value + 1 },
        })
      }

      return null
    },
  }),
  decrementCount: t.field({
    type: Counter,
    args: { id: t.arg.globalID({ required: true }) },
    resolve: async (_, { id: globalID }) => {
      if (globalID.typename !== 'Counter') {
        throw new Error(`${globalID} is not a Node id of a Counter`)
      }
      const counterId = Number(globalID.id)

      // TODO: Add ownership checks
      const counter = await prisma.counter.findUnique({ where: { id: counterId } })

      if (counter) {
        return prisma.counter.update({
          where: { id: counterId },
          data: { value: counter.value - 1 },
        })
      }

      return null
    },
  }),
}))
