const LEAD_LOG_URL =
  "https://script.google.com/macros/s/AKfycbzAOaAKQoP--rumJIHY8RjeQhzF1YfKPfGe9Mbz2h7Fqw3WMXG7TssXd1gvS6wMLHTfaA/exec";

const SOURCE_KEY = "airam_src";

/** Work out where the visitor came from, once per visit. */
export function rememberSource() {
  if (typeof window === "undefined") return;
  if (sessionStorage.getItem(SOURCE_KEY)) return;
  const q = new URLSearchParams(window.location.search);
  const utm = q.get("utm_source");
  let src = "Direct";
  if (q.get("gclid") || q.get("gad_source") || utm === "google_ads") src = "Google Ads";
  else if (utm) src = utm === "gbp" ? "Google Maps / Business Profile" : utm;
  else if (q.get("fbclid")) src = "Facebook / Instagram";
  else if (document.referrer) {
    const host = new URL(document.referrer).hostname;
    if (host.includes(window.location.hostname)) src = "Direct";
    else if (host.includes("google")) src = "Google Search";
    else if (host.includes("instagram")) src = "Instagram";
    else if (host.includes("facebook")) src = "Facebook";
    else src = host;
  }
  sessionStorage.setItem(SOURCE_KEY, src);
}

export function trackLead(action: string, extra: Record<string, string> = {}) {
  if (typeof window === "undefined") return;
  try {
    const g = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
    if (g) g("event", action.toLowerCase().replace(/\s+/g, "_"), { page_path: window.location.pathname });
    const payload = JSON.stringify({
      action,
      page: window.location.pathname,
      source: sessionStorage.getItem(SOURCE_KEY) || "Direct",
      device: /Mobi|Android|iPhone/i.test(navigator.userAgent) ? "Mobile" : "Desktop",
      ...extra,
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(LEAD_LOG_URL, new Blob([payload], { type: "text/plain" }));
    } else {
      fetch(LEAD_LOG_URL, { method: "POST", mode: "no-cors", body: payload, keepalive: true });
    }
  } catch {
    /* never block the customer */
  }
}
