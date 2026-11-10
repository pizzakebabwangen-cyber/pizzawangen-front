import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { store } from './reduxTool/store.jsx'
import { Provider } from 'react-redux'
import { AvailabilityProvider } from "./context/AvailabilityContext.jsx";
import { MotionConfig } from "framer-motion";

/** Entspricht Vite `base` (z. B. `/site1/` → Router unter `/site1`). */
const routerBasename = (import.meta.env.BASE_URL || "/").replace(/\/$/, "") || "/";

// Build marker: aendert den Bundle-Hash (Cache-Busting).
window.__WANGEN_BUILD__ = "2026-11-10-r7";

ReactDOM.createRoot(document.getElementById("root")).render(


  <React.StrictMode>
    <BrowserRouter basename={routerBasename === "/" ? undefined : routerBasename}>
      <Provider store={store}>
        <AvailabilityProvider>
          <MotionConfig reducedMotion="user">
            <App />
          </MotionConfig>
        </AvailabilityProvider>
      </Provider>
    </BrowserRouter>
  </React.StrictMode >
);
