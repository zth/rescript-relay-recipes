import { IncomingMessage, ServerResponse } from 'http'
import { getSessionAndRefreshTokens, ISession } from '../utils/auth'
import { prisma } from './builder'

export type Context = {
  req: IncomingMessage
  res: ServerResponse
  session: ISession
}

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
  }
}
