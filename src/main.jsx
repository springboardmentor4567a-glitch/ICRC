import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./ErrorBoundary";
import { AuthProvider } from "./authContext";
import "./index.css";
import "./themeManager.js";

let rootElement = document.getElementById("root");
if (!rootElement) {
  console.warn('Root element #root not found — creating fallback element.');
  rootElement = document.createElement("div");
  rootElement.id = "root";
  document.body.appendChild(rootElement);
}
const root = createRoot(rootElement);
root.render(
  <ErrorBoundary>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ErrorBoundary>
);


