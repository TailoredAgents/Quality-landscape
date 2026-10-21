"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { stored, store, remove } from "@/lib/browser-storage";
import { publicPaths, safeCampaign } from "@/lib/analytics-settings";

type PrivacyNavigator = Navigator & { globalPrivacyControl?: boolean };
let pausedInMemory = false;
function privacySignal() {
  return (
    navigator.doNotTrack === "1" ||
    (navigator as PrivacyNavigator).globalPrivacyControl === true
  );
}
function paused() {
  return pausedInMemory || stored("quality-analytics-disabled") === "1";
}
function clearLegacyIdentifiers() {
  // Preserve earlier opt-outs while retiring the former visitor/session tracking.
  if (stored("quality-analytics-consent") === "declined") {
    pausedInMemory = true;
    store("quality-analytics-disabled", "1");
  }
  remove("quality-visitor");
  remove("quality-visit", "sessionStorage");
  remove("quality-analytics-consent");
}

export function PrivacyPreferences() {
  const [choice, setChoice] = useState("Checking your preference…");
  const [blocked, setBlocked] = useState(false);
  useEffect(() => {
    const sync = () => {
      clearLegacyIdentifiers();
      setBlocked(privacySignal());
      setChoice(
        privacySignal()
          ? "Paused by your browser privacy setting"
          : paused()
            ? "Paused in this browser"
            : "Basic statistics enabled",
      );
    };
    queueMicrotask(sync);
    window.addEventListener("quality-analytics-preference", sync);
    return () =>
      window.removeEventListener("quality-analytics-preference", sync);
  }, []);
  function change(disabled: boolean) {
    pausedInMemory = disabled;
    if (disabled) store("quality-analytics-disabled", "1");
    else remove("quality-analytics-disabled");
    window.dispatchEvent(new Event("quality-analytics-preference"));
  }
  return (
    <div className="privacy-preferences">
      <p role="status">
        Current choice: <strong>{choice}</strong>
      </p>
      <div className="button-row">
        <button
          className="button"
          disabled={blocked}
          onClick={() => change(false)}
        >
          Enable basic statistics
        </button>
        <button className="button button-light" onClick={() => change(true)}>
          Pause basic statistics
        </button>
      </div>
    </div>
  );
}

export function Analytics({ preview }: { preview: boolean }) {
  const path = usePathname();
  const lastPath = useRef<string | null>(null);
  useEffect(() => {
    clearLegacyIdentifiers();
    const record = () => {
      if (
        preview ||
        privacySignal() ||
        paused() ||
        !publicPaths.includes(path) ||
        lastPath.current === path
      )
        return;
      lastPath.current = path;
      const url = new URL(location.href);
      let referrer = "";
      try {
        const referral = new URL(document.referrer);
        if (
          ["https:", "http:"].includes(referral.protocol) &&
          referral.origin !== location.origin
        )
          referrer = referral.origin;
      } catch {}
      fetch("/api/analytics", {
        method: "POST",
        credentials: "omit",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "pageview",
          path,
          referrer,
          utmSource: safeCampaign(
            url.searchParams.get("utm_source") || "",
          ).slice(0, 80),
          utmMedium: safeCampaign(
            url.searchParams.get("utm_medium") || "",
          ).slice(0, 80),
          utmCampaign: safeCampaign(url.searchParams.get("utm_campaign") || ""),
          device:
            innerWidth < 600
              ? "mobile"
              : innerWidth < 1000
                ? "tablet"
                : "desktop",
        }),
        keepalive: true,
      }).catch(() => {});
    };
    record();
    window.addEventListener("quality-analytics-preference", record);
    return () =>
      window.removeEventListener("quality-analytics-preference", record);
  }, [path, preview]);
  return null;
}
