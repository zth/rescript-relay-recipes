module Fragment = %relay(`
  fragment AllPosts_query on Query {
    posts @required(action: THROW) {
      edges {
        cursor
        post: node @required(action: THROW) {
          ...PostSummary_post
        }
      }
    }
  }
`)

@react.component
let make = (~posts as postsRef) => {
  let {posts: {edges}} = Fragment.use(postsRef)
  let edges = edges->Belt.Array.keepMap(x => x)

  <div
    style={
      open ReactDOM.Style
      let safeStyle = make(
        ~display="flex",
        ~flexDirection="column",
        ~border="1px solid black",
        ~padding="4px",
        (),
      )
      unsafeAddStyle(safeStyle, {"gap": "4px"})
    }>
    {edges
    ->Belt.Array.map(({cursor, post}) =>
      <PostSummary
        key=cursor
        post=post.fragmentRefs
        onSelectPost={id => RescriptReactRouter.push(`/post/${id}`)}
      />
    )
    ->React.array}
  </div>
}
