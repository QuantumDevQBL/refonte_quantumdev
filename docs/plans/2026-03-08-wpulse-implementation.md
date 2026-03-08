# WPulse Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build WPulse, une plateforme SaaS de mini-audit WordPress automatisé avec scan gratuit et rapport payant 29€ via Stripe.

**Architecture:** Next.js 14 App Router, scan en request unique (Promise.allSettled), résultats stockés en cache mémoire Map avec TTL 30min, passage via metadata Stripe pour accès au rapport post-paiement.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Stripe Node SDK, Google PageSpeed API (sans clé)

**Répertoire de travail :** `D:/projects/agences/quantumdev/refonte_quantumdev/Wpulse/`

---

## Phase 1 — Scaffold & Configuration

### Task 1: Scaffold Next.js project

**Files:**
- Create: `Wpulse/` (tout le projet Next.js)

**Step 1: Lancer create-next-app**

Depuis `D:/projects/agences/quantumdev/refonte_quantumdev/` :

```bash
cd /d/projects/agences/quantumdev/refonte_quantumdev
npx create-next-app@latest Wpulse --typescript --tailwind --app --src-dir=false --import-alias="@/*" --no-eslint
```

Répondre aux prompts :
- Would you like to use ESLint? → No (on ajoute plus tard si besoin)
- All other options → defaults

**Step 2: Installer les dépendances**

```bash
cd Wpulse
npm install stripe @stripe/stripe-js
npm install uuid
npm install -D @types/uuid
```

**Step 3: Vérifier que le projet démarre**

```bash
npm run dev
```

Ouvrir http://localhost:3000 — doit afficher la page Next.js par défaut.

**Step 4: Commit**

```bash
git add Wpulse/
git commit -m "feat(wpulse): scaffold Next.js 14 project with Stripe deps"
```

---

### Task 2: Configurer Tailwind avec le design system

**Files:**
- Modify: `Wpulse/tailwind.config.ts`
- Modify: `Wpulse/app/globals.css`

