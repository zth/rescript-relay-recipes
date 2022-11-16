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

  <>
    <DefaultCounter />
    <hr />
    {switch session {
    | #LoggedIn(_) => <MyCounters />
    | #Unauthorized(_) => <span> {"Log in to see your private counter"->React.string} </span>
    | #UnselectedUnionMember(_) => React.null
    }}
  </>
}
