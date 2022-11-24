import { builder, prisma } from './builder'
import { ErrorInterface } from './error'
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

class PostCommentError extends Error {}
builder.objectType(PostCommentError, {
  name: 'PostCommentError',
  interfaces: [ErrorInterface],
  fields: t => ({
    message: t.exposeString('message'),
  }),
})

builder.mutationFields(t => ({
  postComment: t.field({
    type: Comment,
    errors: {
      union: {
        name: 'PostCommentResult',
      },
      result: {
        name: 'CommentPosted',
      },
      dataField: {
        name: 'comment',
      },
      types: [PostCommentError],
    },
    args: {
      postNodeId: t.arg.globalID({ required: true }),
      content: t.arg.string({ required: true }),
    },
    authScopes: {
      loggedIn: true,
    },
    resolve: async (_, { postNodeId, content }, { session }) => {
      if (session.type === 'Authenticated') {
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