**Step 1: Remplacer tailwind.config.ts**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
        },
        bg: {
          dark: "#060A10",
          section: "#0A0F1A",
          card: "#111827",
        },
        text: {
          primary: "#F9FAFB",
          secondary: "#9CA3AF",
          muted: "#6B7280",
        },
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      fontFamily: {
        heading: ["var(--font-barlow)", "sans-serif"],
        body: ["var(--font-dm-sans)", "sans-serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
```

**Step 2: Remplacer globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-barlow: "Barlow Condensed", sans-serif;
  --font-dm-sans: "DM Sans", sans-serif;
  --font-dm-mono: "DM Mono", monospace;
}

* {
  box-sizing: border-box;
}

body {
  background-color: #060A10;
  color: #F9FAFB;
  font-family: var(--font-dm-sans), system-ui, sans-serif;
}

/* Scrollbar dark */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #060A10; }
::-webkit-scrollbar-thumb { background: #1D4ED8; border-radius: 3px; }
```

**Step 3: Configurer le layout avec les fonts Google**

Remplacer `Wpulse/app/layout.tsx` :

```typescript
import type { Metadata } from "next";
import { Barlow_Condensed, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WPulse — Audit WordPress automatisé",
  description:
    "Scan gratuit en 30 secondes. Découvrez ce qui ralentit, fragilise et expose votre site WordPress.",
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body
        className={`${barlowCondensed.variable} ${dmSans.variable} ${dmMono.variable} bg-bg-dark text-text-primary`}
      >
        {children}
      </body>
    </html>
  );
}
```

**Step 4: Vérifier que les fonts chargent**

```bash
npm run dev
```

Inspecter la page → vérifier que Barlow Condensed est chargé dans Network tab.

**Step 5: Commit**

```bash
git add Wpulse/tailwind.config.ts Wpulse/app/globals.css Wpulse/app/layout.tsx
git commit -m "feat(wpulse): design system Tailwind + Google Fonts"
```

---

### Task 3: Variables d'environnement

**Files:**
- Create: `Wpulse/.env.local`
- Create: `Wpulse/.env.local.example`

**Step 1: Créer .env.local**

```env
STRIPE_SECRET_KEY=sk_test_REMPLACER_PAR_CLE_STRIPE
STRIPE_PUBLISHABLE_KEY=pk_test_REMPLACER_PAR_CLE_STRIPE
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# GOOGLE_PAGESPEED_API_KEY= (optionnel)
```

**Step 2: Créer .env.local.example (commitable)**

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# GOOGLE_PAGESPEED_API_KEY= (optionnel — sans clé: 25 req/jour)
```

**Step 3: Vérifier .gitignore**

`Wpulse/.gitignore` doit contenir `.env.local` (create-next-app l'ajoute par défaut).

**Step 4: Commit**

```bash
git add Wpulse/.env.local.example Wpulse/.gitignore
git commit -m "feat(wpulse): environment variables template"
```

---

## Phase 2 — Librairies Core

### Task 4: Cache mémoire (lib/cache.ts)

**Files:**
- Create: `Wpulse/lib/cache.ts`

**Step 1: Écrire le test**

Créer `Wpulse/lib/__tests__/cache.test.ts` :

```typescript
import { setCache, getCache, deleteCache } from "../cache";

describe("cache", () => {
  it("stocke et récupère une valeur", () => {
    setCache("test-id", { url: "https://example.com", score: 80 } as any);
    const result = getCache("test-id");
    expect(result).not.toBeNull();
    expect(result?.url).toBe("https://example.com");
  });

  it("retourne null pour un ID inexistant", () => {
    expect(getCache("inexistant")).toBeNull();
  });

  it("supprime une valeur", () => {
    setCache("delete-me", { url: "test" } as any);
    deleteCache("delete-me");
    expect(getCache("delete-me")).toBeNull();
  });
});
```

**Step 2: Configurer Vitest**

```bash
npm install -D vitest @vitejs/plugin-react
```

Créer `Wpulse/vitest.config.ts` :

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
});
```

Ajouter dans `package.json` scripts :
```json
"test": "vitest run",
"test:watch": "vitest"
```

**Step 3: Lancer le test (doit échouer)**

```bash
npm test
```

Résultat attendu : `FAIL — Cannot find module '../cache'`

**Step 4: Implémenter cache.ts**

```typescript
import { ScanResult } from "./scanner";

interface CacheEntry {
  data: ScanResult;
  expiresAt: number;
}

const TTL_MS = 30 * 60 * 1000; // 30 minutes
const store = new Map<string, CacheEntry>();

export function setCache(id: string, data: ScanResult): void {
  store.set(id, {
    data,
    expiresAt: Date.now() + TTL_MS,
  });
}

export function getCache(id: string): ScanResult | null {
  const entry = store.get(id);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(id);
    return null;
  }
  return entry.data;
}

export function deleteCache(id: string): void {
  store.delete(id);
}
```

**Step 5: Définir le type ScanResult (stub pour l'instant)**

Créer `Wpulse/lib/scanner.ts` (stub minimal pour que le type existe) :

```typescript
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
```

**Step 6: Lancer les tests (doit passer)**

```bash
npm test
```

Résultat attendu : `PASS — 3 tests passed`

**Step 7: Commit**

```bash
git add Wpulse/lib/cache.ts Wpulse/lib/scanner.ts Wpulse/lib/__tests__/cache.test.ts Wpulse/vitest.config.ts Wpulse/package.json
git commit -m "feat(wpulse): cache mémoire TTL 30min + type ScanResult"
```

---

### Task 5: Scoring (lib/scoring.ts)

**Files:**
- Create: `Wpulse/lib/scoring.ts`
- Create: `Wpulse/lib/__tests__/scoring.test.ts`

**Step 1: Écrire les tests**

```typescript
import { calculateScore } from "../scoring";
import { ScanResult } from "../scanner";

const baseChecks: ScanResult["checks"] = {
  ssl: { valid: true },
  wordpress: { detected: true },
  pagespeed: { score: 85, status: "ok" },
  securityHeaders: { present: ["X-Frame-Options"], missing: [] },
  xmlrpc: { exposed: false, status: "blocked" },
  loginPage: { exposed: false, status: "hidden" },
  wpVersion: { exposed: false },
};

describe("calculateScore", () => {
  it("retourne 100 pour un site parfait", () => {
    expect(calculateScore(baseChecks)).toBe(100);
  });

  it("retire 20 points si SSL invalide", () => {
    const checks = { ...baseChecks, ssl: { valid: false } };
    expect(calculateScore(checks)).toBe(80);
  });

  it("retire 20 points si PageSpeed < 50", () => {
    const checks = {
      ...baseChecks,
      pagespeed: { score: 40, status: "fail" as const },
    };
    expect(calculateScore(checks)).toBe(80);
  });

  it("retire 10 points si PageSpeed entre 50 et 74", () => {
    const checks = {
      ...baseChecks,
      pagespeed: { score: 60, status: "warn" as const },
    };
    expect(calculateScore(checks)).toBe(90);
  });

  it("retire 15 points si XML-RPC exposé", () => {
    const checks = {
      ...baseChecks,
      xmlrpc: { exposed: true, status: "exposed" as const },
    };
    expect(calculateScore(checks)).toBe(85);
  });

  it("retire 10 points si login exposé", () => {
    const checks = {
      ...baseChecks,
      loginPage: { exposed: true, status: "exposed" as const },
    };
    expect(calculateScore(checks)).toBe(90);
  });

  it("retire 10 points si version WP visible", () => {
    const checks = {
      ...baseChecks,
      wpVersion: { exposed: true, version: "6.4.2" },
    };
    expect(calculateScore(checks)).toBe(90);
  });

  it("retire 5 points par header manquant (max 25)", () => {
    const checks = {
      ...baseChecks,
      securityHeaders: {
        present: [],
        missing: ["X-Frame-Options", "CSP", "HSTS", "X-Content-Type", "Referrer-Policy", "Permissions-Policy"],
      },
    };
    expect(calculateScore(checks)).toBe(75); // 100 - 25 (cap)
  });

  it("ne descend jamais sous 0", () => {
    const checks = {
      ...baseChecks,
      ssl: { valid: false },
      pagespeed: { score: 10, status: "fail" as const },
      xmlrpc: { exposed: true, status: "exposed" as const },
      loginPage: { exposed: true, status: "exposed" as const },
      wpVersion: { exposed: true, version: "6.0" },
      securityHeaders: {
        present: [],
        missing: ["A", "B", "C", "D", "E", "F"],
      },
    };
    expect(calculateScore(checks)).toBeGreaterThanOrEqual(0);
  });
});
```

**Step 2: Lancer les tests (doit échouer)**

```bash
npm test
```

Résultat attendu : `FAIL — Cannot find module '../scoring'`

**Step 3: Implémenter scoring.ts**

```typescript
import { ScanResult } from "./scanner";

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
```

**Step 4: Lancer les tests (doit passer)**

```bash
npm test
```

Résultat attendu : `PASS — tous les tests passent`

**Step 5: Commit**

```bash
git add Wpulse/lib/scoring.ts Wpulse/lib/__tests__/scoring.test.ts
git commit -m "feat(wpulse): logique de scoring /100"
```

---

### Task 6: Scanner — checks SSL, WordPress, PageSpeed

**Files:**
- Modify: `Wpulse/lib/scanner.ts` (implémentation complète des 3 premiers checks)

**Step 1: Implémenter les 3 premiers checks dans scanner.ts**

Remplacer le stub par l'implémentation complète (première moitié) :

```typescript
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

async function checkSSL(url: string): Promise<ScanResult["checks"]["ssl"]> {
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

async function checkWordPress(
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

async function checkPageSpeed(
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
```

**Step 2: Vérifier que les tests existants passent encore**

```bash
npm test
```

Résultat attendu : tous les tests passent (le type ScanResult n'a pas changé).

**Step 3: Commit**

```bash
git add Wpulse/lib/scanner.ts
git commit -m "feat(wpulse): checks SSL, WordPress detection, PageSpeed"
```

---

### Task 7: Scanner — checks sécurité (headers, xmlrpc, login, version)

**Files:**
- Modify: `Wpulse/lib/scanner.ts` (4 checks restants + fonction principale runScan)

**Step 1: Ajouter les 4 checks sécurité à scanner.ts**

Ajouter ces fonctions après checkPageSpeed :

```typescript
const SECURITY_HEADERS = [
  "x-frame-options",
  "content-security-policy",
  "x-content-type-options",
  "strict-transport-security",
  "referrer-policy",
  "permissions-policy",
];

async function checkSecurityHeaders(
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
    return { present: [], missing: SECURITY_HEADERS };
  }
}

async function checkXmlRpc(
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

async function checkLoginPage(
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

async function checkWpVersion(
  url: string,
  html: string
): Promise<ScanResult["checks"]["wpVersion"]> {
  // Check meta generator (already parsed in checkWordPress, reuse html)
  const generatorMatch = html.match(
    /<meta[^>]+name=["']generator["'][^>]+content=["']WordPress ([^"']+)["']/i
  );
  if (generatorMatch) {
    return { exposed: true, version: generatorMatch[1] };
  }

  // Check ?ver= in script/style URLs
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
    // html stays empty, checks will handle gracefully
  }

  const [ssl, wordpress, pagespeed, securityHeaders, xmlrpc, loginPage, wpVersion] =
    await Promise.allSettled([
      checkSSL(url),
      checkWordPress(url),
      checkPageSpeed(url),
      checkSecurityHeaders(url),
      checkXmlRpc(url),
      checkLoginPage(url),
      checkWpVersion(url, html),
    ]);

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
          : { present: [], missing: SECURITY_HEADERS },
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
```

**Step 2: Vérifier que les tests passent**

```bash
npm test
```

**Step 3: Commit**

```bash
git add Wpulse/lib/scanner.ts
git commit -m "feat(wpulse): checks sécurité headers, xmlrpc, login, wp-version + runScan"
```

---

## Phase 3 — API Routes

### Task 8: API Route /api/scan

**Files:**
- Create: `Wpulse/app/api/scan/route.ts`

**Step 1: Implémenter la route**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { runScan } from "@/lib/scanner";
import { calculateScore } from "@/lib/scoring";
import { setCache } from "@/lib/cache";

// Rate limiting simple: Map<ip, { count, resetAt }>
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 60 * 1000; // 1 minute

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
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
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
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  if (!url || !isValidUrl(url)) {
    return NextResponse.json(
      { error: "URL invalide. Exemple : https://votresite.fr" },
      { status: 400 }
    );
  }

  // Normaliser : enlever trailing slash
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
```

**Step 2: Tester manuellement avec curl**

```bash
curl -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -d '{"url": "https://wordpress.org"}'
```

Résultat attendu : JSON avec `scanId`, `score`, `checks`.

**Step 3: Commit**

```bash
git add Wpulse/app/api/scan/route.ts
git commit -m "feat(wpulse): API route /api/scan avec rate limiting et timeout"
```

---

### Task 9: API Route /api/checkout

**Files:**
- Create: `Wpulse/lib/stripe.ts`
- Create: `Wpulse/app/api/checkout/route.ts`

**Step 1: Créer lib/stripe.ts**

```typescript
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY manquant dans les variables d'environnement");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});
```

**Step 2: Créer app/api/checkout/route.ts**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getCache } from "@/lib/cache";

export async function POST(req: NextRequest) {
  let scanId: string;
  try {
    const body = await req.json();
    scanId = body.scanId;
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  if (!scanId) {
    return NextResponse.json({ error: "scanId manquant." }, { status: 400 });
  }

  const scanData = getCache(scanId);
  if (!scanData) {
    return NextResponse.json(
      { error: "Scan introuvable ou expiré. Relancez un scan." },
      { status: 404 }
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "WPulse — Rapport complet audit WordPress",
              description:
                "Analyse complète de sécurité et performance + recommandations priorisées",
            },
            unit_amount: 2900, // 29€ en centimes
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/report?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/results?id=${scanId}`,
      metadata: {
        scan_id: scanId,
        scanned_url: scanData.url,
      },
      locale: "fr",
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    return NextResponse.json(
      { error: "Erreur lors de la création du paiement." },
      { status: 500 }
    );
  }
}
```

**Step 3: Tester que la route répond (sans vrai Stripe)**

```bash
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"scanId": "inexistant"}'
```

Résultat attendu : `{"error":"Scan introuvable ou expiré. Relancez un scan."}`

**Step 4: Commit**

```bash
git add Wpulse/lib/stripe.ts Wpulse/app/api/checkout/route.ts
git commit -m "feat(wpulse): API route /api/checkout + config Stripe"
```

---

## Phase 4 — Composants UI

### Task 10: Composants de base

**Files:**
- Create: `Wpulse/components/ScoreCircle.tsx`
- Create: `Wpulse/components/CheckItem.tsx`
- Create: `Wpulse/components/LockedCheck.tsx`
- Create: `Wpulse/components/ScanAnimation.tsx`

**Step 1: ScoreCircle.tsx**

```typescript
interface ScoreCircleProps {
  score: number;
  size?: number;
}

export function ScoreCircle({ score, size = 160 }: ScoreCircleProps) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const offset = circumference - progress;

  const color =
    score >= 70 ? "#22C55E" : score >= 40 ? "#F59E0B" : "#EF4444";

  const label =
    score >= 70 ? "Bon" : score >= 40 ? "À améliorer" : "Critique";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1F2937"
          strokeWidth="10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-mono text-4xl font-bold" style={{ color }}>
          {score}
        </span>
        <span className="text-xs text-text-muted">/100</span>
      </div>
      <span className="text-sm font-medium" style={{ color }}>
        {label}
      </span>
    </div>
  );
}
```

Note : entourer le SVG et le texte dans un `relative` wrapper dans la page parente.

**Step 2: CheckItem.tsx**

```typescript
interface CheckItemProps {
  label: string;
  passed: boolean;
  detail?: string;
}

