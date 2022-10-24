module Query = %relay(`
  query AppQuery {
    defaultCounter {
      ...Counter_counter
    }
  }
`)

module WithoutLoader = {
  @react.component
  let make = () => {
    let queryData = Query.use(~variables=(), ())

    switch queryData.defaultCounter {
    | None => React.null
    | Some(defaultCounter) => <Counter counter=defaultCounter.fragmentRefs />
    }
  }
}

module LoginMutation = %relay(`
  mutation AppLoginMutation($email: String!, $password: String!) {
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

@react.component
let make = () => {
  let (login, loading) = LoginMutation.use()

  <div>
    <React.Suspense fallback={"Loading..."->React.string}>
      <WithoutLoader />
    </React.Suspense>
    <button
      disabled=loading
      onClick={_ => login(~variables={email: "my@email.com", password: "myPassword"}, ())->ignore}>
      {"Log in"->React.string}
    </button>
  </div>
}
