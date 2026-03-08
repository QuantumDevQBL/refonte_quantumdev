export interface ScanResult {
  url: string;
  scannedAt: number;
  score: number;
  checks: {
    ssl: { valid: boolean; expiresIn?: number };
    wordpress: { detected: boolean; version?: string };
    pagespeed: {
      score?: number;
      fcp?: number;
      lcp?: number;
      status: "ok" | "warn" | "fail" | "untested";
    };
    securityHeaders: { present: string[]; missing: string[] };
    xmlrpc: {
      exposed: boolean;
      status: "exposed" | "blocked" | "not_found" | "untested";
    };
    loginPage: {
      exposed: boolean;
      status: "exposed" | "hidden" | "not_found" | "untested";
    };
    wpVersion: { exposed: boolean; version?: string };
  };
}

const TIMEOUT_MS = 8000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), ms)
    ),
  ]);
}

export async function checkSSL(url: string): Promise<ScanResult["checks"]["ssl"]> {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return { valid: false };

    const res = await withTimeout(
      fetch(url, { method: "HEAD", redirect: "follow" }),
      TIMEOUT_MS
    );
    return { valid: res.ok || res.status < 500 };
  } catch {
    return { valid: false };
  }
}

export async function checkWordPress(
  url: string
): Promise<ScanResult["checks"]["wordpress"]> {
  try {
    const res = await withTimeout(fetch(url, { redirect: "follow" }), TIMEOUT_MS);
    const html = await res.text();

    const generatorMatch = html.match(
      /<meta[^>]+name=["']generator["'][^>]+content=["']WordPress ([^"']+)["']/i
    );
    if (generatorMatch) {
      return { detected: true, version: generatorMatch[1] };
    }

    const isWP =
      html.includes("/wp-content/") ||
      html.includes("/wp-includes/");

    return { detected: isWP };
  } catch {
    return { detected: false };
  }
}

export async function checkPageSpeed(
  url: string
): Promise<ScanResult["checks"]["pagespeed"]> {
  try {
    const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile${apiKey ? `&key=${apiKey}` : ""}`;

    const res = await withTimeout(fetch(apiUrl), 15000);
    if (!res.ok) return { status: "untested" };

    const data = await res.json();
    const score = Math.round(
      (data.lighthouseResult?.categories?.performance?.score ?? 0) * 100
    );
    const audits = data.lighthouseResult?.audits ?? {};
    const fcp = audits["first-contentful-paint"]?.numericValue;
    const lcp = audits["largest-contentful-paint"]?.numericValue;

    const status: ScanResult["checks"]["pagespeed"]["status"] =
      score >= 75 ? "ok" : score >= 50 ? "warn" : "fail";

    return { score, fcp, lcp, status };
  } catch {
    return { status: "untested" };
  }
}
