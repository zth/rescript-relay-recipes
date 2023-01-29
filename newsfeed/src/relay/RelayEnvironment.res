@react.component
let make = (~children) => {
  let environment = React.useMemo(() => {
    Environment.createEnvironment()
  })

  <RescriptRelay.Context.Provider environment={environment}>
    {children}
  </RescriptRelay.Context.Provider>
}
