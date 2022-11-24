module Query = %relay(`
    query NavBarSessionQuery {
      session @required(action: THROW) {
        ... on Authenticated {
          user @required(action: THROW) {
            ...AuthenticatedUser_user
          }
        }
        ... on Unauthenticated {
          __typename
        }
      }
    }
  `)

module LoginMutation = %relay(`
  mutation NavBarLoginMutation($username: String!, $password: String!) {
    logIn(username: $username, password: $password) {
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
  mutation NavBarLogOutMutation {
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
  <div style={ReactDOM.Style.make(~display="flex", ~flexDirection="row-reverse", ())}>
    {switch session {
    | #Authenticated(loggedIn) => <AuthenticatedUser user=loggedIn.user.fragmentRefs />
    | #Unauthenticated(_) | #UnselectedUnionMember(_) => <UnauthenticatedUser />
    }}
  </div>
}
