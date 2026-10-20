"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { stored, store, remove, storedJson } from "@/lib/browser-storage";
type PrivacyNavigator = Navigator & { globalPrivacyControl?: boolean };
function signal() {
  return (
    navigator.doNotTrack === "1" ||
    (navigator as PrivacyNavigator).globalPrivacyControl === true
  );
}
function clearIdentifiers() {
  remove("quality-visitor");
  remove("quality-visit", "sessionStorage");
}
function setPreference(value: string) {
  store("quality-analytics-consent", value);
  if (value !== "accepted") clearIdentifiers();
  window.dispatchEvent(new Event("quality-consent"));
}
export function PrivacyPreferences() {
  const [choice, setChoice] = useState("");
  useEffect(() => {
    queueMicrotask(() =>
      setChoice(stored("quality-analytics-consent") || "not chosen"),
    );
  }, []);
  return (
    <div className="privacy-preferences">
      <p>
        Current choice: <strong>{choice}</strong>
      </p>
      <div className="button-row">
        <button
          className="button"
          onClick={() => {
            setPreference("accepted");
            setChoice(
              signal() ? "blocked by browser privacy signal" : "accepted",
            );
          }}
        >
          Allow analytics
        </button>
        <button
          className="button button-light"
          onClick={() => {
            setPreference("declined");
            setChoice("declined");
          }}
        >
          Decline analytics
        </button>
      </div>
    </div>
  );
}
export function AnalyticsConsent({ preview }: { preview: boolean }) {
  const path = usePathname();
  const [show, setShow] = useState(false);
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    const sync = () => {
      const current = stored("quality-analytics-consent");
      setShow(!preview && !current && !signal());
      setAllowed(!preview && current === "accepted" && !signal());
      if (signal()) clearIdentifiers();
    };
    sync();
    window.addEventListener("quality-consent", sync);
    return () => window.removeEventListener("quality-consent", sync);
  }, [preview]);
  useEffect(() => {
    if (!allowed) return;
    let visitor = storedJson<{ id: string; expires: number }>(
      "quality-visitor",
    );
    if (!visitor?.id || visitor.expires < Date.now()) {
      visitor = {
        id: crypto.randomUUID(),
        expires: Date.now() + 90 * 86400000,
      };
      store("quality-visitor", JSON.stringify(visitor));
    }
    let visit = storedJson<{ id: string; updated: number }>(
      "quality-visit",
      "sessionStorage",
    );
    if (!visit || Date.now() - visit.updated > 30 * 60 * 1000) {
      visit = { id: crypto.randomUUID(), updated: Date.now() };
    } else {
      visit.updated = Date.now();
    }
    store("quality-visit", JSON.stringify(visit), "sessionStorage");
    const url = new URL(location.href);
    const payload = {
      kind: "pageview",
      consent: "accepted",
      path,
      visitor: visitor.id,
      session: visit.id,
      referrer: document.referrer,
      utmSource: url.searchParams.get("utm_source") || "",
      utmMedium: url.searchParams.get("utm_medium") || "",
      utmCampaign: url.searchParams.get("utm_campaign") || "",
      device:
        innerWidth < 600 ? "mobile" : innerWidth < 1000 ? "tablet" : "desktop",
    };
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
    const start = Date.now();
    let engagementSent = false;
    const engage = () => {
      if (
        !engagementSent &&
        stored("quality-analytics-consent") === "accepted" &&
        !signal()
      ) {
        engagementSent = true;
        fetch("/api/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            kind: "engagement",
            duration: Math.min(1800, Math.round((Date.now() - start) / 1000)),
          }),
          keepalive: true,
        }).catch(() => {});
      }
    };
    const visibility = () => {
      if (document.visibilityState === "hidden") engage();
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      engage();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [path, allowed]);
  if (!show) return null;
  return (
    <aside className="consent-banner" aria-label="Analytics preferences">
      <div>
        <strong>A little insight, with your permission.</strong>
        <p>
          Allow anonymous first-party analytics to help us understand site use.{" "}
          <Link href="/privacy">Privacy details</Link>
        </p>
      </div>
      <button
        className="button button-light"
        onClick={() => setPreference("declined")}
      >
        Decline
      </button>
      <button className="button" onClick={() => setPreference("accepted")}>
        Allow analytics
      </button>
    </aside>
  );
}
