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

const PostCommentInput = builder.inputType('PostCommentInput', {
  fields: t => ({
    postNodeId: t.globalID({ required: true }),
    content: t.string({ required: true }),
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

builder.mutationField('postComment', t =>
  t.field({
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
      input: t.arg({ type: PostCommentInput, required: true }),
    },
    authScopes: {
      authenticated: true,
    },
    resolve: async (_, { input: { postNodeId, content } }, { session }) => {
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
  })
)
