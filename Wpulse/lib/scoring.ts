import type { ScanResult } from "./scanner";

export function calculateScore(checks: ScanResult["checks"]): number {
  let score = 100;

  if (!checks.ssl.valid) score -= 20;

  if (checks.pagespeed.score !== undefined) {
    if (checks.pagespeed.score < 50) score -= 20;
    else if (checks.pagespeed.score < 75) score -= 10;
  }

  if (checks.xmlrpc.exposed) score -= 15;
  if (checks.loginPage.exposed) score -= 10;
  if (checks.wpVersion.exposed) score -= 10;

  const missingHeaders = checks.securityHeaders.missing.length;
  score -= Math.min(missingHeaders * 5, 25);

  return Math.max(0, score);
}
