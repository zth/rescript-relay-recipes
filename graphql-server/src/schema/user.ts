import { builder, prisma } from './builder'
import { ErrorInterface } from './error'

export const User = builder.prismaNode('User', {
  id: {
    field: 'id',
  },
  fields: t => ({
    username: t.exposeString('username'),
  }),
})

class ChangeUsernameError extends Error {}
builder.objectType(ChangeUsernameError, {
  name: 'ChangeUsernameError',
  interfaces: [ErrorInterface],
  fields: t => ({
    message: t.exposeString('message'),
  }),
})

builder.mutationFields(t => ({
  changeUsername: t.field({
    type: User,
    errors: {
      union: {
        name: 'ChangeUsernameResult',
      },
      result: {
        name: 'UsernameChanged',
      },
      dataField: {
        name: 'user',
      },
      types: [ChangeUsernameError],
    },
    args: {
      username: t.arg.string({ required: true }),
    },
    authScopes: {
      authenticated: true,
    },
    resolve: async (_, { username }, { session }) => {
      if (session.type === 'Authenticated') {
        return prisma.user.update({
          where: {
            id: session.userId,
          },
          data: {
            username,
          },
        })
      }
    },
  }),
}))
