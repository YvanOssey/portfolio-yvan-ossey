import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

// Les styles « sans JavaScript » (html:not(.js)) laissent place aux versions animées
document.documentElement.classList.add("js");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
