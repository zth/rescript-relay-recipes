%%raw("import './style.css'")

// import App from "./components/App";
// import GraphiQL from "./components/playground/GraphiQL";

module Routes = {
  @react.component
  let make = () => {
    // if (window.location.pathname === "/playground") {
    //   return <GraphiQL />;
    // }
    <App />
  }
}

ReactDOMExperimental.renderConcurrentRootAtElementWithId(<Routes />, "app")
