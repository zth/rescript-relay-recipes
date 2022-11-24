module Fragment = %relay(`
  fragment PostTitle_post on Post {
    title @required(action: THROW)
  }
`)

@react.component
let make = (~post) => {
  let {title} = Fragment.use(post)

  <span> {title->React.string} </span>
}
