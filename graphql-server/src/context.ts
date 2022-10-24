import { IncomingMessage, ServerResponse } from 'http'
import { getSessionAndRefreshTokens, Session } from './auth'
import { PrismaClient } from '@prisma/client'

export type Context = {
  req: IncomingMessage
  res: ServerResponse
  session: Session
  prisma: PrismaClient
}

const prisma = new PrismaClient()

export const makeContext = ({
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
