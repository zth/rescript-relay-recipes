module Query = %relay(`
  query HomePageQuery {
    session @required(action: THROW) {
      ... on Authenticated {
        __typename
      }
      ... on Unauthenticated {
        __typename
      }
    }
    ...AllPosts_query
  }
`)

@react.component
let make = () => {
  let data = Query.use(~variables=(), ())

  <>
    {switch data.session {
    | #Authenticated(_) => <CreateNewPost />
    | #Unauthenticated(_) => <span> {"Log in to create new posts"->React.string} </span>
    | #UnselectedUnionMember(_) => React.null
    }}
    <AllPosts posts=data.fragmentRefs />
  </>
}
