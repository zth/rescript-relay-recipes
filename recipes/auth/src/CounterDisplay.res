module Fragment = %relay(`
  fragment CounterDisplay_counter on Counter {
    label
    count
  }
`)

@react.component
let make = (~counter as counterRef) => {
  let counter = Fragment.use(counterRef)
  <div>
    {`${counter.label->Belt.Option.getWithDefault("Missing label")} : ${counter.count
      ->Belt.Option.map(Belt.Int.toString)
      ->Belt.Option.getWithDefault("Missing count")}`->React.string}
  </div>
}
