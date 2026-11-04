"use client";

import { useEffect } from "react";
import { getLocalSettings, syncStoreSettings } from "@/lib/settings";

export function DynamicTitle() {
  useEffect(() => {
    const updateTitle = () => {
      try {
        const s = getLocalSettings();
        if (s.storeName && s.storeName.trim() !== "") {
          document.title = `${s.storeName.trim()} - Management`;
          return;
        }
        document.title = "Snack - Management";
      } catch {
        document.title = "Snack - Management";
      }
    };

    updateTitle();
    syncStoreSettings().then(updateTitle);

    window.addEventListener("cok_snack_settings_updated", updateTitle);
    window.addEventListener("storage", updateTitle);
    return () => {
      window.removeEventListener("cok_snack_settings_updated", updateTitle);
      window.removeEventListener("storage", updateTitle);
    };
  }, []);

  return null;
}
