ReactDOMExperimental.renderConcurrentRootAtElementWithId(
  <ReactErrorBoundary _FallbackComponent={_ => "Something went wrong"->React.string}>
    <RescriptRelay.Context.Provider environment=RelayEnv.environment>
      <App />
    </RescriptRelay.Context.Provider>
  </ReactErrorBoundary>,
  "app",
)
