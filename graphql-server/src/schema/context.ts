import { IncomingMessage, ServerResponse } from 'http'
import { getSessionAndRefreshTokens, ISession } from './auth'
import { PrismaClient } from '@prisma/client'

export type Context = {
  req: IncomingMessage
  res: ServerResponse
  session: ISession
  prisma: PrismaClient
}

const prisma = new PrismaClient()

export const contextFactory = ({
  req,
  res,
}: {
  req: IncomingMessage
  res: ServerResponse
}): Context => {
  const session = getSessionAndRefreshTokens(req, res)

  return {
    req,
    res,
    session,
    prisma,
  }
}
