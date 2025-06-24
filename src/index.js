import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./app/store";
import { AppProvider } from "@shopify/polaris";
const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    {/* <AppProvider i18n> */}
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
    {/* </AppProvider> */}
  </StrictMode>
);
