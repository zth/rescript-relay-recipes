import SchemaBuilder from '@pothos/core'
import ScopeAuthPlugin from '@pothos/plugin-scope-auth'
import RelayPlugin from '@pothos/plugin-relay'
import { Context } from './context'

export const builder = new SchemaBuilder<{
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
