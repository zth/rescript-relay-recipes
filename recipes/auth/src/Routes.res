@react.component
let make = () => {
  let url = RescriptReactRouter.useUrl()

  switch url.path {
  | list{} => <HomePage />
  | list{"post", id} => <PostPage id />
  | _ => "404"->React.string
  }
}
