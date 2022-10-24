import RelayPlugin from '@pothos/plugin-relay'
import ScopeAuthPlugin from '@pothos/plugin-scope-auth'
import SchemaBuilder from '@pothos/core'
import { resolveArrayConnection } from '@pothos/plugin-relay'
import { Context } from './context'
import { authenticate, register } from './auth'

const builder = new SchemaBuilder<{
  Context: Context
  AuthScopes: { protected: boolean }
  DefaultFieldNullability: true
}>({
  plugins: [ScopeAuthPlugin, RelayPlugin],
  authScopes: async context => ({
    protected: context.session.type === 'LoggedIn',
  }),
  defaultFieldNullability: true,
  relayOptions: {
    clientMutationId: 'omit',
    cursorType: 'ID',
  },
})

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
    me: t.string({
      resolve: (_, _args, { session }) => {
        if (session.type === 'LoggedIn') {
          return session.userId
        }
      },
    }),
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

const LoggedIn = builder
  .objectRef<{
    type: 'LoggedIn'
    accessToken: string
    refreshToken: string
  }>('LoggedIn')
  .implement({
    fields: t => ({
      accessToken: t.exposeString('accessToken'),
      refreshToken: t.exposeString('refreshToken'),
    }),
  })

const LogInError = builder
  .objectRef<{
    type: 'LogInError'
    message: string
  }>('LogInError')
  .implement({
    fields: t => ({ message: t.exposeString('message') }),
  })

const LogInResponse = builder.unionType('LogInResponse', {
  types: [LoggedIn, LogInError],
  resolveType: ({ type }) => {
    switch (type) {
      case 'LoggedIn':
        return LoggedIn
      case 'LogInError':
        return LogInError
    }
  },
})

const RegistrationError = builder
  .objectRef<{
    type: 'RegistrationError'
    message: string
  }>('RegistrationError')
  .implement({
    fields: t => ({ message: t.exposeString('message') }),
  })

const RegistrationResponse = builder.unionType('RegistrationResponse', {
  types: [LoggedIn, RegistrationError],
  resolveType: ({ type }) => {
    switch (type) {
      case 'LoggedIn':
        return LoggedIn
      case 'RegistrationError':
        return RegistrationError
    }
  },
})

builder.mutationType({
  fields: t => ({
    register: t.field({
      type: RegistrationResponse,
      args: { email: t.arg.string({ required: true }), password: t.arg.string({ required: true }) },
      resolve: async (_, { email, password }, { res, prisma }) => {
        try {
          await register(email, password, prisma)
          const { accessToken, refreshToken } = await authenticate(email, password, res, prisma)
          return {
            type: 'LoggedIn',
            accessToken,
            refreshToken,
          } as const
        } catch {
          return {
            type: 'RegistrationError',
            message: 'Error logging in',
          } as const
        }
      },
    }),
    login: t.field({
      type: LogInResponse,
      args: { email: t.arg.string({ required: true }), password: t.arg.string({ required: true }) },
      resolve: async (_, { email, password }, { res, prisma }) => {
        try {
          const { accessToken, refreshToken } = await authenticate(email, password, res, prisma)
          return {
            type: 'LoggedIn',
            accessToken,
            refreshToken,
          } as const
        } catch {
          return {
            type: 'LogInError',
            message: 'Error logging in',
          } as const
        }
      },
    }),
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
