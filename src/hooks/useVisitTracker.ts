import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const VISITOR_KEY = "smelite_visitor_id";
const SESSION_KEY = "smelite_session_id";
const GEO_CACHE_KEY = "smelite_geo_v2";
const SESSION_TTL_MS = 30 * 60 * 1000;
const GEO_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

const genId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

const getVisitorId = () => {
  let id = localStorage.getItem(VISITOR_KEY);
  let isNew = false;
  if (!id) {
    id = genId();
    localStorage.setItem(VISITOR_KEY, id);
    isNew = true;
  }
  return { id, isNew };
};

const getSessionId = () => {
  const stored = sessionStorage.getItem(SESSION_KEY);
  const lastTouch = parseInt(sessionStorage.getItem(SESSION_KEY + "_t") || "0", 10);
  const now = Date.now();
  if (stored && now - lastTouch < SESSION_TTL_MS) {
    sessionStorage.setItem(SESSION_KEY + "_t", String(now));
    return stored;
  }
  const id = genId();
  sessionStorage.setItem(SESSION_KEY, id);
  sessionStorage.setItem(SESSION_KEY + "_t", String(now));
  return id;
};

const detectDevice = (): string => {
  const ua = navigator.userAgent.toLowerCase();
  if (/tablet|ipad|playbook|silk/.test(ua)) return "Tablet";
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/.test(ua)) return "Mobile";
  return "Desktop";
};

const detectBrowser = (): string => {
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\//.test(ua) || /Opera/.test(ua)) return "Opera";
  if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) return "Chrome";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Safari\//.test(ua)) return "Safari";
  return "Other";
};

const detectOS = (): string => {
  const ua = navigator.userAgent;
  if (/Windows/.test(ua)) return "Windows";
  if (/Android/.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
  if (/Mac OS X/.test(ua)) return "macOS";
  if (/Linux/.test(ua)) return "Linux";
  return "Other";
};

const detectReferrerSource = (referrer: string): string => {
  if (!referrer) return "Direct";
  try {
    const host = new URL(referrer).hostname.toLowerCase();
    if (host.includes("google.")) return "Google";
    if (host.includes("bing.")) return "Bing";
    if (host.includes("yahoo.")) return "Yahoo";
    if (host.includes("duckduckgo.")) return "DuckDuckGo";
    if (host.includes("facebook.") || host.includes("fb.")) return "Facebook";
    if (host.includes("instagram.")) return "Instagram";
    if (host.includes("twitter.") || host.includes("t.co") || host.includes("x.com")) return "Twitter/X";
    if (host.includes("youtube.")) return "YouTube";
    if (host.includes("tiktok.")) return "TikTok";
    if (host.includes("linkedin.")) return "LinkedIn";
    if (host.includes("whatsapp.")) return "WhatsApp";
    if (host.includes("telegram.") || host.includes("t.me")) return "Telegram";
    if (host.includes(window.location.hostname)) return "Internal";
    return host;
  } catch {
    return "Other";
  }
};

interface GeoData {
  country: string | null;
  country_code: string | null;
  city: string | null;
  region: string | null;
  timezone: string | null;
  ip: string | null;
  ts: number;
}

const fetchGeo = async (): Promise<GeoData> => {
  // Try cached
  try {
    const cached = JSON.parse(sessionStorage.getItem(GEO_CACHE_KEY) || "null") as GeoData | null;
    if (cached && Date.now() - cached.ts < GEO_TTL_MS) return cached;
  } catch {}

  const empty: GeoData = {
    country: null, country_code: null, city: null,
    region: null, timezone: null, ip: null, ts: Date.now(),
  };

  // Primary: ipwho.is (free, no key, HTTPS, CORS-enabled)
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch("https://ipwho.is/", { signal: ctrl.signal });
    clearTimeout(to);
    if (res.ok) {
      const j = await res.json();
      if (j && j.success !== false) {
        const geo: GeoData = {
          country: j.country || null,
          country_code: j.country_code || null,
          city: j.city || null,
          region: j.region || null,
          timezone: j.timezone?.id || null,
          ip: j.ip || null,
          ts: Date.now(),
        };
        sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify(geo));
        return geo;
      }
    }
  } catch {}

  // Fallback: country.is (country only)
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 3000);
    const res = await fetch("https://api.country.is/", { signal: ctrl.signal });
    clearTimeout(to);
    if (res.ok) {
      const j = await res.json();
      const geo: GeoData = {
        ...empty,
        country_code: j.country || null,
        ip: j.ip || null,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
        ts: Date.now(),
      };
      sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify(geo));
      return geo;
    }
  } catch {}

  return empty;
};

