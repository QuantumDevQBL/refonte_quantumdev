# Design: Etudes de cas clients — Screenshots, Audit & Integration WP

**Date**: 2026-02-25
**Statut**: Approuve

## Objectif

Generer des screenshots automatises et audits legers de 3 sites clients, puis integrer les etudes de cas dans le theme WordPress QuantumDev : section sur la homepage + pages singles dediees.

## Sites clients

| Nom | URL | Secteur | Type |
|-----|-----|---------|------|
| Vivre le Bassin | vivrelebassin.fr | Media local | Magazine en ligne |
| Urban Arts Magazine | urbanartsmag.com | Art urbain | Magazine editorial |
| LaboMaison | labomaison.quantumdev.fr | Electromenager | Site editorial / comparateur |

## Architecture

### 1. Tool de capture (`tools/case-studies/`)

Script Node.js unique (`capture.js`) qui orchestre :

- **Screenshots** : Playwright headless, 4 captures par site (desktop fullpage, desktop viewport, mobile fullpage, mobile viewport). Format PNG, nommage `{client}-{device}-{type}.png`.
- **Audit leger** : TTFB, DOMContentLoaded, Load, detection stack WP, headers securite (4 headers), SSL, robots.txt, sitemap.xml.
- **Generation Markdown** : Template before/after avec placeholders structures pour les donnees "avant".

Structure fichiers :
```
tools/case-studies/
  package.json
  capture.js          # Orchestrateur unique
  config.js           # Tableau des sites + parametres
  screenshots/        # PNGs generees
  output/             # JSON audits + Markdown etudes de cas
```

### 2. Custom Post Type `qd_case_study`

CPT leger sans commentaires, sans taxonomies. Meta fields natifs (pas d'ACF) :

| Meta key | Usage |
|----------|-------|
| `_qd_cs_url` | URL du site client |
| `_qd_cs_sector` | Secteur (chip) |
| `_qd_cs_type` | Type de site |
| `_qd_cs_stack` | Stack detectee |
| `_qd_cs_before_ttfb` | TTFB avant [TODO] |
| `_qd_cs_before_perf` | Score perf avant [TODO] |
| `_qd_cs_before_issues` | Problemes identifies [TODO] |
| `_qd_cs_after_ttfb` | TTFB mesure |
| `_qd_cs_after_headers` | Headers securite X/4 |
| `_qd_cs_after_ssl` | Statut SSL |
| `_qd_cs_intervention` | Description intervention |
| `_qd_cs_testimonial` | Temoignage client |
| `_qd_cs_screenshot_mobile` | ID media screenshot mobile |

Featured image = screenshot desktop.

Meta box native dans l'admin WP.

### 3. Homepage — Section "Projets clients"

Placement : entre "Retours clients" (testimonials) et "Maintenance teaser".

```
section.warm
  eyebrow: "Realisations"
  h2: "Sites que nous auditons et maintenons"
  card-grid-3:
    [screenshot lazy] + [chip secteur] + [h3 nom] + [1 ligne] + [Voir ->]
```

- Requete `WP_Query` limitee a 3 posts `qd_case_study`, tries par date
- Reutilise `.card-grid-3`, `.card` existants
- Images `loading="lazy"` avec `width`/`height` explicites
- Lien sur le `<h3>` (pas de div cliquable entiere)

### 4. Single — `single-qd_case_study.php`

Structure :
```
Breadcrumb: Accueil > {titre}
Hero compact (hero-sm): titre + chip secteur
Section "Le client" : infos structurees (url, type, stack)
Section "Avant l'intervention" : metriques [TODO] placeholders
Section "Notre intervention" : textarea
Section "Resultats (etat actuel)" : metriques mesurees
Screenshots desktop/mobile cote a cote
Temoignage (conditionnel)
CTA final: "Votre site merite le meme traitement -> Diagnostic"
```

### 5. SEO

- Schema JSON-LD `Article` avec `about: Service` sur chaque single
- BreadcrumbList JSON-LD (etend le systeme existant dans `inc/seo.php`)
- `<meta name="robots" content="index, follow">`
- OG image = featured image (screenshot desktop)
- Meta description dynamique depuis le contenu

### 6. Accessibilite & Performance

- Images : `loading="lazy"`, `width`/`height`, `alt` descriptif
- Breadcrumb : `<nav aria-label="Fil d'Ariane">`
- Contraste : couleurs du design system existant
- Pas de JS supplementaire cote front pour cette feature
- Screenshots : PNG optimise (compression dans le script de capture)

## Contraintes du script de capture

- 2 secondes de delai entre chaque requete (pas de surcharge serveur)
- Gestion erreurs : un site down ne crashe pas le script
- Fermeture popups cookies automatique (try/catch sur selecteurs classiques)
- PNG qualite maximale
- Tout en local, pas de service externe
