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
  mutation AppLoginMutation {
    login(userId: 5, password: 5) {
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
  <div>
    <React.Suspense fallback={"Loading..."->React.string}>
      <WithoutLoader />
    </React.Suspense>
  </div>
}
