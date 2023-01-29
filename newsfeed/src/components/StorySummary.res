@react.component
let make = (~summary: string) => {
  <div className="story__summary">
    <p> {summary->React.string} </p>
  </div>
}