export function CheckItem({ label, passed, detail }: CheckItemProps) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/5">
      <span className="text-lg flex-shrink-0 mt-0.5">
        {passed ? "✅" : "❌"}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        {detail && (
          <p className="text-xs text-text-muted mt-0.5">{detail}</p>
        )}
      </div>
    </div>
  );
}
```

**Step 3: LockedCheck.tsx**

```typescript
interface LockedCheckProps {
  label: string;
}

export function LockedCheck({ label }: LockedCheckProps) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5 opacity-60">
      <span className="text-lg flex-shrink-0">🔒</span>
      <p className="text-sm font-medium text-text-secondary blur-[2px] select-none">
        {label}
      </p>
    </div>
  );
}
```

**Step 4: ScanAnimation.tsx**

```typescript
export function ScanAnimation() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-2 border-primary-600 animate-ping absolute inset-0" />
        <div className="w-20 h-20 rounded-full border-2 border-primary-500 flex items-center justify-center relative">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            className="text-primary-500"
          >
            <path
              d="M2 16 L8 16 L11 8 L14 24 L17 12 L20 20 L23 16 L30 16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
```

**Step 5: Commit**

```bash
git add Wpulse/components/
git commit -m "feat(wpulse): composants UI ScoreCircle, CheckItem, LockedCheck, ScanAnimation"
```

---

## Phase 5 — Pages

### Task 11: Landing Page (`/`)

**Files:**
- Modify: `Wpulse/app/page.tsx`

**Step 1: Implémenter la landing page**

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function isValidUrl(input: string): boolean {
    try {
      const parsed = new URL(input);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();

    if (!trimmed) {
      setError("Entrez l'URL de votre site WordPress.");
      return;
    }

    // Auto-préfixer https:// si absent
    const normalized =
      trimmed.startsWith("http://") || trimmed.startsWith("https://")
        ? trimmed
        : `https://${trimmed}`;

    if (!isValidUrl(normalized)) {
      setError("URL invalide. Exemple : https://votresite.fr");
      return;
    }

    router.push(`/scan?url=${encodeURIComponent(normalized)}`);
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto w-full">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-700/20 border border-primary-700/40 text-primary-500 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
            WPulse by QuantumDev
          </div>

          {/* H1 */}
          <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-text-primary leading-tight mb-4">
            Prenez le pouls de votre site{" "}
            <span className="text-primary-500">WordPress.</span>
          </h1>

          {/* Sous-titre */}
          <p className="text-text-secondary text-lg sm:text-xl mb-10 max-w-xl mx-auto">
            Scan gratuit en 30 secondes. Découvrez ce qui ralentit, fragilise
            et expose votre site.
          </p>

          {/* Formulaire URL */}
          <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError("");
                }}
                placeholder="https://votresite.fr"
                className="flex-1 px-4 py-3.5 rounded-xl bg-bg-card border border-white/10 text-text-primary placeholder-text-muted text-base focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition"
                autoFocus
              />
              <button
                type="submit"
                className="px-6 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-base transition whitespace-nowrap"
              >
                Scanner mon site
              </button>
            </div>
            {error && (
              <p className="text-danger text-sm mt-2 text-left">{error}</p>
            )}
            <p className="text-text-muted text-xs mt-3">
              Gratuit · Sans inscription · Résultats immédiats
            </p>
          </form>
        </div>
      </section>

      {/* Preuve sociale */}
      <section className="bg-bg-section border-t border-white/5 px-4 py-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-text-muted text-xs leading-relaxed">
            11 334 failles WordPress découvertes en 2025{" "}
            <span className="text-text-secondary">(Patchstack)</span> · 96%
            viennent des plugins · Un exploit se déclenche en moyenne en 5h
          </p>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="px-4 py-12 bg-bg-dark border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-heading text-2xl font-bold text-center mb-8 text-text-primary">
            Comment ça marche
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Entrez votre URL",
                desc: "Scan automatique de votre site en 30 secondes",
              },
              {
                step: "02",
                title: "Recevez votre score",
                desc: "3 checks gratuits immédiats sur SSL, CMS et performance",
              },
              {
                step: "03",
                title: "Débloquez le rapport",
                desc: "Recommandations complètes + plan d'action pour 29€",
              },
            ].map(({ step, title, desc }) => (
              <div
                key={step}
                className="bg-bg-card rounded-xl p-5 border border-white/5"
              >
                <span className="font-mono text-primary-500 text-sm font-bold">
                  {step}
                </span>
                <h3 className="font-heading text-lg font-semibold text-text-primary mt-2 mb-1">
                  {title}
                </h3>
                <p className="text-text-muted text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-4 py-6">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-text-muted text-xs">
            WPulse by{" "}
            <a
              href="https://quantumdev.fr"
              className="text-text-secondary hover:text-text-primary transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              QuantumDev
            </a>
          </p>
          <div className="flex gap-4">
            <a href="/mentions-legales" className="text-text-muted text-xs hover:text-text-secondary transition">
              Mentions légales
            </a>
            <a href="/cgv" className="text-text-muted text-xs hover:text-text-secondary transition">
              CGV
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
```

**Step 2: Vérifier visuellement**

Ouvrir http://localhost:3000 — vérifier :
- Fond dark, titre en Barlow Condensed
- Input + bouton bien alignés sur mobile (375px)
- Section "Comment ça marche" lisible

**Step 3: Commit**

```bash
git add Wpulse/app/page.tsx
git commit -m "feat(wpulse): landing page hero + formulaire + comment ça marche"
```

---

### Task 12: Page Scan (`/scan`)

**Files:**
- Create: `Wpulse/app/scan/page.tsx`

**Step 1: Implémenter la page scan**

```typescript
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ScanAnimation } from "@/components/ScanAnimation";

const SCAN_STEPS = [
  "Résolution DNS...",
  "Vérification SSL...",
  "Détection CMS...",
  "Test de performance...",
  "Analyse des en-têtes de sécurité...",
  "Vérification des points d'exposition...",
  "Calcul du score...",
];

function ScanPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const url = searchParams.get("url");

  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!url) {
      router.replace("/");
      return;
    }

    // Avancer les étapes visuellement
    const interval = setInterval(() => {
      setCurrentStep((prev) =>
        prev < SCAN_STEPS.length - 1 ? prev + 1 : prev
      );
    }, 2000);

    // Lancer le scan
    fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    })
      .then((res) => res.json())
      .then((data) => {
        clearInterval(interval);
        if (data.error) {
          setError(data.error);
        } else {
          router.replace(`/results?id=${data.scanId}`);
        }
      })
      .catch(() => {
        clearInterval(interval);
        setError("Erreur réseau. Vérifiez votre connexion et réessayez.");
      });

    return () => clearInterval(interval);
  }, [url, router]);

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <p className="text-danger text-lg mb-4">{error}</p>
        <button
          onClick={() => router.push("/")}
          className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition"
        >
          Réessayer
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-sm w-full">
        <ScanAnimation />

        <div className="mt-8">
          <p className="text-text-primary font-semibold mb-1">
            Analyse en cours...
          </p>
          {url && (
            <p className="text-text-muted text-sm font-mono truncate">{url}</p>
          )}
        </div>

        <div className="mt-6 space-y-2">
          {SCAN_STEPS.map((step, i) => (
            <div
              key={step}
              className={`flex items-center gap-2 text-sm transition-opacity duration-500 ${
                i <= currentStep ? "opacity-100" : "opacity-20"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  i < currentStep
                    ? "bg-success"
                    : i === currentStep
                    ? "bg-primary-500 animate-pulse"
                    : "bg-text-muted"
                }`}
              />
              <span
                className={
                  i < currentStep ? "text-text-muted" : "text-text-secondary"
                }
              >
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function ScanPage() {
  return (
    <Suspense>
      <ScanPageContent />
    </Suspense>
  );
}
```

**Step 2: Tester manuellement**

Aller sur http://localhost:3000 → entrer une URL → vérifier l'animation et la progression des étapes.

**Step 3: Commit**

```bash
git add Wpulse/app/scan/
git commit -m "feat(wpulse): page scan avec animation heartbeat et progression"
```

---

### Task 13: Page Results (`/results`)

**Files:**
- Create: `Wpulse/app/results/page.tsx`

**Step 1: Implémenter la page results**

```typescript
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ScoreCircle } from "@/components/ScoreCircle";
import { CheckItem } from "@/components/CheckItem";
import { LockedCheck } from "@/components/LockedCheck";
import type { ScanResult } from "@/lib/scanner";

type ScanData = ScanResult & { scanId: string };

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scanId = searchParams.get("id");

  const [data, setData] = useState<ScanData | null>(null);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!scanId) {
      router.replace("/");
      return;
    }

    // Les données viennent du state de navigation ou on refait le fetch
    // On stocke les données dans sessionStorage comme pont léger
    const stored = sessionStorage.getItem(`scan_${scanId}`);
    if (stored) {
      try {
        setData(JSON.parse(stored));
        return;
      } catch {
        // ignore, on refait le scan
      }
    }

    setError("Session expirée. Relancez un scan depuis la page d'accueil.");
  }, [scanId, router]);

  async function handlePay() {
    if (!scanId) return;
    setPaying(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanId }),
      });
      const json = await res.json();

      if (json.checkoutUrl) {
        window.location.href = json.checkoutUrl;
      } else {
        setError(json.error || "Erreur lors du paiement.");
        setPaying(false);
      }
    } catch {
      setError("Erreur réseau. Réessayez.");
      setPaying(false);
    }
  }

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center gap-4">
        <p className="text-text-secondary">{error}</p>
        <button
          onClick={() => router.push("/")}
          className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition"
        >
          Nouveau scan
        </button>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
      </main>
    );
  }

  const { checks, score } = data;

  const pagespeedDetail =
    checks.pagespeed.status === "untested"
      ? "Non testé (limite API atteinte)"
      : checks.pagespeed.score !== undefined
      ? `Score : ${checks.pagespeed.score}/100`
      : undefined;

  return (
    <main className="min-h-screen flex flex-col pb-32">
      {/* Header */}
      <div className="bg-bg-section border-b border-white/5 px-4 py-4">
        <div className="max-w-xl mx-auto">
          <p className="text-text-muted text-xs mb-1">Site analysé</p>
          <p className="font-mono text-text-secondary text-sm truncate">
            {data.url}
          </p>
        </div>
      </div>

      <div className="flex-1 px-4 py-8 max-w-xl mx-auto w-full">
        {/* Score */}
        <div className="flex justify-center mb-8 relative">
          <ScoreCircle score={score} />
        </div>

        {/* Checks gratuits */}
        <div className="bg-bg-card rounded-xl border border-white/5 mb-4">
          <div className="px-4 pt-4 pb-1">
            <p className="text-xs text-text-muted uppercase tracking-wide font-semibold mb-1">
              Résultats gratuits
            </p>
          </div>
          <div className="px-4">
            <CheckItem
              label="Certificat SSL"
              passed={checks.ssl.valid}
              detail={checks.ssl.valid ? "HTTPS actif et valide" : "SSL invalide ou absent"}
            />
            <CheckItem
              label="WordPress détecté"
              passed={checks.wordpress.detected}
              detail={
                checks.wordpress.version
                  ? `Version ${checks.wordpress.version} visible dans le code source`
                  : checks.wordpress.detected
                  ? "CMS WordPress identifié"
                  : "WordPress non détecté"
              }
            />
            <CheckItem
              label="Performance mobile (PageSpeed)"
              passed={(checks.pagespeed.score ?? 0) >= 50 && checks.pagespeed.status !== "untested"}
              detail={pagespeedDetail}
            />
          </div>
        </div>

        {/* Checks locked */}
        <div className="bg-bg-card rounded-xl border border-white/5 mb-6 relative overflow-hidden">
          <div className="px-4 pt-4 pb-1">
            <p className="text-xs text-text-muted uppercase tracking-wide font-semibold mb-1">
              Rapport complet (verrouillé)
            </p>
          </div>
          <div className="px-4">
            <LockedCheck label="En-têtes de sécurité (X-Frame-Options, CSP, HSTS...)" />
            <LockedCheck label="XML-RPC exposé — vecteur d'attaque critique" />
            <LockedCheck label="Page de connexion exposée (/wp-login.php)" />
            <LockedCheck label="Version WordPress visible dans le code source" />
            <LockedCheck label="Plan d'action priorisé + recommandations détaillées" />
          </div>
          {/* Gradient overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-bg-card to-transparent pointer-events-none" />
        </div>

        {/* CTA secondaire */}
        <div className="text-center mb-4">
          <p className="text-text-muted text-sm">
            Besoin d&apos;un diagnostic expert ?{" "}
            <a
              href="https://quantumdev.fr/diagnostic"
              className="text-primary-500 hover:text-primary-400 transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              Prendre RDV (200€)
            </a>
          </p>
        </div>
      </div>

      {/* CTA fixe en bas */}
      <div className="fixed bottom-0 left-0 right-0 bg-bg-dark border-t border-white/5 px-4 py-4">
        <div className="max-w-xl mx-auto">
          <button
            onClick={handlePay}
            disabled={paying}
            className="w-full py-4 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-bold text-base transition"
          >
            {paying ? "Redirection..." : "Débloquer le rapport complet — 29€ HT"}
          </button>
          <p className="text-center text-text-muted text-xs mt-2">
            Paiement sécurisé · Rapport immédiat · Satisfait ou remboursé
          </p>
        </div>
      </div>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense>
      <ResultsContent />
    </Suspense>
  );
}
```

**Step 2: Adapter la page scan pour stocker en sessionStorage**

Dans `app/scan/page.tsx`, après avoir reçu la réponse du scan, ajouter avant le `router.replace` :

```typescript
// Après : const data = await res.json()
if (data.scanId) {
  sessionStorage.setItem(`scan_${data.scanId}`, JSON.stringify(data));
}
```

**Step 3: Vérifier visuellement**

Lancer un scan → vérifier la page Results :
- Score circle affiché
- 3 checks visibles avec bonne info
- 5 checks floutés
- CTA fixe en bas

**Step 4: Commit**

```bash
git add Wpulse/app/results/ Wpulse/app/scan/
git commit -m "feat(wpulse): page résultats avec checks gratuits et locked"
```

---

### Task 14: Page Report (`/report`)

**Files:**
- Create: `Wpulse/app/report/page.tsx`

**Step 1: Créer une Server Component pour vérifier Stripe**

```typescript
import { Suspense } from "react";
import { stripe } from "@/lib/stripe";
import { getCache } from "@/lib/cache";
import type { ScanResult } from "@/lib/scanner";
import { CheckItem } from "@/components/CheckItem";
import { ScoreCircle } from "@/components/ScoreCircle";

