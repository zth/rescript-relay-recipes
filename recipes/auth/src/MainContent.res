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
      <MyCounters />
    </div>
  | #Unauthorized(_) =>
    <div>
      <span> {"Please log in to see all your counters"->React.string} </span>
      <DefaultCounter />
    </div>
  | #UnselectedUnionMember(_) => ""->React.string
  }
}
