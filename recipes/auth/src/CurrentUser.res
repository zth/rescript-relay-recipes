module Fragment = %relay(`
  fragment CurrentUser_user on User {
    username @required(action: THROW)
  }
`)

module LogOutMutation = %relay(`
  mutation CurrentUserLogOutMutation {
    logout {
      ... on LoggedOut {
        __typename
      }

    }
  }
`)

@val external reload: unit => unit = "window.location.reload"

@react.component
let make = (~user as userRef) => {
  let {username} = Fragment.use(userRef)
  let (logOut, _) = LogOutMutation.use()

  <div
    style={
      open ReactDOM.Style
      unsafeAddStyle(make(~display="flex", ~alignItems="baseline", ()), {"gap": "8px"})
    }>
    <span> {`Hello ${username}!`->React.string} </span>
    <button
      onClick={_ =>
        logOut(
          ~variables=(),
          ~updater=(store, _) => {
            RescriptRelay.RecordSourceSelectorProxy.invalidateStore(store)
            reload()
          },
          (),
        ) |> ignore}>
      {"Log out"->React.string}
    </button>
  </div>
}
