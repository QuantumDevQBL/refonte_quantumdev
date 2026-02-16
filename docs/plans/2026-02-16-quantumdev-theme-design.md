# QuantumDev WordPress Theme - Design Document

**Date**: 2026-02-16
**Project**: Custom WordPress theme for QuantumDev
**Goal**: Ultra-performant, zero-plugin site (except ACF), deployed TODAY
**Scores Target**: 100/100 Lighthouse (Performance, SEO, Accessibility)

---

## 1. Architecture Overview

### Objectives
- Replace existing Underscores theme with production-ready custom theme
- Achieve 100/100 scores in Performance, SEO, and Accessibility
- Eliminate all plugins except ACF (replace RankMath, page builders, etc.)
- Deploy to o2switch (LiteSpeed, PHP 8.2) TODAY
- All content editable via ACF Options (no Gutenberg, no page builders)

### Technology Stack
- **Base**: Underscores (_s) structure in `quantum_dev_corporate/`
- **CSS**: Design system extracted from wireframes (CSS variables, no SASS)
- **JavaScript**: Vanilla JS only (no jQuery) - FAQ accordion, smooth scroll
- **ACF**: Segmented by page, registered in PHP via `acf_add_local_field_group()`
- **Stripe**: Payment Links (URLs stored in ACF, no API integration needed)
- **SEO**: Native implementation (replaces RankMath entirely)

### Design Principles
- **YAGNI**: No premature abstractions, no template parts, code stays direct
- **Monolithic approach**: Simple, flat file structure for maximum performance
- **Source of truth**: 7 HTML wireframes in `page_wireframes/` directory
- **Content extraction**: All text from wireframes → ACF default_value (auto-populated)

---

## 2. File Structure

```
quantum_dev_corporate/
├── style.css                    # WP header + full design system
├── functions.php                # Bootstrap: enqueues, supports, includes
├── header.php                   # <head> SEO + navigation
├── footer.php                   # Footer + scripts
│
├── front-page.php               # Homepage (8 sections)
├── page-diagnostic.php          # /diagnostic/ (8 sections + FAQ)
├── page-maintenance.php         # /maintenance/ (pricing + FAQ)
├── page-reservation.php         # /diagnostic/reservation/
├── page-confirmation.php        # Confirmation pages
├── page-a-propos.php            # /a-propos/
├── page-legal.php               # Legal pages template
├── single.php                   # Blog post
├── archive.php                  # Blog archive
├── 404.php                      # Error page
│
├── inc/
│   ├── acf/
│   │   ├── acf-general.php      # General options (footer, nav, etc.)
│   │   ├── acf-homepage.php     # Homepage fields (8 groups)
│   │   ├── acf-diagnostic.php   # Diagnostic page fields
│   │   ├── acf-maintenance.php  # Maintenance page fields (pricing)
│   │   ├── acf-reservation.php  # Reservation page fields
│   │   ├── acf-confirmation.php # Confirmation pages fields
│   │   ├── acf-apropos.php      # About page fields
│   │   └── acf-stripe.php       # Stripe Payment Links URLs
│   │
│   ├── seo.php                  # Meta tags, OG, Schema JSON-LD, sitemap
│   ├── performance.php          # Critical CSS inline, defer, WP cleanup
│   ├── security.php             # Headers, XML-RPC off, REST restrict
│   └── accessibility.php        # Skip link, ARIA, focus-visible
│
├── assets/
│   ├── css/
│   │   └── critical.css         # Above-fold CSS (<14KB) - inlined in <head>
│   ├── js/
│   │   └── main.js              # FAQ accordion, smooth scroll
│   └── img/                     # (empty for now)
│
├── page_wireframes/             # Source of truth (7 HTML files)
├── languages/                   # Translations (empty for now)
├── .gitignore
└── README.md                    # Deployment instructions
```

**Total files to create**: ~25 files

---

## 3. ACF Organization

### Single Options Page with 8 Tabs

**Configuration:**
```php
acf_add_options_page([
    'page_title' => 'QuantumDev - Réglages',
    'menu_title' => 'QuantumDev',
    'menu_slug'  => 'quantumdev-settings',
    'capability' => 'edit_posts',
    'icon_url'   => 'dashicons-admin-generic',
    'position'   => 2,
]);
```

### Tab Structure

**TAB 1: General** (`inc/acf/acf-general.php`)
- Site name, footer description, copyright
- Nav CTA label + URL
- Contact info

