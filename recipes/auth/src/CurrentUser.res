module Fragment = %relay(`
  fragment CurrentUser_user on User {
    email @required(action: THROW)
  }
`)

module LogOutMutation = %relay(`
  mutation CurrentUserLogOutMutation {
    logout {
      ... on LoggedOut {
        message
      }

    }
  }
`)

let invalidateStore = (store: RescriptRelay.RecordSourceSelectorProxy.t) => Js.log(store)
@val external reload: unit => unit = "window.location.reload"

@react.component
let make = (~user as userRef) => {
  let {email} = Fragment.use(userRef)
  let (logOut, _) = LogOutMutation.use()

  <div>
    {`Welcome back ${email}`->React.string}
    <button
      onClick={_ =>
        logOut(
          ~variables=(),
          ~updater=(store, _) => {
            invalidateStore(store)
            reload()
          },
          (),
        ) |> ignore}>
      {"Log out"->React.string}
    </button>
  </div>
}
