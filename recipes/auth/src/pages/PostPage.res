module Query = %relay(`
  query PostPageQuery($id: ID!) {
    node(id: $id) @required(action: THROW) {
      ... on Post {
        ...PostDetails_post
      }
    }
  }
`)

@react.component
let make = (~id) => {
  let {node} = Query.use(~variables={id: id}, ())

  <PostDetails post=node.fragmentRefs />
}
