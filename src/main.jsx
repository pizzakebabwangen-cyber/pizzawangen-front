import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { store } from './reduxTool/store.jsx'
import { Provider } from 'react-redux'
import { AvailabilityProvider } from "./context/AvailabilityContext.jsx";

/** Entspricht Vite `base` (z. B. `/site1/` → Router unter `/site1`). */
const routerBasename = (import.meta.env.BASE_URL || "/").replace(/\/$/, "") || "/";

/** Ordner …/index.html (IIS ohne SPA-Rewrite) auf die Tracking-Route legen. Query (?id=) bleibt. */
if (typeof window !== "undefined") {
  const path = window.location.pathname.replace(/\/index\.html$/i, "").replace(/\/+$/, "") || "/";
  if (
    (path === "/order-tracking" || path === "/bestellung-verfolgen") &&
    window.location.pathname !== path
  ) {
    window.history.replaceState(
      null,
      "",
      path + window.location.search + window.location.hash
    );
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(


  <React.StrictMode>
    <BrowserRouter basename={routerBasename === "/" ? undefined : routerBasename}>
      <Provider store={store}>
        <AvailabilityProvider>
          <App />
        </AvailabilityProvider>
      </Provider>
    </BrowserRouter>
  </React.StrictMode >
);
