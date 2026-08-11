import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import "./styles.css";

const router = getRouter();

const rootElement = document.getElementById("app")!;
if (!rootElement.innerHTML) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}

// Fix for Radix UI lingering pointer-events: none bug during Vite HMR
if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', () => {
    if (document.body.style.pointerEvents === 'none') {
      document.body.style.pointerEvents = 'auto';
    }
    document.body.style.removeProperty('overflow');
    document.body.removeAttribute('data-scroll-locked');
  });
}

