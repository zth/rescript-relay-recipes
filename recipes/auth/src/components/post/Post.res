module Fragment = %relay(`
  fragment Post_post on Post {
    id
    ...PostTitle_post
    comments @required(action: THROW) {
      edges {
        cursor
        comment: node @required(action: THROW) {
          ...PostComment_comment
        }
      }
    }
    poster @required(action: THROW) {
      ...Poster_user
    }
  }
`)

@react.component
let make = (~post as postRef) => {
  let post = Fragment.use(postRef)
  let edges = post.comments.edges->Belt.Array.keepMap(x => x)

  <div
    style={
      open ReactDOM.Style
      let safeStyle = make(
        ~display="flex",
        ~flexDirection="column",
        ~alignItems="baseline",
        ~border="1px solid black",
        ~padding="4px",
        (),
      )
      unsafeAddStyle(safeStyle, {"gap": "4px"})
    }>
    <Poster poster=post.poster.fragmentRefs />
    <PostTitle post=post.fragmentRefs />
    {edges
    ->Belt.Array.map(({cursor, comment}) => <PostComment key=cursor comment=comment.fragmentRefs />)
    ->React.array}
  </div>
}
