import { builder } from './builder'

export const User = builder.prismaNode('User', {
  id: {
    field: 'id',
  },
  fields: t => ({
    username: t.exposeString('username'),
  }),
})
