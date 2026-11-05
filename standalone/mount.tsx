import { createRoot } from "react-dom/client";
import type { ComponentType } from "react";

export function mount(App: ComponentType) {
  const el = document.getElementById("root");
  if (el) createRoot(el).render(<App />);
}