interface ReportPageProps {
  searchParams: { session_id?: string };
}

async function ReportContent({ sessionId }: { sessionId: string }) {
  let scanData: ScanResult | null = null;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return <ErrorMessage message="Paiement non confirmé. Contactez-nous si vous avez été débité." />;
    }

    const scanId = session.metadata?.scan_id;
    if (scanId) {
      scanData = getCache(scanId);
    }
  } catch {
    return <ErrorMessage message="Session de paiement invalide." />;
  }

  if (!scanData) {
    return (
      <ErrorMessage message="Votre session de rapport a expiré (30 minutes). Relancez un scan pour obtenir un nouveau rapport." />
    );
  }

  const { checks, score, url } = scanData;

  const securityHeadersDetails = [
    { key: "x-frame-options", label: "X-Frame-Options", desc: "Protège contre le clickjacking" },
    { key: "content-security-policy", label: "Content-Security-Policy", desc: "Limite l'injection de scripts malveillants" },
    { key: "x-content-type-options", label: "X-Content-Type-Options", desc: "Empêche le MIME sniffing" },
    { key: "strict-transport-security", label: "HSTS", desc: "Force l'utilisation de HTTPS" },
    { key: "referrer-policy", label: "Referrer-Policy", desc: "Contrôle les informations de référent" },
    { key: "permissions-policy", label: "Permissions-Policy", desc: "Limite l'accès aux APIs navigateur" },
  ];

  return (
    <main className="min-h-screen pb-16">
      {/* Header */}
      <div className="bg-bg-section border-b border-white/5 px-4 py-4">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-success" />
            <span className="text-success text-xs font-semibold">Rapport complet déverrouillé</span>
          </div>
          <p className="font-mono text-text-muted text-sm truncate">{url}</p>
        </div>
      </div>

      <div className="px-4 py-8 max-w-xl mx-auto w-full space-y-6">
        {/* Score */}
        <div className="flex justify-center relative">
          <ScoreCircle score={score} size={160} />
        </div>

        {/* Tous les checks */}
        <div className="bg-bg-card rounded-xl border border-white/5">
          <div className="px-4 pt-4 pb-2">
            <p className="text-xs text-text-muted uppercase tracking-wide font-semibold">
              Rapport détaillé
            </p>
          </div>
          <div className="px-4">
            <CheckItem
              label="Certificat SSL"
              passed={checks.ssl.valid}
              detail={checks.ssl.valid ? "HTTPS actif et valide." : "SSL invalide ou absent. Action requise : activez Let's Encrypt ou contactez votre hébergeur."}
            />
            <CheckItem
              label="WordPress détecté"
              passed={checks.wordpress.detected}
              detail={
                checks.wordpress.version
                  ? `Version ${checks.wordpress.version} visible dans le code source. Recommandation : masquer la version dans functions.php.`
                  : "CMS identifié sans version exposée."
              }
            />
            <CheckItem
              label="Performance mobile"
              passed={(checks.pagespeed.score ?? 0) >= 50}
              detail={
                checks.pagespeed.status === "untested"
                  ? "Non testé."
                  : `Score PageSpeed : ${checks.pagespeed.score}/100. ${(checks.pagespeed.score ?? 0) < 75 ? "Recommandation : optimisez les images, activez le cache, utilisez un CDN." : "Bonne performance."}`
              }
            />

            {/* Security Headers */}
            {securityHeadersDetails.map(({ key, label, desc }) => {
              const present = checks.securityHeaders.present.includes(key);
              return (
                <CheckItem
                  key={key}
                  label={label}
                  passed={present}
                  detail={
                    present
                      ? `${desc} — présent.`
                      : `${desc} — absent. Recommandation : ajoutez cet en-tête dans la configuration de votre serveur.`
                  }
                />
              );
            })}

            <CheckItem
              label="XML-RPC"
              passed={!checks.xmlrpc.exposed}
              detail={
                checks.xmlrpc.exposed
                  ? "XML-RPC exposé — vecteur d'attaque pour brute-force et DDoS. Recommandation : désactivez XML-RPC via le plugin Disable XML-RPC."
                  : "XML-RPC non exposé ou désactivé."
              }
            />
            <CheckItem
              label="Page de connexion"
              passed={!checks.loginPage.exposed}
              detail={
                checks.loginPage.exposed
                  ? "/wp-login.php accessible publiquement. Recommandation : limitez l'accès par IP ou changez l'URL de connexion."
                  : "Page de connexion protégée ou déplacée."
              }
            />
            <CheckItem
              label="Version WordPress dans le code source"
              passed={!checks.wpVersion.exposed}
              detail={
                checks.wpVersion.exposed
                  ? `Version ${checks.wpVersion.version ?? ""} visible. Recommandation : ajoutez remove_action('wp_head', 'wp_generator') dans functions.php.`
                  : "Version non exposée dans le code source."
              }
            />
          </div>
        </div>

        {/* Prochaine étape */}
        <div className="bg-primary-700/10 border border-primary-700/30 rounded-xl p-5">
          <h2 className="font-heading text-xl font-bold text-text-primary mb-2">
            Prochaine étape recommandée
          </h2>
          <p className="text-text-secondary text-sm mb-4">
            Ce rapport identifie les problèmes. Un diagnostic expert vous donne
            un plan d&apos;action complet avec implémentation garantie.
          </p>
          <a
            href="https://quantumdev.fr/diagnostic"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm transition"
          >
            Prendre RDV — Diagnostic expert 200€
          </a>
        </div>

        {/* Nouveau scan */}
        <div className="text-center">
          <a href="/" className="text-text-muted text-sm hover:text-text-secondary transition">
            Analyser un autre site
          </a>
        </div>
      </div>
    </main>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center gap-4">
      <p className="text-text-secondary max-w-sm">{message}</p>
      <a
        href="/"
        className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition"
      >
        Nouveau scan
      </a>
    </main>
  );
}

