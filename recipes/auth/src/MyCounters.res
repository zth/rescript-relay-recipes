module Query = %relay(`
  query MyCountersQuery {
    myCounter {
      ...Counter_counter
    }
  }
`)

@react.component
let make = () => {
  let {myCounter} = Query.use(~variables=(), ())

  switch myCounter {
  | None => React.null
  | Some(counter) => <Counter counter=counter.fragmentRefs />
  }
}
