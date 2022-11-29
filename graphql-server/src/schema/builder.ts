import SchemaBuilder from '@pothos/core'
import ErrorsPlugin from '@pothos/plugin-errors'
import ScopeAuthPlugin from '@pothos/plugin-scope-auth'
import PrismaPlugin from '@pothos/plugin-prisma'
import { PrismaClient } from '@prisma/client'
import RelayPlugin from '@pothos/plugin-relay'
import type PrismaTypes from '@pothos/plugin-prisma/generated'
import { Context } from './context'
import { GraphQLError } from 'graphql'

export const prisma = new PrismaClient({})

export const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes
  Context: Context
  AuthScopes: { authenticated: boolean }
  DefaultFieldNullability: true
}>({
  plugins: [ErrorsPlugin, ScopeAuthPlugin, PrismaPlugin, RelayPlugin],
  errorOptions: {
    defaultTypes: [],
  },
  authScopes: async context => ({
    authenticated: context.session.type === 'Authenticated',
  }),
  scopeAuthOptions: {
    unauthorizedError: () => {
      throw new GraphQLError('Not authenticated', {
        extensions: {
          code: 'NOT_AUTHENTICATED',
        },
      })
    },
  },
  prisma: {
    client: prisma,
  },
  defaultFieldNullability: true,
  relayOptions: {
    clientMutationId: 'omit',
    cursorType: 'ID',
  },
})
