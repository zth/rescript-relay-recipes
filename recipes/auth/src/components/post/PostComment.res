module Fragment = %relay(`
  fragment PostComment_comment on Comment {
    content @required(action: THROW)
    commenter @required(action: THROW) {
      ...Poster_user
    }
  }
`)

@react.component
let make = (~comment as commentRef) => {
  let comment = Fragment.use(commentRef)

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
    <Poster poster=comment.commenter.fragmentRefs />
    <span> {comment.content->React.string} </span>
  </div>
}
