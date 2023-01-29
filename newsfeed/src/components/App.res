@react.component
let make = () =>
  <RelayEnvironment>
    <React.Suspense fallback={<LoadingSpinner />}>
      <div className="app">
        <Newsfeed />
      </div>
    </React.Suspense>
  </RelayEnvironment>