const idle = (cb: () => void) => {
  const run = () => {
    if (typeof (window as any).requestIdleCallback === "function") {
      (window as any).requestIdleCallback(cb, { timeout: 6000 });
    } else {
      setTimeout(cb, 4000);
    }
  };
  if (document.readyState === "complete") setTimeout(run, 2000);
  else window.addEventListener("load", () => setTimeout(run, 2000), { once: true });
};

export const useVisitTracker = () => {
  const location = useLocation();
  const lastTracked = useRef<string>("");
  const enterTime = useRef<number>(Date.now());
  const lastVisitId = useRef<string | null>(null);

  // Update previous visit's duration when navigating away
  useEffect(() => {
    const flushDuration = () => {
      if (!lastVisitId.current) return;
      const seconds = Math.round((Date.now() - enterTime.current) / 1000);
      if (seconds < 1 || seconds > 3600) return;
      const id = lastVisitId.current;
      supabase
        .from("page_visits")
        .update({ duration_seconds: seconds })
        .eq("id", id)
        .then(() => {}, () => {});
    };

    const onHide = () => flushDuration();
    window.addEventListener("beforeunload", onHide);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flushDuration();
    });
    return () => {
      flushDuration();
      window.removeEventListener("beforeunload", onHide);
    };
  }, []);

  useEffect(() => {
    if (location.pathname.startsWith("/admin") || location.pathname.startsWith("/auth")) return;
    const key = location.pathname + location.search;
    if (lastTracked.current === key) return;

    // Flush duration of previous page
    if (lastVisitId.current) {
      const seconds = Math.round((Date.now() - enterTime.current) / 1000);
      if (seconds >= 1 && seconds <= 3600) {
        const id = lastVisitId.current;
        supabase.from("page_visits").update({ duration_seconds: seconds }).eq("id", id).then(() => {}, () => {});
      }
    }

    lastTracked.current = key;
    enterTime.current = Date.now();

    const track = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const referrer = document.referrer || "";
        const { id: visitorId, isNew } = getVisitorId();
        const sessionId = getSessionId();
        const geo = await fetchGeo();

        const { data } = await supabase
          .from("page_visits")
          .insert({
            visitor_id: visitorId,
            session_id: sessionId,
            page_path: location.pathname,
            page_title: document.title,
            referrer: referrer || null,
            referrer_source: detectReferrerSource(referrer),
            country: geo.country,
            country_code: geo.country_code,
            city: geo.city,
            region: geo.region,
            timezone: geo.timezone,
            ip_address: geo.ip,
            device_type: detectDevice(),
            browser: detectBrowser(),
            os: detectOS(),
            language: navigator.language,
            user_agent: navigator.userAgent,
            screen_resolution: `${window.screen.width}x${window.screen.height}`,
            viewport_size: `${window.innerWidth}x${window.innerHeight}`,
            is_new_visitor: isNew,
            utm_source: params.get("utm_source"),
            utm_medium: params.get("utm_medium"),
            utm_campaign: params.get("utm_campaign"),
            utm_term: params.get("utm_term"),
            utm_content: params.get("utm_content"),
          })
          .select("id")
          .maybeSingle();

        lastVisitId.current = (data as any)?.id || null;
      } catch {
        // ignore
      }
    };

    idle(() => { track(); });
  }, [location.pathname, location.search]);
};
