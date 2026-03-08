# WPulse — Design Document
**Date :** 2026-03-08
**Statut :** Validé

## Vue d'ensemble

WPulse (wpulse.fr) est une plateforme SaaS de mini-audit WordPress automatisé, outil de lead generation pour QuantumDev. Scan gratuit → rapport payant 29€ → upsell diagnostic expert 200€.

**Stack :** Next.js 14 (App Router) · Tailwind CSS · Stripe Checkout · Vercel
**Contraintes :** Pas de BDD, pas d'auth, mobile-first, RGPD-friendly

---

## Architecture

```
Wpulse/
├── app/
│   ├── layout.tsx               # Fonts, metadata, dark bg #060A10
│   ├── page.tsx                 # Landing — hero + input URL
│   ├── scan/page.tsx            # Animation heartbeat, redirect auto vers /results
│   ├── results/page.tsx         # 3 checks visibles + checks locked + CTA Stripe
│   ├── report/page.tsx          # Rapport complet post-paiement
│   └── api/
│       ├── scan/route.ts        # 7 checks en Promise.allSettled, timeout 30s
│       └── checkout/route.ts    # Crée session Stripe, stocke scan en cache mémoire
├── components/
│   ├── ScoreCircle.tsx          # SVG stroke-dasharray animé
│   ├── CheckItem.tsx            # Ligne check (icône + label + statut + détail)
│   ├── LockedCheck.tsx          # Check flouté avec overlay
│   └── ScanAnimation.tsx        # CSS keyframes pulse/heartbeat
└── lib/
    ├── scanner.ts               # Tous les checks
    ├── scoring.ts               # Calcul score /100
    ├── cache.ts                 # Map<scanId, ScanResult> TTL 30min
    └── stripe.ts                # Config Stripe
```

---

## Flow de données

```
Landing (URL input)
  → navigation GET /scan?url=X
  → page /scan appelle POST /api/scan au mount
  → /api/scan exécute 7 checks en Promise.allSettled (timeout 30s)
  → stocke ScanResult dans cache mémoire (scanId = UUID)
  → retourne { scanId, ...results }
  → page /scan redirige vers /results?id=scanId

Results
  → charge ScanResult depuis cache via scanId
  → affiche 3 checks libres + 5 checks floutés + CTA
  → clic CTA → POST /api/checkout { scanId }
  → /api/checkout crée session Stripe avec metadata: { scanId }
  → redirect vers Stripe Checkout

Post-paiement
  → Stripe redirect vers /report?session_id=XXX
  → page /report vérifie session Stripe côté serveur
  → extrait scanId depuis metadata → cache.get(scanId)
  → si cache expiré → message "Session expirée, relancez un scan"
  → sinon → affiche rapport complet déverrouillé
```

---

## Modèles de données

```typescript
interface ScanResult {
  url: string;
  scannedAt: number;
  score: number;
  checks: {
    ssl:             { valid: boolean; expiresIn?: number }
    wordpress:       { detected: boolean; version?: string }
    pagespeed:       { score?: number; fcp?: number; lcp?: number; status: 'ok'|'warn'|'fail'|'untested' }
    securityHeaders: { present: string[]; missing: string[] }
    xmlrpc:          { exposed: boolean; status: 'exposed'|'blocked'|'not_found'|'untested' }
    loginPage:       { exposed: boolean; status: 'exposed'|'hidden'|'not_found'|'untested' }
    wpVersion:       { exposed: boolean; version?: string }
  }
}
```

---

## API Design

### `POST /api/scan`
- **Input :** `{ url: string }`
- **Validation :** URL valide (http/https), domaine accessible
- **Rate limit :** 3 scans/IP/minute (Map mémoire)
- **Timeout :** `Promise.race` avec 30s deadline
- **Output :** `{ scanId: string } & ScanResult`

### `POST /api/checkout`
- **Input :** `{ scanId: string }`
- **Action :** Crée Stripe Checkout Session (29€ HT, mode payment)
- **Metadata Stripe :** `{ scanId }`
- **Output :** `{ checkoutUrl: string }`

---

## Checks techniques

| # | Check | Gratuit | Méthode |
|---|-------|---------|---------|
| 1 | SSL valide | ✅ | Fetch HTTPS, vérifier réponse |
| 2 | WordPress détecté + version visible | ✅ | Parsing HTML source |
| 3 | Score PageSpeed mobile | ✅ | Google PageSpeed API (sans clé, fallback gracieux si rate limited) |
| 4 | Headers de sécurité | 🔒 | Response headers (X-Frame-Options, CSP, HSTS, etc.) |
| 5 | XML-RPC exposé | 🔒 | POST /xmlrpc.php |
| 6 | Page login exposée | 🔒 | GET /wp-login.php + /wp-admin/ |
| 7 | Version WP visible dans source | 🔒 | Parsing meta generator + ?ver= dans scripts |

---

## Scoring

```javascript
score = 100
- 20 si SSL invalide
- 20 si PageSpeed < 50 / -10 si PageSpeed < 75
- 15 si XML-RPC exposé
- 10 si page login exposée
- 10 si version WP visible
- 5 × nombre headers manquants (max -25)
minimum = 0
```

---

## UI / Design System

**Couleurs (Tailwind config custom) :**
- Background : `#060A10` (bg-dark), `#0A0F1A` (bg-section), `#111827` (bg-card)
- Primary : `#3B82F6` (500), `#2563EB` (600), `#1D4ED8` (700)
- Success/Warning/Danger : `#22C55E` / `#F59E0B` / `#EF4444`
- Text : `#F9FAFB` (primary), `#9CA3AF` (secondary), `#6B7280` (muted)

**Fonts :**
- Headings : Barlow Condensed (Bold/Semibold) — Google Fonts
- Body : DM Sans — Google Fonts
- Données/scores : DM Mono — Google Fonts

**Composants :**
- `ScoreCircle` — SVG cercle avec stroke-dasharray animé, couleur conditionnelle
- `CheckItem` — icône (✅/❌) + label + statut + détail court
- `LockedCheck` — blur CSS + overlay "Débloquer" + icône 🔒
- `ScanAnimation` — CSS pulse, pas de lib externe

---

## Variables d'environnement

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# GOOGLE_PAGESPEED_API_KEY= (optionnel — sans clé: fallback gracieux si rate limited)
```

---

## Contraintes & décisions

| Décision | Choix | Raison |
|----------|-------|--------|
| Persistance scan | Cache mémoire Map + TTL 30min | Zéro dépendance, suffisant MVP |
| Flow de scan | Request unique, Promise.allSettled | Simple, robuste, facile à déboguer |
| PageSpeed API | Sans clé, fallback "Non testé" | Zéro setup, 25 req/jour suffisants pour MVP |
| Déploiement | Local d'abord, Vercel ensuite | Itérer vite sans friction |
| Animations | CSS pur, pas de lib | Performance + cohérence avec le positionnement produit |
