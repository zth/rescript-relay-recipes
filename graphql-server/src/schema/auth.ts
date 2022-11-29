import { builder, prisma } from './builder'
import { IAuthenticated, IUnauthenticated, authenticate, register } from '../utils/auth'
import { User } from './user'
import { ErrorInterface } from './error'

const Authenticated = builder.objectRef<IAuthenticated>('Authenticated')
Authenticated.implement({
  fields: t => ({
    user: t.field({
      type: User,
      resolve: ({ userId }, _) => prisma.user.findUnique({ where: { id: userId } }),
    }),
  }),
})

const Unauthenticated = builder.objectRef<IUnauthenticated>('Unauthenticated')
Unauthenticated.implement({
  fields: t => ({ message: t.string({ resolve: () => 'User is not authorized' }) }),
})

const Session = builder.unionType('Session', {
  types: [Authenticated, Unauthenticated],
  resolveType: ({ type }) => {
    switch (type) {
      case 'Authenticated':
        return Authenticated
      case 'Unauthenticated':
        return Unauthenticated
    }
  },
})

builder.queryField('session', t =>
  t.field({
    type: Session,
    resolve: (_, _args, { session }) => session,
  })
)

const RegisterInput = builder.inputType('RegisterInput', {
  fields: t => ({
    username: t.string({ required: true }),
    password: t.string({ required: true }),
  }),
})

class RegistrationError extends Error {}
builder.objectType(RegistrationError, {
  name: 'RegistrationError',
  interfaces: [ErrorInterface],
  fields: t => ({
    message: t.exposeString('message'),
  }),
})

builder.mutationField('register', t =>
  t.field({
    type: User,
    args: { input: t.arg({ type: RegisterInput, required: true }) },
    errors: {
      union: {
        name: 'RegisterResult',
      },
      result: {
        name: 'Registered',
      },
      dataField: {
        name: 'user',
      },
      types: [RegistrationError],
    },
    resolve: async (_, { input: { username, password } }, { res }) => {
      try {
        return await register(username, password, res, prisma)
      } catch (e) {
        throw new RegistrationError(`Error registering`)
      }
    },
  })
)

const LogInInput = builder.inputType('LogInInput', {
  fields: t => ({
    username: t.string({ required: true }),
    password: t.string({ required: true }),
  }),
})

class LogInError extends Error {}
builder.objectType(LogInError, {
  name: 'LogInError',
  interfaces: [ErrorInterface],
  fields: t => ({
    message: t.exposeString('message'),
  }),
})

builder.mutationField('logIn', t =>
  t.field({
    type: User,
    args: { input: t.arg({ type: LogInInput, required: true }) },
    errors: {
      union: {
        name: 'LoginResult',
      },
      result: {
        name: 'LoggedIn',
      },
      dataField: {
        name: 'user',
      },
      types: [LogInError],
    },
    resolve: async (_, { input: { username, password } }, { res }) => {
      const result = await authenticate(username, password, res, prisma)

      if (result.type === 'Authenticated') {
        return result.user
      }

      throw new LogInError('Uknown user and/or password')
    },
  })
)

type ILoggedOut = {
  type: 'LoggedOut'
  message: string
}

const LoggedOut = builder.objectRef<ILoggedOut>('LoggedOut')
LoggedOut.implement({
  fields: t => ({ message: t.exposeString('message') }),
})

builder.mutationField('logOut', t =>
  t.field({
    type: LoggedOut,
    resolve: async (_, _args, { res, session }) => {
      if (session.type === 'Unauthenticated') {
        return {
          type: 'LoggedOut',
          message: 'Already logged out',
        } as ILoggedOut
      }

      await prisma.user.update({
        where: { id: session.userId },
        data: { refreshTokenKey: null },
      })

      res.setHeader('Set-Cookie', [
        `accessToken=""; expires=Thu, Jan 01 1970 00:00:00 UTC`,
        `refreshToken=""; expires=Thu, Jan 01 1970 00:00:00 UTC`,
      ])

      return {
        type: 'LoggedOut',
        message: 'Logged out',
      } as ILoggedOut
    },
  })
)
