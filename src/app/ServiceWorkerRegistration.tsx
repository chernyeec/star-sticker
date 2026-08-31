"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        // ponytail: installability is a nice-to-have, not core app
        // functionality -- a failed registration shouldn't be user-visible,
        // but it's still worth a console trace for whoever's debugging.
        console.error("Service worker registration failed", err);
      });
    }
  }, []);

  return null;
}
