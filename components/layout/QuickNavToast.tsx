"use client";

import { useTheme } from "@/context/use-theme";
import { useEffect, useState } from "react";

const STORAGE_KEY = "jazbah_quick_nav_toast_shown";

export default function QuickNavToast() {
  const { deviceType, pageLoaded } = useTheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (deviceType !== "desktop") return;
    if (!pageLoaded) return;

    let shown = false;
    try {
      shown = localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      shown = false;
    }
    if (shown) return;

    const showTimer = window.setTimeout(() => {
      setVisible(true);
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // ignore
      }
    }, 2500);

    const hideTimer = window.setTimeout(() => {
      setVisible(false);
    }, 2500 + 6000);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [deviceType, pageLoaded]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[9999] max-w-[320px] rounded-lg border border-white/10 bg-[#010208]/90 px-4 py-3 text-white shadow-2xl backdrop-blur-md"
      style={{ borderLeft: "3px solid #0075c7" }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="text-sm font-semibold leading-tight">
            Hold <kbd className="mx-1 rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">Ctrl</kbd> to quick navigate
          </p>
          <p className="mt-1 text-xs text-white/60">
            Use arrow keys to switch pages, then release.
          </p>
        </div>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => setVisible(false)}
          className="shrink-0 text-white/50 transition-colors hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
