module LoginMutation = %relay(`
  mutation UnauthorizedUserLoginMutation($email: String!, $password: String!) {
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

let invalidateStore = (store: RescriptRelay.RecordSourceSelectorProxy.t) => Js.log(store)
@val external reload: unit => unit = "window.location.reload"

@react.component
let make = () => {
  let (login, loading) = LoginMutation.use()
  <button
    disabled=loading
    onClick={_ =>
      login(
        ~variables={email: "my@email.com", password: "myPassword"},
        ~updater=(store, _) => {
          invalidateStore(store)
          reload()
        },
        (),
      )->ignore}>
    {"Log in"->React.string}
  </button>
}
