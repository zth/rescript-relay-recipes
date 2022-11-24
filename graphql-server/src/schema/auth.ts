import { verify, sign, Secret, JwtPayload } from 'jsonwebtoken'
import { IncomingMessage, ServerResponse } from 'http'
import Prisma, { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import { builder, prisma } from './builder'
import { User } from './user'

const ACCESS_TOKEN_SECRET: Secret = 'whatever'
const REFRESH_TOKEN_SECRET: Secret = 'whateverelse'

declare module 'jsonwebtoken' {
  export interface JwtPayload {
    userId: string
    refreshTokenKey?: string
  }
}

const generateTokensAndSetCookies = async (
  userId: string,
  res: ServerResponse,
  prisma: PrismaClient
) => {
  const accessToken = sign(
    {
      userId,
    },
    ACCESS_TOKEN_SECRET,
    { expiresIn: '5m' }
  )

  const refreshTokenKey = uuidv4()

  const user = await prisma.user.update({
    where: { id: userId },
    data: { refreshTokenKey },
  })

  const refreshToken = sign(
    {
      userId,
      refreshTokenKey: user.refreshTokenKey,
    },
    REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  )

  res.setHeader('Set-Cookie', [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])

  return { accessToken, refreshToken }
}

export const register = async (
  username: string,
  password: string,
  res: ServerResponse,
  prisma: PrismaClient
) => {
  const user = await prisma.user.create({ data: { username, password } })

  await generateTokensAndSetCookies(user.id, res, prisma)

  return user
}

export const authenticate = async (
  username: string,
  password: string,
  res: ServerResponse,
  prisma: PrismaClient
) => {
  const user = await prisma.user.findFirst({ where: { username, password } })

  if (!user) {
    throw new Error('Not found')
  }

  await generateTokensAndSetCookies(user.id, res, prisma)

  return user
}

const parseAuthCookies = (cookies: string | undefined) => {
  const parsedCookies = new Map<string, string>()

  if (!cookies) {
    return {}
  }

  cookies.split(';').map(cookie => {
    const [k, v] = cookie.trim().split('=')
    parsedCookies.set(k, v)
  })

  return {
    accessToken: parsedCookies.get('accessToken'),
    refreshToken: parsedCookies.get('refreshToken'),
  }
}

type ILoggedIn = {
  type: 'LoggedIn'
  userId: string
}

const LoggedIn = builder.objectRef<ILoggedIn>('LoggedIn')
LoggedIn.implement({
  fields: t => ({
    user: t.field({
      type: User,
      resolve: ({ userId }, _) => prisma.user.findUnique({ where: { id: userId } }),
    }),
  }),
})

type IUnauthorized = {
  type: 'Unauthorized'
}

const Unauthorized = builder.objectRef<IUnauthorized>('Unauthorized')
Unauthorized.implement({
  fields: t => ({ message: t.string({ resolve: () => 'User is not authorized' }) }),
})

export type ISession = ILoggedIn | IUnauthorized

export const getSessionAndRefreshTokens = async (
  req: IncomingMessage,
  res: ServerResponse,
  prisma: PrismaClient
): Promise<ISession> => {
  const cookies = parseAuthCookies(req.headers.cookie)

  if (cookies.accessToken) {
    try {
      const result = verify(cookies.accessToken, ACCESS_TOKEN_SECRET, { complete: true })
      const payload = result.payload as JwtPayload

      return { type: 'LoggedIn', userId: payload.userId }
    } catch (e) {
      try {
        if (cookies.refreshToken) {
          const result = verify(cookies.refreshToken, REFRESH_TOKEN_SECRET, { complete: true })
          const payload = result.payload as JwtPayload
          const user = await prisma.user.findUniqueOrThrow({ where: { id: payload.userId } })

          if (payload.refreshTokenKey && payload.refreshTokenKey === user.refreshTokenKey) {
            await generateTokensAndSetCookies(payload.userId, res, prisma)
          }
        }
      } catch {}
    }
  }

  return {
    type: 'Unauthorized',
  }
}

const Session = builder.unionType('Session', {
  types: [LoggedIn, Unauthorized],
  resolveType: ({ type }) => {
    switch (type) {
      case 'LoggedIn':
        return LoggedIn
      case 'Unauthorized':
        return Unauthorized
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
  types: [LoggedIn, LogInError],
  resolveType: ({ type }) => {
    switch (type) {
      case 'LoggedIn':
        return LoggedIn
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
          type: 'LoggedIn',
          userId: user.id,
        } as ILoggedIn
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
      if (session.type === 'Unauthorized') {
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
