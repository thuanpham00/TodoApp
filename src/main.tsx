import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element không tồn tại");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
