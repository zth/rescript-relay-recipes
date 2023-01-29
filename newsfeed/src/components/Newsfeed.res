@react.component
let make = () => {
  let story: Story.story = {
    title: "Placeholder Story",
    summary: "Placeholder data, to be replaced with data fetched via GraphQL",
    poster: {
      name: "Placeholder Person",
      profilePicture: {
        url: "/assets/cat_avatar.png",
      },
    },
    thumbnail: {
      url: "/assets/placeholder.jpeg",
    },
  }

  <div className="newsfeed">
    <Story story={story} />
  </div>
}
