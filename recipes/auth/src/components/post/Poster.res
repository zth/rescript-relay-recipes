module Fragment = %relay(`
  fragment Poster_user on User {
    username @required(action: THROW)
  }
`)

@react.component
let make = (~poster as posterRef) => {
  let {username} = Fragment.use(posterRef)
  <strong> {username->React.string} </strong>
}
