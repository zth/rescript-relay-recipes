import { verify, sign, Secret, JwtPayload } from 'jsonwebtoken'
import { IncomingMessage, ServerResponse } from 'http'
import { PrismaClient, User } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

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
): Promise<
  | {
      type: 'UserNotFoundOrInvalidPassword'
    }
  | { type: 'Authenticated'; user: User }
> => {
  const user = await prisma.user.findFirst({ where: { username, password } })

  if (!user) {
    return {
      type: 'UserNotFoundOrInvalidPassword',
    }
  }

  await generateTokensAndSetCookies(user.id, res, prisma)

  return { type: 'Authenticated', user }
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

export type IAuthenticated = {
  type: 'Authenticated'
  userId: string
}

export type IUnauthenticated = {
  type: 'Unauthenticated'
}

export type ISession = IAuthenticated | IUnauthenticated
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

      return { type: 'Authenticated', userId: payload.userId }
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
    type: 'Unauthenticated',
  }
}
