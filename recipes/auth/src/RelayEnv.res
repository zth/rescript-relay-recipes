/* This is just a custom exception to indicate that something went wrong. */
exception Graphql_error(string)

let executeRequest = (operationText, operationVariables) => {
  open Fetch

  let headers = HeadersInit.make({
    "content-type": "application/json",
    "accept": "application/json",
  })

  let body =
    Js.Dict.fromArray([("query", Js.Json.string(operationText)), ("variables", operationVariables)])
    ->Js.Json.object_
    ->Js.Json.stringify
    ->BodyInit.make

  let request = RequestInit.make(~method_=Post, ~headers, ~body, ~credentials=Include, ())

  fetchWithInit("http://localhost:4000/graphql", request) |> Js.Promise.then_(response =>
    if Response.ok(response) {
      Response.json(response)
    } else {
      Js.Promise.reject(Graphql_error("Request failed: " ++ Response.statusText(response)))
    }
  )
}

let network = RescriptRelay.Network.makePromiseBased(
  ~fetchFunction=(operation, variables, _cacheConfig, _uploadables) =>
    executeRequest(operation.text, variables),
  (),
)
let store = RescriptRelay.Store.make(~source=RescriptRelay.RecordSource.make(), ())

let environment = RescriptRelay.Environment.make(~network, ~store, ())
