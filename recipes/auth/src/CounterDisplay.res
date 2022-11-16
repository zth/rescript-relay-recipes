module Fragment = %relay(`
  fragment CounterDisplay_counter on Counter {
    label @required(action: THROW)
    count @required(action: THROW)
  }
`)

@react.component
let make = (~counter as counterRef) => {
  let counter = Fragment.use(counterRef)
  <div
    style={
      open ReactDOM.Style
      unsafeAddStyle(make(~display="flex", ~alignItems="baseline", ()), {"gap": "4px"})
    }>
    <span>
      <strong> {counter.label->React.string} </strong>
    </span>
    <span> {counter.count->Belt.Int.toString->React.string} </span>
  </div>
}
