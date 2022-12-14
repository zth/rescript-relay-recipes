import { builder, prisma } from './builder'
import { ErrorInterface } from './error'
import { User } from './user'

export const Post = builder.prismaNode('Post', {
  name: 'Post',
  id: {
    field: 'id',
  },
  fields: t => ({
    title: t.exposeString('title'),
    content: t.exposeString('content'),
    poster: t.field({
      type: User,
      resolve: ({ posterId }) => prisma.user.findUnique({ where: { id: posterId } }),
    }),
    comments: t.relatedConnection('comments', {
      cursor: 'id',
      authScopes: {
        authenticated: true,
      },
      query: () => ({
        orderBy: {
          createdAt: 'asc',
        },
      }),
    }),
  }),
})

builder.queryFields(t => ({
  posts: t.prismaConnection({
    type: Post,
    cursor: 'id',
    resolve: (query, _parent, _args) => prisma.post.findMany({ ...query }),
  }),
}))

const CreatePostInput = builder.inputType('CreatePostInput', {
  fields: t => ({
    title: t.string({ required: true }),
    content: t.string({ required: true }),
  }),
})

class CreatePostError extends Error {}
builder.objectType(CreatePostError, {
  name: 'CreatePostError',
  interfaces: [ErrorInterface],
  fields: t => ({
    message: t.exposeString('message'),
  }),
})

builder.mutationField('createPost', t =>
  t.field({
    type: Post,
    errors: {
      union: {
        name: 'CreatePostResult',
      },
      result: {
        name: 'PostCreated',
      },
      dataField: {
        name: 'post',
      },
      types: [CreatePostError],
    },
    args: { input: t.arg({ type: CreatePostInput, required: true }) },
    authScopes: {
      authenticated: true,
    },
    resolve: async (_, { input: { title, content } }, { session }) => {
      if (session.type === 'Authenticated') {
        return prisma.post.create({
          data: {
            posterId: session.userId,
            title: title,
            content: content,
          },
        })
      }
    },
  })
)
