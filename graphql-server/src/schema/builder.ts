import SchemaBuilder from '@pothos/core'
import ScopeAuthPlugin from '@pothos/plugin-scope-auth'
import PrismaPlugin from '@pothos/plugin-prisma'
import { PrismaClient } from '@prisma/client'
import RelayPlugin from '@pothos/plugin-relay'
import type PrismaTypes from '@pothos/plugin-prisma/generated'
import { Context } from './context'

export const prisma = new PrismaClient({})

export const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes
  Context: Context
  AuthScopes: { protected: boolean }
  DefaultFieldNullability: true
}>({
  plugins: [ScopeAuthPlugin, PrismaPlugin, RelayPlugin],
  prisma: {
    client: prisma,
  },
  authScopes: async context => ({
    protected: context.session.type === 'LoggedIn',
  }),
  defaultFieldNullability: true,
  relayOptions: {
    clientMutationId: 'omit',
    cursorType: 'ID',
  },
})
