module Query = %relay(`
    query NavBarSessionQuery {
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
  mutation NavBarLoginMutation($username: String!, $password: String!) {
    login(username: $username, password: $password) {
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
    | #LoggedIn(loggedIn) => <CurrentUser user=loggedIn.user.fragmentRefs />
    | #Unauthorized(_) | #UnselectedUnionMember(_) => <UnauthorizedUser />
    }}
  </div>
}
