"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // ponytail: installability is a nice-to-have, not core app
        // functionality -- a failed registration shouldn't be user-visible.
      });
    }
  }, []);

  return null;
}
