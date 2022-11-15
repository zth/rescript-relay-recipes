module Fragment = %relay(`
  fragment Counter_counter on Counter {
    ...CounterDisplay_counter
    ...CounterControl_counter
  }
`)

@react.component
let make = (~counter as counterRef) => {
  let counter = Fragment.use(counterRef)

  <div style={ReactDOM.Style.make(~borderBottom="1px solid black", ~padding="4px", ())}>
    <CounterDisplay counter=counter.fragmentRefs />
    <CounterControl counter=counter.fragmentRefs />
  </div>
}
