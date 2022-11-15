module Query = %relay(`
  query DefaultCounterQuery {
    defaultCounter @required(action: THROW) {
      ...Counter_counter
    }
  }
`)

@react.component
let make = () => {
  let queryData = Query.use(~variables=(), ())
  <Counter counter=queryData.defaultCounter.fragmentRefs />
}