**TAB 2: Homepage** (`inc/acf/acf-homepage.php`)
- Groups: hero, stats, qualification, vraie_cause, solution, apres, autorite, cta_final
- Repeaters: stat_cards, qual_pour, qual_pas_pour, auth_items
- ~300-400 lines of code

**TAB 3: Diagnostic** (`inc/acf/acf-diagnostic.php`)
- Groups: diag_hero, diag_livrables, diag_perimetre, diag_process, diag_pourquoi, diag_faq, diag_apres, diag_cta
- Repeaters: cards, deliverables, inclus, exclus, steps, questions
- ~400-500 lines of code

**TAB 4: Maintenance** (`inc/acf/acf-maintenance.php`)
- Groups: maint_hero, maint_plans, maint_faq, maint_cta
- Repeater: plans (name, price, features, stripe_link_monthly, stripe_link_annual)
- ~300-400 lines of code

**TAB 5: Reservation** (`inc/acf/acf-reservation.php`)
- Form labels, payment CTA, after_payment steps
- ~150-200 lines of code

**TAB 6: Confirmations** (`inc/acf/acf-confirmation.php`)
- Groups: confirm_diag, confirm_maint
- ~150-200 lines of code

**TAB 7: À Propos** (`inc/acf/acf-apropos.php`)
- Groups: about_intro, about_values, about_model, about_cta
- ~200-250 lines of code

**TAB 8: Stripe** (`inc/acf/acf-stripe.php`)
- `diagnostic_payment_link` (URL)
- Note field explaining maintenance links are in TAB 4
- ~50-100 lines of code

### Field Naming Convention
- Prefix by page: `hero_`, `diag_`, `maint_`, `resa_`, `confirm_`, `about_`
- Groups use descriptive names: `hero`, `stats`, `plans`, etc.
- Repeaters: `stat_cards`, `questions`, `plans`, `steps`
- Sub-fields: `title`, `text`, `label`, `url`, `category`, `semantic`, etc.

### Default Values
All fields have `default_value` populated with content extracted from wireframes.

**Example:**
```php
'default_value' => 'Votre site fonctionne.\nIl accumule aussi des risques cachés.',
```

No acf-json/ export needed - everything registered in PHP.

---

## 4. SEO Implementation (Native - Replaces RankMath)

### Meta Tags (header.php)
- Unique `<title>` per page (ACF field + suffix)
- Unique `<meta name="description">` per page
- Canonical URLs (`<link rel="canonical">`)
- Robots meta (noindex for reservation/confirmation pages)

### Open Graph
- `og:title`, `og:description`, `og:type`, `og:url`, `og:locale`, `og:site_name`, `og:image`
- Twitter Card: `summary_large_image`

### Schema JSON-LD (per page type)
- **Homepage**: ProfessionalService + WebSite
- **Diagnostic**: Service (200€) + FAQPage + BreadcrumbList
- **Maintenance**: OfferCatalog (3 plans) + FAQPage + BreadcrumbList
- **À propos**: Organization + BreadcrumbList
- **Blog posts**: BlogPosting + BreadcrumbList

### Sitemap XML
- Native endpoint: `/sitemap.xml` (via `template_redirect` hook)
- Priority: / (1.0), /diagnostic/ (0.9), /maintenance/ (0.9), /a-propos/ (0.5), blog (0.7)
- Exclude: reservation, confirmation pages

### robots.txt
- Virtual robots.txt (via `robots_txt` filter)
- Disallow: `/diagnostic/reservation/`, `/diagnostic/confirmation/`, `/maintenance/confirmation/`, `/wp-admin/`
- Sitemap reference: `https://www.quantumdev.fr/sitemap.xml`

### Breadcrumbs
- Schema BreadcrumbList on all pages except homepage
- Displayed semantically (not visually unless needed)

---

## 5. Performance Optimizations (100/100 Target)

### Critical CSS Strategy
1. Extract full `<style>` block from `01-homepage.html`
2. Identify above-the-fold classes: reset, variables, nav, hero, buttons, section titles
3. Extract to `assets/css/critical.css` (~10-12KB)
4. Remaining CSS stays in `style.css` (loaded deferred)
5. Inline critical CSS in `<head>` via `inc/performance.php`

### WordPress Cleanup
Remove all unnecessary WordPress features:
- Emoji detection scripts
- Generator meta tags
- RSD/WLW links
- REST API output links
- oEmbed discovery
- Shortlink
- RSS feeds (no active blog)
- Gutenberg CSS (all blocks: wp-block-library, global-styles, classic-theme-styles)
- Self-pingbacks

### Preload & Preconnect
- Preconnect to Google Fonts
- Preconnect to fonts.gstatic.com (crossorigin)
- DNS-prefetch to js.stripe.com
- Preload critical fonts (Instrument Sans, Fraunces)

