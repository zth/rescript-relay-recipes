@react.component
let make = (~children, ~dim=false) => {
  <div className={"card" ++ (dim ? " dim" : "")}> {children} </div>
}
