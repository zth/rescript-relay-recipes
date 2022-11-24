module Query = %relay(`
  query MainContentQuery {
    session @required(action: THROW) {
      ... on Authenticated {
        __typename
      }
      ... on Unauthenticated {
        __typename
      }
    }
    ...Posts_query
  }
`)

@react.component
let make = () => {
  let data = Query.use(~variables=(), ())

  <>
    {switch data.session {
    | #Authenticated(_) => <span> {"Authenticated"->React.string} </span>
    | #Unauthenticated(_) => <span> {"Log in to create new posts"->React.string} </span>
    | #UnselectedUnionMember(_) => React.null
    }}
    <Posts posts=data.fragmentRefs />
  </>
}
