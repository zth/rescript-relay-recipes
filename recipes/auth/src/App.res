@react.component
let make = () => {
  <div>
    <NavBar />
    <hr />
    <React.Suspense fallback={"Loading..."->React.string}>
      <Routes />
    </React.Suspense>
  </div>
}