export default function ReportPage({ searchParams }: ReportPageProps) {
  const sessionId = searchParams.session_id;

  if (!sessionId) {
    return <ErrorMessage message="Accès non autorisé. Complétez le paiement pour accéder au rapport." />;
  }

  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
      </main>
    }>
      <ReportContent sessionId={sessionId} />
    </Suspense>
  );
}
```

**Step 2: Vérifier que la page compile**

```bash
npm run build
```

Résultat attendu : pas d'erreurs TypeScript.

**Step 3: Commit**

```bash
git add Wpulse/app/report/
git commit -m "feat(wpulse): page rapport complet post-paiement Stripe"
```

---

## Phase 6 — Finalisation

### Task 15: Build & vérification finale

**Step 1: Build de production**

```bash
cd Wpulse
npm run build
```

Résultat attendu : build réussi, pas d'erreurs.

**Step 2: Lancer en mode production**

```bash
npm run start
```

**Step 3: Tests manuels end-to-end**

1. Aller sur http://localhost:3000
2. Entrer `https://wordpress.org`
3. Observer la page scan (animation)
4. Vérifier la page results (score, 3 checks, 5 locked, CTA)
5. Cliquer "Débloquer" → vérifier redirect vers Stripe (avec vraies clés test)

**Step 4: Vérifier PageSpeed de WPulse lui-même**

