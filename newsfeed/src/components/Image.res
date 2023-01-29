type image = {url: string}

@react.component
let make = (~image=?, ~width=?, ~height=?, ~className=?) => {
  switch image {
  | None => React.null
  | Some(image) =>
    <img key={image.url} src={image.url} width=?{width} height=?{height} className=?{className} />
  }
}
