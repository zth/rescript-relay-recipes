import { verify, sign, Secret, JwtPayload } from 'jsonwebtoken'
import { IncomingMessage, ServerResponse } from 'http'
import { PrismaClient } from '@prisma/client'

const ACCESS_TOKEN_SECRET: Secret = 'whatever'
const REFRESH_TOKEN_SECRET: Secret = 'whateverelse'

declare module 'jsonwebtoken' {
  export interface JwtPayload {
    userId: string
  }
}

export type LoggedIn = {
  type: 'LoggedIn'
  userId: string
}

export type NotLoggedIn = {
  type: 'NotLoggedIn'
}

export const register = async (email: string, password: string, prisma: PrismaClient) =>
  prisma.user.create({ data: { email, password } })

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
  return { accessToken, refreshToken }
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

export type Session = LoggedIn | NotLoggedIn

export const getSessionAndRefreshTokens = (req: IncomingMessage, res: ServerResponse): Session => {
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
