module Query = %relay(`
  query SelectedPostQuery($id: ID!) {
    node(id: $id) @required(action: THROW) {
      ... on Post {
        ...Post_post
      }
    }
  }
`)

@react.component
let make = (~id) => {
  let {node} = Query.use(~variables={id: id}, ())

  <Post post=node.fragmentRefs />
}
