import { builder, prisma } from './builder'
import { User } from './user'

export const Comment = builder.prismaNode('Comment', {
  name: 'Comment',
  id: {
    field: 'id',
  },
  fields: t => ({
    commenter: t.field({
      type: User,
      resolve: ({ commenterId }) => prisma.user.findUnique({ where: { id: commenterId } }),
    }),
    content: t.exposeString('content'),
  }),
})

builder.mutationFields(t => ({
  postComment: t.field({
    type: Comment,
    args: {
      postNodeId: t.arg.globalID({ required: true }),
      content: t.arg.string({ required: true }),
    },
    authScopes: {
      loggedIn: true,
    },
    resolve: async (_, { postNodeId, content }, { session }) => {
      if (session.type === 'LoggedIn') {
        return prisma.comment.create({
          data: {
            postId: postNodeId.id,
            commenterId: session.userId,
            content: content,
          },
        })
      }
    },
  }),
}))
