import { builder } from './builder'
import * as Context from './context'

import './auth'
import './counters'

builder.queryType()
builder.mutationType()

export const schema = builder.toSchema()

export const contextFactory = Context.contextFactory
