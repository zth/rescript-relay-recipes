module LoginMutation = %relay(`
  mutation UnauthenticatedUserLoginMutation($username: String!, $password: String!) {
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

@val external reload: unit => unit = "window.location.reload"

@react.component
let make = () => {
  let (login, loading) = LoginMutation.use()
  let (username, setUsername) = React.useState(() => "")
  let (password, setPassword) = React.useState(() => "")
  <div
    style={
      open ReactDOM
      Style.unsafeAddStyle(Style.make(~display="flex", ~alignItems="baseline", ()), {"gap": "8px"})
    }>
    <input
      placeholder="Username"
      value=username
      onChange={event => {
        let v = ReactEvent.Form.target(event)["value"]
        setUsername(_ => v)
      }}
    />
    <input
      placeholder="Password"
      type_="password"
      value=password
      onChange={event => {
        let v = ReactEvent.Form.target(event)["value"]
        setPassword(_ => v)
      }}
    />
    <button
      disabled={loading || username === "" || password === ""}
      onClick={_ =>
        login(
          ~variables={username: String.trim(username), password},
          ~updater=(store, {logIn}) => {
            switch logIn {
            | Some(#LoggedIn(_)) =>
              RescriptRelay.RecordSourceSelectorProxy.invalidateStore(store)
              reload()
            | Some(#LogInError(_))
            | Some(#UnselectedUnionMember(_))
            | None => ()
            }
          },
          (),
        )->ignore}>
      {"Log in"->React.string}
    </button>
  </div>
}
