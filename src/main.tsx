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

// Đồng bộ theme-color với theme hiện tại (cho status bar trên Android).
const THEME_COLORS = {
  light: "#f4f4f6",
  dark: "#0f172a",
};

function syncThemeColor() {
  const isDark = document.documentElement.classList.contains("dark");
  const color = isDark ? THEME_COLORS.dark : THEME_COLORS.light;
  let meta = document.querySelector('meta[name="theme-color"]:not([media])');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", color);
}

syncThemeColor();
const observer = new MutationObserver(syncThemeColor);
observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["class"],
});

// Đăng ký Service Worker cho PWA (iOS 16.4+ sẽ nhận diện app riêng)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw-v2.js")
      .then((reg) => console.log("[PWA] Service Worker registered:", reg.scope))
      .catch((err) => console.warn("[PWA] SW registration failed:", err));
  });
}

