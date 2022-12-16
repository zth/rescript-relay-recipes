type props = {error: Js.Exn.t}

@module("react-error-boundary") @react.component
external make: (
  ~_FallbackComponent: React.component<props>,
  ~children: React.element,
) => React.element = "ErrorBoundary"
