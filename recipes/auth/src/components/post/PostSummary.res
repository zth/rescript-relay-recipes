module Fragment = %relay(`
  fragment PostSummary_post on Post {
    id
    ...PostTitle_post
    poster @required(action: THROW) {
      ...Poster_user
    }
  }
`)

@react.component
let make = (~post as postRef, ~onSelectPost) => {
  let post = Fragment.use(postRef)

  <div
    onClick={_ => onSelectPost(post.id)}
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
  </div>
}
