module Query = %relay(`
    query SessionQuery {
      session @required(action: THROW) {
        ... on LoggedIn {
          user @required(action: THROW) {
            ...CurrentUser_user
          }
        }
        ... on Unauthorized {
          __typename
        }
      }
    }
  `)

module LoginMutation = %relay(`
  mutation SessionLoginMutation($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      ... on LoggedIn {
        __typename
      }
      ... on LogInError {
        message
      }
    }
  }
`)

module LogOutMutation = %relay(`
  mutation SessionLogOutMutation {
    logout {
      ... on LoggedOut {
        __typename
      }
    }
  }
`)

@react.component
let make = () => {
  let {session} = Query.use(~variables=(), ())

  switch session {
  | #LoggedIn(loggedIn) => <CurrentUser user=loggedIn.user.fragmentRefs />
  | #Unauthorized(_) | #UnselectedUnionMember(_) => <UnauthorizedUser />
  }
}
