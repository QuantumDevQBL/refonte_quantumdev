import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { runScan } from "@/lib/scanner";
import { calculateScore } from "@/lib/scoring";
import { setCache } from "@/lib/cache";

// Rate limiting: Map<ip, { count, resetAt }>
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT) return true;

  entry.count++;
  return false;
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Trop de scans. Attendez 1 minute avant de réessayer." },
      { status: 429 }
    );
  }

  let url: string;
  try {
    const body = await req.json();
    url = body.url?.trim();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête invalide." },
      { status: 400 }
    );
  }

  if (!url || !isValidUrl(url)) {
    return NextResponse.json(
      { error: "URL invalide. Exemple : https://votresite.fr" },
      { status: 400 }
    );
  }

  // Normalize: remove trailing slash
  url = url.replace(/\/$/, "");

  try {
    const scanData = await Promise.race([
      runScan(url),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Scan timeout")), 30000)
      ),
    ]);

    const score = calculateScore(scanData.checks);
    const result = { ...scanData, score };

    const scanId = uuidv4();
    setCache(scanId, result);

    return NextResponse.json({ scanId, ...result });
  } catch (err) {
    const message =
      err instanceof Error && err.message === "Scan timeout"
        ? "Le scan a pris trop de temps. Vérifiez que le site est accessible."
        : "Erreur lors du scan. Vérifiez que l'URL est accessible.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
