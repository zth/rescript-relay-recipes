type story = {
  title: string,
  summary: string,
  thumbnail: Image.image,
  poster: PosterByline.poster,
}

@react.component
let make = (~story) => {
  <Card>
    <PosterByline poster={story.poster} />
    <Heading> {story.title->React.string} </Heading>
    <Image image={story.thumbnail} width={"400"} height={"400"} />
    <StorySummary summary={story.summary} />
  </Card>
}