### Defer Scripts
- All scripts loaded with `defer` attribute (except inline critical scripts)
- Filter `script_loader_tag` to add defer automatically

### Lazy Loading
- Native HTML5 lazy loading: `loading="lazy" decoding="async"`
- Applied to all images except above-the-fold (hero images)

### Database Optimization
- Limit post revisions: `WP_POST_REVISIONS = 3`
- Increase autosave interval: `AUTOSAVE_INTERVAL = 300` (5 minutes)

### Cache Headers
- Public cache for non-logged-in users: `Cache-Control: public, max-age=3600`
- Works with LiteSpeed Cache plugin (optional, only allowed plugin besides ACF)

### Expected Metrics
- **Performance**: 95-100 (critical CSS + defer + lazy + cleanup)
- **Accessibility**: 100 (ARIA + semantic HTML + contrast)
- **Best Practices**: 100 (HTTPS + headers + no errors)
- **SEO**: 100 (meta + Schema + sitemap + mobile-friendly)

**Core Web Vitals:**
- LCP < 2.5s (critical CSS inline + preload fonts)
- FID < 100ms (defer JS)
- CLS < 0.1 (fixed image dimensions)

---

## 6. Security & Accessibility

### Security (inc/security.php)

**Headers:**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

**WordPress Hardening:**
- Hide WP version (remove generator, strip version from assets)
- Disable XML-RPC (`xmlrpc_enabled` filter)
- Restrict REST API (require authentication except public endpoints)
- Disable file editor (`DISALLOW_FILE_EDIT`)

### Accessibility (inc/accessibility.php)

**Navigation:**
- Skip link to `#main-content` (keyboard accessible, visible on focus)
- ARIA landmarks: `role="banner"`, `role="navigation"`, `role="main"`, `role="contentinfo"`
- Navigation menus: `role="menubar"` and `role="menuitem"` on links

**Focus Management:**
- Global `:focus-visible` styles (3px solid outline, primary color)
- Focus visible on all interactive elements (buttons, links, form inputs)

**FAQ Accordion:**
- `role="button"` on questions
- `tabindex="0"` for keyboard access
- `aria-expanded` toggled on click/keypress
- Enter and Space key support

**Visual:**
- Color contrast ≥ 4.5:1 (WCAG AA) - validated from wireframe design system
- Touch targets ≥ 44x44px on all interactive elements
- Alt text on all images (empty alt for decorative images)

**Motion:**
- `@media (prefers-reduced-motion: reduce)` - disable all animations/transitions

**Semantic HTML:**
- Proper heading hierarchy (H1 → H2 → H3)
- Single H1 per page
- `<main>`, `<header>`, `<footer>`, `<nav>`, `<section>`, `<article>` elements
- Language attribute: `<html lang="fr">`

---

## 7. Content Extraction Strategy

### CSS Extraction
1. Read `page_wireframes/01-homepage.html`
2. Locate `<style>` block (lines 9-299 approximately)
3. Extract entire block → `style.css` (with WordPress header)
4. Extract critical subset → `assets/css/critical.css`
5. Remove `.style-banner` (wireframe-only class)
6. Add `.screen-reader-text` styles
7. Add `:focus-visible` styles
8. Add `@media (prefers-reduced-motion)` rules

### HTML Content Extraction
For each wireframe file, parse the HTML and extract:
- All `<h1>`, `<h2>`, `<h3>` text
- All `<p>` text
- All `<li>` text from lists
- Button/link labels
- Form labels
- Data attributes (e.g., `data-sem="warning"`)

Map extracted content to corresponding ACF field names and populate `default_value`.

**Example mapping (homepage):**
```
Wireframe: <div class="hero-chip">Audit & Maintenance WordPress</div>
ACF Field: 'hero_chip' => 'Audit & Maintenance WordPress'

Wireframe: <h1>Votre site fonctionne.<br>Il accumule aussi des risques cachés.</h1>
ACF Field: 'hero_h1' => 'Votre site fonctionne.\nIl accumule aussi des risques cachés.'

Wireframe: <li><span class="check">✓</span> Vous avez un site...</li>
ACF Field: repeater 'qual_pour' → sub_field 'text' => 'Vous avez un site...'
```

### Template HTML Reproduction
Each PHP template reproduces the exact HTML structure from its wireframe:
1. Copy HTML structure verbatim
2. Replace hardcoded text with `get_field('field_name', 'option')`
3. Replace hardcoded lists with `have_rows()` / `the_row()` / `get_sub_field()`
4. Add escaping functions: `esc_html()`, `esc_url()`, `esc_attr()`
5. Add `wp_kses_post()` for rich HTML content if needed

