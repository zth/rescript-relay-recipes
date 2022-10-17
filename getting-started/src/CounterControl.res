module Fragment = %relay(`
  fragment CounterControl_counter on Counter {
    id
  }
`)

module Increment = %relay(`
  mutation CounterControlIncrementMutation($id: ID!) {
    incrementCount(id: $id) {
      count
    }
  }
`)

module Decrement = %relay(`
  mutation CounterControlDecrementMutation($id: ID!) {
    decrementCount(id: $id) {
      count
    }
  }
`)

@react.component
let make = (~counter as counterRef) => {
  let counter = Fragment.use(counterRef)
  let (decrement, isDecrementPending) = Decrement.use()
  let (increment, isIncrementPending) = Increment.use()
  let isPending = isDecrementPending || isIncrementPending

  <div>
    <button onClick={_ => decrement(~variables={id: counter.id}, ())->ignore} disabled=isPending>
      {"Decrement"->React.string}
    </button>
    <button onClick={_ => increment(~variables={id: counter.id}, ())->ignore} disabled=isPending>
      {"Increment"->React.string}
    </button>
  </div>
}
