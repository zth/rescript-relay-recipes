module Query = %relay(`
  query AppQuery {
    defaultCounter {
      ...Counter_counter
    }
  }
`)

module WithoutLoader = {
  @react.component
  let make = () => {
    let queryData = Query.use(~variables=(), ())

    switch queryData.defaultCounter {
    | None => React.null
    | Some(defaultCounter) => <Counter counter=defaultCounter.fragmentRefs />
    }
  }
}

@react.component
let make = () => {
  <div>
    <Session />
    <React.Suspense fallback={"Loading..."->React.string}>
      <WithoutLoader />
    </React.Suspense>
  </div>
}
