"use client";

import { useEffect } from "react";

export function DynamicTitle() {
  useEffect(() => {
    const updateTitle = () => {
      try {
        const saved = localStorage.getItem("cok_snack_settings");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.storeName && parsed.storeName.trim() !== "") {
            document.title = `${parsed.storeName.trim()} - Management`;
            return;
          }
        }
        document.title = "Snack - Management";
      } catch {
        document.title = "Snack - Management";
      }
    };

    updateTitle();
    window.addEventListener("cok_snack_settings_updated", updateTitle);
    window.addEventListener("storage", updateTitle);
    return () => {
      window.removeEventListener("cok_snack_settings_updated", updateTitle);
      window.removeEventListener("storage", updateTitle);
    };
  }, []);

  return null;
}
