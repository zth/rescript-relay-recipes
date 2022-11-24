import { builder, prisma } from './builder'
import { IAuthenticated, IUnauthenticated, authenticate, register } from '../utils/auth'
import { User } from './user'

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

type ILogInError = {
  type: 'LogInError'
  message: string
}
const LogInError = builder.objectRef<ILogInError>('LogInError')
LogInError.implement({
  fields: t => ({ message: t.exposeString('message') }),
})

const LogInResponse = builder.unionType('LogInResponse', {
  types: [Authenticated, LogInError],
  resolveType: ({ type }) => {
    switch (type) {
      case 'Authenticated':
        return Authenticated
      case 'LogInError':
        return LogInError
    }
  },
})

type IRegistered = {
  type: 'Registered'
  userId: string
}
const Registered = builder.objectRef<IRegistered>('Registered')
Registered.implement({
  fields: t => ({
    user: t.field({
      type: User,
      resolve: ({ userId }, _) => prisma.user.findUnique({ where: { id: userId } }),
    }),
  }),
})

type IRegistrationError = {
  type: 'RegistrationError'
  message: string
}

const RegistrationError = builder.objectRef<IRegistrationError>('RegistrationError')
RegistrationError.implement({
  fields: t => ({ message: t.exposeString('message') }),
})

const RegistrationResponse = builder.unionType('RegistrationResponse', {
  types: [Registered, RegistrationError],
  resolveType: ({ type }) => {
    switch (type) {
      case 'Registered':
        return Registered
      case 'RegistrationError':
        return RegistrationError
    }
  },
})

builder.mutationField('register', t =>
  t.field({
    type: RegistrationResponse,
    args: { email: t.arg.string({ required: true }), password: t.arg.string({ required: true }) },
    resolve: async (_, { email, password }, { res }) => {
      try {
        const user = await register(email, password, res, prisma)
        return {
          type: 'Registered',
          userId: user.id,
        } as IRegistered
      } catch {
        return {
          type: 'RegistrationError',
          message: 'Error registering in',
        } as IRegistrationError
      }
    },
  })
)

builder.mutationField('login', t =>
  t.field({
    type: LogInResponse,
    args: {
      username: t.arg.string({ required: true }),
      password: t.arg.string({ required: true }),
    },
    resolve: async (_, { username, password }, { res }) => {
      try {
        const user = await authenticate(username, password, res, prisma)
        return {
          type: 'Authenticated',
          userId: user.id,
        } as IAuthenticated
      } catch (e) {
        return {
          type: 'LogInError',
          message: 'Error logging in',
        } as ILogInError
      }
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

builder.mutationField('logout', t =>
  t.field({
    type: LoggedOut,
    authScopes: {
      loggedIn: true,
    },
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