**Example:**
```php
<!-- Wireframe HTML -->
<h1>Votre site fonctionne.<br>Il accumule aussi des risques cachés.</h1>

<!-- PHP Template -->
<h1><?php echo nl2br(esc_html(get_field('hero_h1', 'option'))); ?></h1>
```

---

## 8. Implementation Timeline

**Total estimated time: ~2h30**

1. **Structure & Bootstrap** (5 min)
   - Create `style.css` with WP header + design system
   - Create `functions.php`
   - Create `.gitignore`
   - Initialize Git + first commit

2. **Critical Assets** (10 min)
   - Extract and create `assets/css/critical.css`
   - Create `assets/js/main.js` (FAQ + smooth scroll)

3. **Header/Footer** (10 min)
   - Create `header.php` with SEO implementation
   - Create `footer.php`

4. **Inc/ Core** (15 min)
   - `inc/seo.php` (meta, OG, Schema, sitemap, robots)
   - `inc/performance.php` (critical CSS inline, defer, cleanup)
   - `inc/security.php` (headers, XML-RPC, REST)
   - `inc/accessibility.php` (skip link, focus)

5. **ACF Segmented** (30 min)
   - All 8 ACF files with field groups
   - Content extraction from wireframes
   - Default values populated

6. **Page Templates** (45 min)
   - All 7 main page templates
   - HTML structure from wireframes
   - ACF field integration

7. **Secondary Templates** (10 min)
   - `single.php`, `archive.php`, `404.php`

8. **Documentation** (5 min)
   - `README.md` with deployment instructions

---

## 9. Deployment Checklist

### Server Requirements (o2switch)
- ✅ PHP 8.2
- ✅ WordPress 6.0+
- ✅ LiteSpeed Server
- ✅ HTTPS enabled

### Required Plugins
- ✅ Advanced Custom Fields (free or Pro)
- ✅ LiteSpeed Cache (optional, for server-level caching)

**No other plugins required** - SEO, security, performance all native.

### Deployment Steps
1. Upload theme to `/wp-content/themes/quantum_dev_corporate/`
2. Install and activate ACF plugin
3. Activate QuantumDev theme
4. Go to **QuantumDev > Réglages** in admin
5. Fill Stripe Payment Links in TAB 8 (Stripe)
6. Verify all pre-filled content in other tabs
7. Create WordPress pages:
   - Diagnostic (slug: `diagnostic`, template: Diagnostic)
   - Maintenance (slug: `maintenance`, template: Maintenance)
   - Réservation (slug: `reservation`, parent: diagnostic, template: Réservation)
   - Confirmation (slug: `confirmation`, parent: diagnostic, template: Confirmation)
   - À propos (slug: `a-propos`, template: À propos)
8. Settings → Reading → Set static homepage (or leave as posts for auto front-page.php)
9. Appearance → Menus → Create primary, footer, and legal menus
10. Test all pages
11. Run Lighthouse audit
12. Activate LiteSpeed Cache if needed
13. **DEPLOYED ✓**

---

## 10. Validation Criteria

### Manual Tests
- [ ] Theme activates without PHP errors
- [ ] Navigation menu works
- [ ] Homepage displays with ACF content
- [ ] All 7 pages render correctly
- [ ] FAQ accordion works (click + keyboard)
- [ ] Footer displays correctly
- [ ] Mobile responsive

### Technical Tests
- [ ] Lighthouse Performance ≥ 95
- [ ] Lighthouse SEO = 100
- [ ] Lighthouse Accessibility = 100
- [ ] Lighthouse Best Practices = 100
- [ ] Schema JSON-LD validates (Google Rich Results Test)
- [ ] `/sitemap.xml` accessible and valid
- [ ] `/robots.txt` accessible
- [ ] Open Graph tags present in source
- [ ] Skip link works (Tab key → visible focus)
- [ ] Color contrast validated (WAVE or axe DevTools)

### Success Metrics
- **Zero plugins** (except ACF + optional LiteSpeed Cache)
- **100/100** Lighthouse scores
- **LCP < 2.5s**, **FID < 100ms**, **CLS < 0.1**
- **Fully accessible** (keyboard navigation, screen readers)
- **Production-ready** same day

---

## Design Approved ✓

This design document represents the complete validated architecture for the QuantumDev WordPress theme. All decisions have been reviewed and approved.

**Next step**: Create detailed implementation plan using the writing-plans skill.
