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

export const contextFactory = async ({
  req,
  res,
}: {
  req: IncomingMessage
  res: ServerResponse
}): Promise<Context> => {
  const session = await getSessionAndRefreshTokens(req, res, prisma)

  return {
    req,
    res,
    session,
    prisma,
  }
}
