module CreateNewPostMutation = %relay(`
  mutation CreateNewPostMutation($input: CreatePostInput!) {
    createPost(input: $input) {
      ... on PostCreated {
        post {
          id
          content
          title
        }
      }
      ... on CreatePostError {
        message
      }
    }
  }
`)

@react.component
let make = () => {
  let (createNewPost, loading) = CreateNewPostMutation.use()
  let (title, setTitle) = React.useState(() => "")
  let (content, setContent) = React.useState(() => "")
  <div
    style={
      open ReactDOM
      Style.unsafeAddStyle(Style.make(~display="flex", ~alignItems="baseline", ()), {"gap": "8px"})
    }>
    <input
      placeholder="Title"
      value=title
      onChange={event => {
        let v = ReactEvent.Form.target(event)["value"]
        setTitle(_ => v)
      }}
    />
    <textarea
      value=content
      onChange={event => {
        let v = ReactEvent.Form.target(event)["value"]
        setContent(_ => v)
      }}
    />
    <button
      disabled={loading || String.trim(title) === "" || String.trim(content) === ""}
      onClick={_ =>
        createNewPost(
          ~variables={input: {title: String.trim(title), content: String.trim(content)}},
          ~onCompleted=({createPost}, _errors) => {
            switch createPost {
            | Some(#PostCreated({post})) => Js.log2("created", post)
            | Some(#CreatePostError(_)) | Some(#UnselectedUnionMember(_)) | None => Js.log("error")
            }
          },
          (),
        )->ignore}>
      {"Create"->React.string}
    </button>
  </div>
}
