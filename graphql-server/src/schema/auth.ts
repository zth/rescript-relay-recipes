import { verify, sign, Secret, JwtPayload } from 'jsonwebtoken'
import { IncomingMessage, ServerResponse } from 'http'
import { PrismaClient } from '@prisma/client'
import { builder } from './builder'

const ACCESS_TOKEN_SECRET: Secret = 'whatever'
const REFRESH_TOKEN_SECRET: Secret = 'whateverelse'

declare module 'jsonwebtoken' {
  export interface JwtPayload {
    userId: string
  }
}

const generateCookies = (userId: string) => {
  const accessToken = sign(
    {
      userId,
    },
    ACCESS_TOKEN_SECRET,
    { expiresIn: '5m' }
  )

  const refreshToken = sign(
    {
      userId,
    },
    REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  )

  return { accessToken, refreshToken }
}

export const register = async (
  email: string,
  password: string,
  res: ServerResponse,
  prisma: PrismaClient
) => {
  const user = await prisma.user.create({ data: { email, password } })

  const { accessToken, refreshToken } = generateCookies(user.id)
  res.setHeader('Set-Cookie', [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])

  return user
}

export const authenticate = async (
  email: string,
  password: string,
  res: ServerResponse,
  prisma: PrismaClient
) => {
  const user = await prisma.user.findFirst({ where: { email, password } })

  if (!user) {
    throw new Error('Not found')
  }

  const { accessToken, refreshToken } = generateCookies(user.id)
  res.setHeader('Set-Cookie', [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])

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

type ISessionLoggedIn = {
  type: 'LoggedIn'
  userId: string
}

type ISessionNotLoggedIn = {
  type: 'NotLoggedIn'
}

export type ISession = ISessionLoggedIn | ISessionNotLoggedIn

export const getSessionAndRefreshTokens = (req: IncomingMessage, res: ServerResponse): ISession => {
  const cookies = parseAuthCookies(req.headers.cookie)

  let payload: JwtPayload | null = null

  if (cookies.accessToken) {
    try {
      const result = verify(cookies.accessToken, ACCESS_TOKEN_SECRET, { complete: true })

      if (result) {
        payload = result.payload as JwtPayload
      }
    } catch {
      if (cookies.refreshToken) {
        const result = verify(cookies.refreshToken, REFRESH_TOKEN_SECRET, { complete: true })
        // TODO Verify that the refresh token has not been revoked
        const payload_ = result.payload as JwtPayload

        const { accessToken, refreshToken } = generateCookies(payload_.userId)
        res.setHeader('Set-Cookie', [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])

        if (result) {
          payload = result.payload as JwtPayload
        }
      }
    }
  }

  return payload
    ? {
        type: 'LoggedIn',
        userId: payload.userId,
      }
    : {
        type: 'NotLoggedIn',
      }
}

type IUser = {
  type: 'User'
  userId: string
}

const User = builder.objectRef<IUser>('User').implement({
  fields: t => ({
    userId: t.exposeString('userId'),
  }),
})

type ILoggedIn = {
  type: 'LoggedIn'
  user: IUser
}

const LoggedIn = builder.objectRef<ILoggedIn>('LoggedIn')
LoggedIn.implement({
  fields: t => ({ user: t.expose('user', { type: User }) }),
})

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
  user: IUser
}

const Registered = builder.objectRef<IRegistered>('Registered')

Registered.implement({
  fields: t => ({ user: t.expose('user', { type: User }) }),
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
    resolve: async (_, { email, password }, { res, prisma }) => {
      try {
        const user = await register(email, password, res, prisma)
        return {
          type: 'Registered',
          user: {
            userId: user.id,
          },
        } as IRegistered
      } catch {
        return {
          type: 'RegistrationError',
          message: 'Error logging in',
        } as IRegistrationError
      }
    },
  })
)

builder.mutationField('login', t =>
  t.field({
    type: LogInResponse,
    args: { email: t.arg.string({ required: true }), password: t.arg.string({ required: true }) },
    resolve: async (_, { email, password }, { res, prisma }) => {
      try {
        const user = await authenticate(email, password, res, prisma)
        return {
          type: 'LoggedIn',
          user: {
            userId: user.id,
          },
        } as ILoggedIn
      } catch {
        return {
          type: 'LogInError',
          message: 'Error logging in',
        } as ILogInError
      }
    },
  })
)
