module Query = %relay(`
  query MainContentQuery {
    session @required(action: THROW) {
      ... on LoggedIn {
        __typename
      }
      ... on Unauthorized {
        __typename
      }
    }
  }
`)

@react.component
let make = () => {
  let {session} = Query.use(~variables=(), ())

  switch session {
  | #LoggedIn(_) =>
    <div>
      <DefaultCounter />
      <hr />
      <MyCounters />
    </div>
  | #Unauthorized(_) =>
    <div>
      <DefaultCounter />
      <hr />
      <span> {"Please log in to see all your counters"->React.string} </span>
    </div>
  | #UnselectedUnionMember(_) => ""->React.string
  }
}
