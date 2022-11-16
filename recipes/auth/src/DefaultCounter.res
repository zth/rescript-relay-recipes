module Query = %relay(`
  query DefaultCounterQuery {
    defaultCounter {
      ...Counter_counter
    }
  }
`)

@react.component
let make = () => {
  let queryData = Query.use(~variables=(), ())

  switch queryData {
  | {defaultCounter: None} => <div> {"No default counter"->React.string} </div>
  | {defaultCounter: Some(counter)} => <Counter counter=counter.fragmentRefs />
  }
}
