@react.component
let make = () => {
  <div>
    <NavBar />
    <hr />
    <React.Suspense fallback={"Loading..."->React.string}>
      <ReactErrorBoundary _FallbackComponent={_ => "Something went wrong"->React.string}>
        <Routes />
      </ReactErrorBoundary>
    </React.Suspense>
  </div>
}
