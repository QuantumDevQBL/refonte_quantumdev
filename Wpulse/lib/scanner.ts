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