Aller sur https://pagespeed.web.dev/ → entrer l'URL de prod → vérifier score >90.

**Step 5: Vérifier next.config.js pour les optimisations**

Modifier `Wpulse/next.config.js` :

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimisations prod
  compress: true,
  poweredByHeader: false,
  // Headers de sécurité
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

**Step 6: Lancer les tests une dernière fois**

```bash
npm test
```

Résultat attendu : tous les tests passent.

**Step 7: Commit final**

```bash
git add Wpulse/next.config.js
git commit -m "feat(wpulse): headers sécurité + config production"
```

---

## Récapitulatif des tâches

| # | Tâche | Durée estimée |
|---|-------|---------------|
| 1 | Scaffold Next.js | 5 min |
| 2 | Design system Tailwind + fonts | 10 min |
| 3 | Variables d'environnement | 3 min |
| 4 | lib/cache.ts + tests | 10 min |
| 5 | lib/scoring.ts + tests | 10 min |
| 6 | Scanner checks 1-3 (SSL, WP, PageSpeed) | 15 min |
| 7 | Scanner checks 4-7 + runScan | 15 min |
| 8 | API /api/scan | 10 min |
| 9 | API /api/checkout + Stripe | 10 min |
| 10 | Composants UI | 15 min |
| 11 | Landing page | 10 min |
| 12 | Page scan (animation) | 10 min |
| 13 | Page results | 15 min |
| 14 | Page report | 15 min |
| 15 | Build & vérification finale | 10 min |

**Total estimé : ~2h30**
