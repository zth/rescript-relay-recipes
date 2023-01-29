/* This is just a custom exception to indicate that something went wrong. */
exception Graphql_error(string)

let fetchFunction: RescriptRelay.Network.fetchFunctionPromise = (
  operation,
  variables,
  _cacheConfig,
  _uploadables,
) => {
  open Fetch

  let headers = HeadersInit.make({
    "content-type": "application/json",
    "accept": "application/json",
  })

  let body =
    Js.Dict.fromArray([("query", Js.Json.string(operation.text)), ("variables", variables)])
    ->Js.Json.object_
    ->Js.Json.stringify
    ->BodyInit.make

  let request = RequestInit.make(~method_=Post, ~headers, ~body, ())

  fetchWithInit("http://localhost:4000/graphql", request) |> Js.Promise.then_(response =>
    if Response.ok(response) {
      Response.json(response)
    } else {
      Js.Promise.reject(Graphql_error("Request failed: " ++ Response.statusText(response)))
    }
  )
}

let createEnvironment = () => {
  let network = RescriptRelay.Network.makePromiseBased(~fetchFunction, ())
  let store = RescriptRelay.Store.make(~source=RescriptRelay.RecordSource.make(), ())
  RescriptRelay.Environment.make(~network, ~store, ())
}
