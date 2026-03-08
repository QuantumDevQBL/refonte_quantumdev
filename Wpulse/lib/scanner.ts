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

const SECURITY_HEADERS = [
  "x-frame-options",
  "content-security-policy",
  "x-content-type-options",
  "strict-transport-security",
  "referrer-policy",
  "permissions-policy",
];

export async function checkSecurityHeaders(
  url: string
): Promise<ScanResult["checks"]["securityHeaders"]> {
  try {
    const res = await withTimeout(
      fetch(url, { method: "HEAD", redirect: "follow" }),
      TIMEOUT_MS
    );
    const present: string[] = [];
    const missing: string[] = [];

    for (const header of SECURITY_HEADERS) {
      if (res.headers.get(header)) {
        present.push(header);
      } else {
        missing.push(header);
      }
    }
    return { present, missing };
  } catch {
    return { present: [], missing: [...SECURITY_HEADERS] };
  }
}

export async function checkXmlRpc(
  url: string
): Promise<ScanResult["checks"]["xmlrpc"]> {
  try {
    const xmlrpcUrl = new URL("/xmlrpc.php", url).toString();
    const res = await withTimeout(
      fetch(xmlrpcUrl, { method: "POST" }),
      TIMEOUT_MS
    );
    const text = await res.text();
    if (
      res.status === 200 &&
      text.includes("XML-RPC server accepts POST requests only")
    ) {
      return { exposed: true, status: "exposed" };
    }
    return { exposed: false, status: "blocked" };
  } catch {
    return { exposed: false, status: "not_found" };
  }
}

export async function checkLoginPage(
  url: string
): Promise<ScanResult["checks"]["loginPage"]> {
  try {
    const loginUrl = new URL("/wp-login.php", url).toString();
    const res = await withTimeout(
      fetch(loginUrl, { redirect: "follow" }),
      TIMEOUT_MS
    );
    const text = await res.text();
    const isLoginPage =
      text.includes("wp-login") ||
      text.includes("user_login") ||
      text.includes("loginform");

    if (res.ok && isLoginPage) {
      return { exposed: true, status: "exposed" };
    }
    return { exposed: false, status: "hidden" };
  } catch {
    return { exposed: false, status: "not_found" };
  }
}

export async function checkWpVersion(
  html: string
): Promise<ScanResult["checks"]["wpVersion"]> {
  const generatorMatch = html.match(
    /<meta[^>]+name=["']generator["'][^>]+content=["']WordPress ([^"']+)["']/i
  );
  if (generatorMatch) {
    return { exposed: true, version: generatorMatch[1] };
  }

  const verMatch = html.match(/\?ver=(\d+\.\d+[\.\d]*)/);
  if (verMatch) {
    return { exposed: true, version: verMatch[1] };
  }

  return { exposed: false };
}

export async function runScan(url: string): Promise<Omit<ScanResult, "score">> {
  // Fetch HTML once, share across checks that need it
  let html = "";
  try {
    const res = await withTimeout(fetch(url, { redirect: "follow" }), TIMEOUT_MS);
    html = await res.text();
  } catch {
    // html stays empty, individual checks handle gracefully
  }

  const results = await Promise.allSettled([
    checkSSL(url),
    checkWordPress(url),
    checkPageSpeed(url),
    checkSecurityHeaders(url),
    checkXmlRpc(url),
    checkLoginPage(url),
    checkWpVersion(html),
  ]);

  const [ssl, wordpress, pagespeed, securityHeaders, xmlrpc, loginPage, wpVersion] = results;

  return {
    url,
    scannedAt: Date.now(),
    checks: {
      ssl: ssl.status === "fulfilled" ? ssl.value : { valid: false },
      wordpress:
        wordpress.status === "fulfilled"
          ? wordpress.value
          : { detected: false },
      pagespeed:
        pagespeed.status === "fulfilled"
          ? pagespeed.value
          : { status: "untested" },
      securityHeaders:
        securityHeaders.status === "fulfilled"
          ? securityHeaders.value
          : { present: [], missing: [...SECURITY_HEADERS] },
      xmlrpc:
        xmlrpc.status === "fulfilled"
          ? xmlrpc.value
          : { exposed: false, status: "untested" },
      loginPage:
        loginPage.status === "fulfilled"
          ? loginPage.value
          : { exposed: false, status: "untested" },
      wpVersion:
        wpVersion.status === "fulfilled" ? wpVersion.value : { exposed: false },
    },
  };
}
