type poster = {
  name: string,
  profilePicture: Image.image,
}

@react.component
let make = (~poster=?) => {
  switch poster {
  | None => React.null
  | Some(poster) =>
    <div className="byline">
      <Image image={poster.profilePicture} width={"60"} height={"60"} className="byline__image" />
      <div className="byline__name"> {poster.name->React.string} </div>
    </div>
  }
}
