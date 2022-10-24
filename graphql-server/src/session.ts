export type User = {
  type: 'User'
  id: string
}

export type NotLoggedIn = {
  type: 'NotLoggedIn'
}

export type Session = User | NotLoggedIn

export const decodeJWT = (token: string | null): Session => {
  console.log(token)
  return { type: 'NotLoggedIn' }
}
