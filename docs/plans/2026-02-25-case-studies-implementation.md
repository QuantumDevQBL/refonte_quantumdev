# Case Studies: Screenshots, Audit & WP Integration — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Generate automated screenshots + light audits for 3 client sites, then integrate case studies into the WP theme (homepage section + single pages with breadcrumbs, SEO, accessibility).

**Architecture:** Node.js capture tool in `tools/case-studies/` generates screenshots + audit JSON + Markdown. WordPress CPT `qd_case_study` with native meta box stores data. Homepage gets a new section between testimonials and maintenance teaser. Singles reuse existing design system (`.card`, `.breadcrumb`, `.hero-sm`, `.section-eyebrow`).

**Tech Stack:** Node.js + Playwright (capture tool), PHP/WordPress (CPT + templates + meta box), existing CSS design system.

---

## Task 1: Scaffold capture tool

**Files:**
- Create: `tools/case-studies/package.json`
- Create: `tools/case-studies/config.js`

**Step 1: Create package.json**

```json
{
  "name": "qd-case-studies",
  "version": "1.0.0",
  "private": true,
  "description": "Screenshot & audit tool for QuantumDev case studies",
  "scripts": {
    "capture": "node capture.js"
  },
  "dependencies": {
    "playwright": "^1.40.0"
  }
}
```

**Step 2: Create config.js**

```javascript
module.exports = {
  sites: [
    {
      name: 'vivrelebassin',
      label: 'Vivre le Bassin',
      url: 'https://vivrelebassin.fr/',
      sector: 'Media local',
      type: 'Magazine en ligne',
    },
    {
      name: 'urbanartsmag',
      label: 'Urban Arts Magazine',
      url: 'https://www.urbanartsmag.com/',
      sector: 'Art urbain',
      type: 'Magazine editorial',
    },
    {
      name: 'labomaison',
      label: 'LaboMaison',
      url: 'https://www.labomaison.quantumdev.fr/',
      sector: 'Electromenager',
      type: 'Site editorial / comparateur',
    },
  ],
  delayBetweenRequests: 2000,
  screenshotDir: './screenshots',
  outputDir: './output',
  viewports: {
    desktop: { width: 1920, height: 1080 },
    mobile: { width: 390, height: 844, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)' },
  },
  cookieSelectors: [
    '.cookie-accept', '#cookie-consent', '[data-action="accept"]',
    '.cc-accept', '.js-cookie-accept', '#onetrust-accept-btn-handler',
    '.accept-cookies', '[aria-label="Accept cookies"]',
    '.cky-btn-accept', '#cookie_action_close_header',
  ],
};
```

**Step 3: Install dependencies**

Run: `cd tools/case-studies && npm install`
Expected: `node_modules/` created, `package-lock.json` generated.

**Step 4: Install Playwright Chromium**

Run: `cd tools/case-studies && npx playwright install chromium`
Expected: Chromium browser binary downloaded.

**Step 5: Create output directories**

Run: `mkdir -p tools/case-studies/screenshots tools/case-studies/output`

**Step 6: Commit**

```bash
git add tools/case-studies/package.json tools/case-studies/config.js
git commit -m "chore: scaffold case studies capture tool"
```

---

## Task 2: Write capture.js — screenshots + audit + markdown generation

**Files:**
- Create: `tools/case-studies/capture.js`

**Step 1: Write the complete orchestrator script**

```javascript
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const config = require('./config');

// Ensure directories exist
[config.screenshotDir, config.outputDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// === SCREENSHOTS ===
async function captureScreenshots(site) {
  console.log(`\n📸 Screenshots: ${site.label}`);
  const browser = await chromium.launch({ headless: true });

  for (const [deviceName, viewport] of Object.entries(config.viewports)) {
    const contextOpts = {
      viewport: { width: viewport.width, height: viewport.height },
    };
    if (viewport.isMobile) contextOpts.isMobile = true;
    if (viewport.hasTouch) contextOpts.hasTouch = true;
    if (viewport.userAgent) contextOpts.userAgent = viewport.userAgent;

    const context = await browser.newContext(contextOpts);
    const page = await context.newPage();

    try {
      await page.goto(site.url, { waitUntil: 'networkidle', timeout: 30000 });

      // Try to dismiss cookie banners
      for (const selector of config.cookieSelectors) {
        try {
          const btn = await page.$(selector);
          if (btn) { await btn.click(); await sleep(500); break; }
        } catch (e) { /* ignore */ }
      }

      await sleep(1000);

      // Viewport screenshot
      const vpPath = path.join(config.screenshotDir, `${site.name}-${deviceName}-viewport.png`);
      await page.screenshot({ path: vpPath, type: 'png' });
      console.log(`  ✓ ${site.name}-${deviceName}-viewport.png`);

      // Full page screenshot
      const fpPath = path.join(config.screenshotDir, `${site.name}-${deviceName}-fullpage.png`);
      await page.screenshot({ path: fpPath, fullPage: true, type: 'png' });
      console.log(`  ✓ ${site.name}-${deviceName}-fullpage.png`);
    } catch (err) {
      console.error(`  ✗ ${site.name}-${deviceName}: ${err.message}`);
    }

    await context.close();
    await sleep(config.delayBetweenRequests);
  }

  await browser.close();
}

// === LIGHT AUDIT ===
async function auditSite(site) {
  console.log(`\n🔍 Audit: ${site.label}`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const audit = {
    site: site.label,
    url: site.url,
    sector: site.sector,
    type: site.type,
    timestamp: new Date().toISOString(),
    performance: {},
    security: {},
    stack: {},
    seo: {},
  };

  try {
    // Performance timing
    const startTime = Date.now();
    const response = await page.goto(site.url, { waitUntil: 'load', timeout: 30000 });
    const loadTime = Date.now() - startTime;

    // TTFB from performance API
    const perfTiming = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      if (!nav) return null;
      return {
        ttfb: Math.round(nav.responseStart - nav.requestStart),
        domContentLoaded: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
        load: Math.round(nav.loadEventEnd - nav.startTime),
      };
    });
    audit.performance = perfTiming || { ttfb: null, domContentLoaded: null, load: loadTime };

    // Security headers
    const headers = response.headers();
    const securityHeaders = {
      'x-frame-options': headers['x-frame-options'] || null,
      'content-security-policy': headers['content-security-policy'] || null,
      'strict-transport-security': headers['strict-transport-security'] || null,
      'x-content-type-options': headers['x-content-type-options'] || null,
    };
    const presentCount = Object.values(securityHeaders).filter(Boolean).length;
    audit.security = { headers: securityHeaders, score: `${presentCount}/4` };

    // SSL (if we got here via HTTPS without error, SSL is valid)
    audit.security.ssl = site.url.startsWith('https') ? 'Valide' : 'Non HTTPS';

    // Stack detection
    const html = await page.content();
    audit.stack.wordpress = html.includes('wp-content') || html.includes('wp-includes');
    audit.stack.woocommerce = html.includes('woocommerce') || html.includes('wc-');
    audit.stack.generator = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="generator"]');
      return meta ? meta.content : null;
    });

    // Plugin detection (from wp-content/plugins/ paths)
    const pluginMatches = html.match(/wp-content\/plugins\/([a-z0-9_-]+)/gi) || [];
    const plugins = [...new Set(pluginMatches.map(m => m.replace('wp-content/plugins/', '')))];
    audit.stack.plugins = plugins;
    audit.stack.pluginCount = plugins.length;

    // SEO checks
    const seoData = await page.evaluate(() => {
      const title = document.title || '';
      const metaDesc = document.querySelector('meta[name="description"]');
      const canonical = document.querySelector('link[rel="canonical"]');
      const ogTitle = document.querySelector('meta[property="og:title"]');
      const h1s = document.querySelectorAll('h1');
      return {
        title: title,
        hasMetaDescription: !!metaDesc,
        hasCanonical: !!canonical,
        hasOgTitle: !!ogTitle,
        h1Count: h1s.length,
      };
    });
    audit.seo = seoData;

    // Check robots.txt
    try {
      const robotsUrl = new URL('/robots.txt', site.url).href;
      const robotsResp = await page.goto(robotsUrl, { timeout: 10000 });
      audit.seo.hasRobotsTxt = robotsResp && robotsResp.status() === 200;
    } catch (e) { audit.seo.hasRobotsTxt = false; }

    // Check sitemap.xml
    try {
      const sitemapUrl = new URL('/sitemap.xml', site.url).href;
      const sitemapResp = await page.goto(sitemapUrl, { timeout: 10000 });
      audit.seo.hasSitemapXml = sitemapResp && sitemapResp.status() === 200;
    } catch (e) { audit.seo.hasSitemapXml = false; }

  } catch (err) {
    console.error(`  ✗ Audit failed: ${err.message}`);
    audit.error = err.message;
  }

  await browser.close();

  // Save JSON
  const jsonPath = path.join(config.outputDir, `${site.name}-audit.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(audit, null, 2));
  console.log(`  ✓ ${site.name}-audit.json`);

  return audit;
}

// === CASE STUDY MARKDOWN ===
function generateCaseStudy(site, audit) {
  console.log(`\n📝 Case study: ${site.label}`);

  const headersScore = audit.security ? audit.security.score : '?/4';
  const ttfb = audit.performance ? audit.performance.ttfb : '?';
  const domLoaded = audit.performance ? audit.performance.domContentLoaded : '?';
  const loadTime = audit.performance ? audit.performance.load : '?';
  const ssl = audit.security ? audit.security.ssl : '?';
  const stack = audit.stack || {};
  const stackLabel = stack.wordpress ? 'WordPress' + (stack.woocommerce ? ' + WooCommerce' : '') : 'Non WordPress';
  const pluginCount = stack.pluginCount || 0;

  const md = `# Etude de cas : ${site.label}

## Le client

- **Site** : ${site.url}
- **Secteur** : ${site.sector}
- **Type** : ${site.type}
- **Stack** : ${stackLabel}
- **Plugins detectes** : ${pluginCount}

## Avant l'intervention

> Ces donnees sont a remplir manuellement a partir de vos archives.

- **TTFB** : [TODO] ms
- **Score performance (Lighthouse)** : [TODO] /100
- **Score securite (headers)** : [TODO] /4
- **Problemes identifies** :
  - [TODO — Probleme 1]
  - [TODO — Probleme 2]
  - [TODO — Probleme 3]

## Notre intervention

[TODO — Decrire l'intervention realisee pour ce client]

- Audit technique complet (performance, securite, SEO, stabilite)
- [TODO — Actions specifiques]

## Resultats (etat actuel)

| Metrique | Valeur |
|----------|--------|
| TTFB | ${ttfb} ms |
| DOMContentLoaded | ${domLoaded} ms |
| Load | ${loadTime} ms |
| Headers securite | ${headersScore} |
| SSL | ${ssl} |
| Stack | ${stackLabel} |
| Plugins detectes | ${pluginCount} |

## Temoignage

> [TODO — Ajouter le temoignage client]
>
> — [TODO — Nom], [TODO — Role] chez ${site.label}

## Screenshots

### Desktop
![${site.label} — Desktop](../screenshots/${site.name}-desktop-viewport.png)

### Mobile
![${site.label} — Mobile](../screenshots/${site.name}-mobile-viewport.png)
`;

  const mdPath = path.join(config.outputDir, `${site.name}-case-study.md`);
  fs.writeFileSync(mdPath, md);
  console.log(`  ✓ ${site.name}-case-study.md`);
}

// === MAIN ===
async function main() {
  console.log('=== QuantumDev Case Studies Capture ===\n');
  console.log(`Sites: ${config.sites.length}`);

  for (const site of config.sites) {
    await captureScreenshots(site);
    await sleep(config.delayBetweenRequests);
    const audit = await auditSite(site);
    await sleep(config.delayBetweenRequests);
    generateCaseStudy(site, audit);
    await sleep(config.delayBetweenRequests);
  }

  console.log('\n=== Done ===');
  console.log(`Screenshots: ${config.screenshotDir}/`);
  console.log(`Audits + Case studies: ${config.outputDir}/`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
```

**Step 2: Run the capture tool**

Run: `cd tools/case-studies && node capture.js`
Expected: 12 PNG screenshots in `screenshots/`, 3 JSON audits in `output/`, 3 Markdown case studies in `output/`.

**Step 3: Verify output**

Run: `ls tools/case-studies/screenshots/ && ls tools/case-studies/output/`
Expected:
```
screenshots:
  vivrelebassin-desktop-fullpage.png
  vivrelebassin-desktop-viewport.png
  vivrelebassin-mobile-fullpage.png
  vivrelebassin-mobile-viewport.png
  urbanartsmag-desktop-fullpage.png
  urbanartsmag-desktop-viewport.png
  urbanartsmag-mobile-fullpage.png
  urbanartsmag-mobile-viewport.png
  labomaison-desktop-fullpage.png
  labomaison-desktop-viewport.png
  labomaison-mobile-fullpage.png
  labomaison-mobile-viewport.png
output:
  vivrelebassin-audit.json
  urbanartsmag-audit.json
  labomaison-audit.json
  vivrelebassin-case-study.md
  urbanartsmag-case-study.md
  labomaison-case-study.md
```

**Step 4: Commit**

```bash
git add tools/case-studies/capture.js
git commit -m "feat: add case studies capture tool (screenshots + audit + markdown)"
```

---

## Task 3: Register CPT `qd_case_study` + meta box

**Files:**
- Create: `quantum_dev_corporate/inc/case-studies.php`
- Modify: `quantum_dev_corporate/functions.php` (add to includes array)

**Step 1: Create `inc/case-studies.php`**

```php
<?php
/**
 * Case Studies Custom Post Type + Meta Box
 *
 * @package QuantumDev_Corporate
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// === REGISTER CPT ===
add_action( 'init', 'qd_register_case_study_cpt' );
function qd_register_case_study_cpt() {
    register_post_type( 'qd_case_study', array(
        'labels' => array(
            'name'               => 'Etudes de cas',
            'singular_name'      => 'Etude de cas',
            'add_new'            => 'Ajouter',
            'add_new_item'       => 'Ajouter une etude de cas',
            'edit_item'          => 'Modifier l\'etude de cas',
            'view_item'          => 'Voir l\'etude de cas',
            'search_items'       => 'Rechercher',
            'not_found'          => 'Aucune etude de cas trouvee',
        ),
        'public'       => true,
        'has_archive'  => false,
        'rewrite'      => array( 'slug' => 'projets', 'with_front' => false ),
        'menu_icon'    => 'dashicons-portfolio',
        'supports'     => array( 'title', 'thumbnail' ),
        'show_in_rest' => false,
    ) );
}

// === META BOX ===
add_action( 'add_meta_boxes', 'qd_case_study_meta_box' );
function qd_case_study_meta_box() {
    add_meta_box(
        'qd_case_study_details',
        'Details de l\'etude de cas',
        'qd_case_study_meta_box_html',
        'qd_case_study',
        'normal',
        'high'
    );
}

function qd_case_study_meta_box_html( $post ) {
    wp_nonce_field( 'qd_case_study_meta', 'qd_case_study_nonce' );

    $fields = qd_case_study_fields();
    foreach ( $fields as $key => $field ) {
        $value = get_post_meta( $post->ID, $key, true );
        $id = esc_attr( str_replace( '_', '-', $key ) );
        echo '<p>';
        echo '<label for="' . $id . '"><strong>' . esc_html( $field['label'] ) . '</strong></label><br>';
        if ( 'textarea' === $field['type'] ) {
            echo '<textarea id="' . $id . '" name="' . esc_attr( $key ) . '" rows="3" style="width:100%">' . esc_textarea( $value ) . '</textarea>';
        } elseif ( 'image' === $field['type'] ) {
            $img_url = $value ? wp_get_attachment_image_url( $value, 'thumbnail' ) : '';
            echo '<input type="hidden" id="' . $id . '" name="' . esc_attr( $key ) . '" value="' . esc_attr( $value ) . '">';
            echo '<div id="' . $id . '-preview">' . ( $img_url ? '<img src="' . esc_url( $img_url ) . '" style="max-width:150px;display:block;margin:4px 0">' : '' ) . '</div>';
            echo '<button type="button" class="button qd-upload-btn" data-target="' . $id . '">Choisir une image</button>';
        } else {
            echo '<input type="' . esc_attr( $field['type'] ) . '" id="' . $id . '" name="' . esc_attr( $key ) . '" value="' . esc_attr( $value ) . '" style="width:100%">';
        }
        if ( ! empty( $field['desc'] ) ) {
            echo '<span class="description">' . esc_html( $field['desc'] ) . '</span>';
        }
        echo '</p>';
    }

    // Inline script for media uploader
    ?>
    <script>
    jQuery(function($) {
        $('.qd-upload-btn').on('click', function(e) {
            e.preventDefault();
            var target = $(this).data('target');
            var frame = wp.media({ title: 'Choisir une image', multiple: false, library: { type: 'image' } });
            frame.on('select', function() {
                var attachment = frame.state().get('selection').first().toJSON();
                $('#' + target).val(attachment.id);
                $('#' + target + '-preview').html('<img src="' + attachment.sizes.thumbnail.url + '" style="max-width:150px;display:block;margin:4px 0">');
            });
            frame.open();
        });
    });
    </script>
    <?php
}

function qd_case_study_fields() {
    return array(
        '_qd_cs_url'             => array( 'label' => 'URL du site', 'type' => 'url', 'desc' => '' ),
        '_qd_cs_sector'          => array( 'label' => 'Secteur', 'type' => 'text', 'desc' => 'Ex : Media local, Art urbain' ),
        '_qd_cs_type'            => array( 'label' => 'Type de site', 'type' => 'text', 'desc' => 'Ex : Magazine en ligne' ),
        '_qd_cs_stack'           => array( 'label' => 'Stack technique', 'type' => 'text', 'desc' => 'Ex : WordPress' ),
        '_qd_cs_before_ttfb'     => array( 'label' => 'TTFB avant (ms)', 'type' => 'text', 'desc' => '' ),
        '_qd_cs_before_perf'     => array( 'label' => 'Score perf avant (/100)', 'type' => 'text', 'desc' => '' ),
        '_qd_cs_before_issues'   => array( 'label' => 'Problemes identifies (avant)', 'type' => 'textarea', 'desc' => 'Un par ligne' ),
        '_qd_cs_after_ttfb'      => array( 'label' => 'TTFB apres (ms)', 'type' => 'text', 'desc' => '' ),
        '_qd_cs_after_headers'   => array( 'label' => 'Headers securite apres', 'type' => 'text', 'desc' => 'Ex : 3/4' ),
        '_qd_cs_after_ssl'       => array( 'label' => 'SSL apres', 'type' => 'text', 'desc' => 'Ex : Valide' ),
        '_qd_cs_intervention'    => array( 'label' => 'Description intervention', 'type' => 'textarea', 'desc' => '' ),
        '_qd_cs_testimonial'     => array( 'label' => 'Temoignage client', 'type' => 'textarea', 'desc' => '' ),
        '_qd_cs_testimonial_author' => array( 'label' => 'Auteur du temoignage', 'type' => 'text', 'desc' => 'Nom, Role' ),
        '_qd_cs_screenshot_mobile' => array( 'label' => 'Screenshot mobile', 'type' => 'image', 'desc' => 'Le screenshot desktop = image mise en avant' ),
    );
}

// === SAVE META ===
add_action( 'save_post_qd_case_study', 'qd_save_case_study_meta' );
function qd_save_case_study_meta( $post_id ) {
    if ( ! isset( $_POST['qd_case_study_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['qd_case_study_nonce'] ) ), 'qd_case_study_meta' ) ) {
        return;
    }
    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) return;
    if ( ! current_user_can( 'edit_post', $post_id ) ) return;

    $fields = qd_case_study_fields();
    foreach ( $fields as $key => $field ) {
        if ( ! isset( $_POST[ $key ] ) ) continue;
        if ( 'textarea' === $field['type'] ) {
            update_post_meta( $post_id, $key, sanitize_textarea_field( wp_unslash( $_POST[ $key ] ) ) );
        } elseif ( 'url' === $field['type'] ) {
            update_post_meta( $post_id, $key, esc_url_raw( wp_unslash( $_POST[ $key ] ) ) );
        } elseif ( 'image' === $field['type'] ) {
            update_post_meta( $post_id, $key, absint( $_POST[ $key ] ) );
        } else {
            update_post_meta( $post_id, $key, sanitize_text_field( wp_unslash( $_POST[ $key ] ) ) );
        }
    }
}

// === ENQUEUE MEDIA UPLOADER ON CPT EDIT SCREEN ===
add_action( 'admin_enqueue_scripts', 'qd_case_study_admin_scripts' );
function qd_case_study_admin_scripts( $hook ) {
    global $post_type;
    if ( 'qd_case_study' === $post_type && in_array( $hook, array( 'post.php', 'post-new.php' ), true ) ) {
        wp_enqueue_media();
    }
}
```

**Step 2: Add include in functions.php**

In `quantum_dev_corporate/functions.php`, add `'inc/case-studies.php'` to the `$qd_includes` array, after `'inc/analytics.php'`.

**Step 3: Commit**

```bash
git add quantum_dev_corporate/inc/case-studies.php quantum_dev_corporate/functions.php
git commit -m "feat: register qd_case_study CPT with native meta box"
```

---

## Task 4: Homepage section — "Projets clients"

**Files:**
- Modify: `quantum_dev_corporate/front-page.php` (insert section between testimonials and maintenance teaser)
- Modify: `quantum_dev_corporate/style.css` (add case study card styles)

**Step 1: Add the case studies section in front-page.php**

Insert the following section **after** the closing `</section>` of "Social Proof Section" (line ~194) and **before** the "Maintenance Teaser" section comment (line ~196):

```php
<!-- Case Studies Section -->
<?php
$case_studies = new WP_Query( array(
    'post_type'      => 'qd_case_study',
    'posts_per_page' => 3,
    'post_status'    => 'publish',
    'orderby'        => 'date',
    'order'          => 'DESC',
) );

if ( $case_studies->have_posts() ) :
?>
<section class="cool">
    <div class="container">
        <div class="text-center">
            <div class="section-eyebrow">Realisations</div>
            <h2 class="section-title">Sites que nous auditons et maintenons</h2>
        </div>
        <div class="card-grid-3">
            <?php while ( $case_studies->have_posts() ) : $case_studies->the_post(); ?>
                <?php
                $cs_sector = get_post_meta( get_the_ID(), '_qd_cs_sector', true );
                $cs_url    = get_post_meta( get_the_ID(), '_qd_cs_url', true );
                ?>
                <article class="card case-study-card">
                    <?php if ( has_post_thumbnail() ) : ?>
                        <a href="<?php the_permalink(); ?>" class="case-study-thumb" aria-hidden="true" tabindex="-1">
                            <?php the_post_thumbnail( 'medium_large', array(
                                'loading' => 'lazy',
                                'alt'     => sprintf( 'Screenshot de %s', get_the_title() ),
                            ) ); ?>
                        </a>
                    <?php endif; ?>
                    <?php if ( $cs_sector ) : ?>
                        <div class="case-study-chip"><?php echo esc_html( $cs_sector ); ?></div>
                    <?php endif; ?>
                    <h3 class="case-study-title">
                        <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
                    </h3>
                    <?php if ( $cs_url ) : ?>
                        <p class="case-study-url"><?php echo esc_html( wp_parse_url( $cs_url, PHP_URL_HOST ) ); ?></p>
                    <?php endif; ?>
                    <a href="<?php the_permalink(); ?>" class="case-study-link">Voir l'etude de cas →</a>
                </article>
            <?php endwhile; ?>
        </div>
    </div>
</section>
<?php
wp_reset_postdata();
endif;
?>
```

**Step 2: Add CSS styles for case study cards**

Append to `style.css`, before the responsive media queries section:

```css
/* === CASE STUDY CARDS (Homepage) === */
.case-study-card {
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.case-study-thumb {
  display: block;
  overflow: hidden;
  aspect-ratio: 16 / 10;
}

.case-study-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.case-study-card:hover .case-study-thumb img {
  transform: scale(1.03);
}

.case-study-chip {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--primary);
  background: var(--primary-dim);
  padding: 0.25rem 0.75rem;
  border-radius: 100px;
  margin: 1.25rem 1.5rem 0;
}

.case-study-title {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0.5rem 1.5rem 0;
}

.case-study-title a {
  color: var(--text);
  text-decoration: none;
}

.case-study-title a:hover {
  color: var(--primary);
}

.case-study-url {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0.25rem 1.5rem 0;
}

.case-study-link {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--primary);
  text-decoration: none;
  padding: 0 1.5rem 1.5rem;
  margin-top: auto;
}

.case-study-link:hover {
  color: var(--accent);
}
```

**Step 3: Commit**

```bash
git add quantum_dev_corporate/front-page.php quantum_dev_corporate/style.css
git commit -m "feat: add case studies section to homepage"
```

---

## Task 5: Single template — `single-qd_case_study.php`

**Files:**
- Create: `quantum_dev_corporate/single-qd_case_study.php`
- Modify: `quantum_dev_corporate/style.css` (add single case study styles)

**Step 1: Create the single template**

```php
<?php
/**
 * Single Case Study Template
 *
 * @package QuantumDev_Corporate
 */

get_header();

while ( have_posts() ) :
    the_post();

    $cs_url        = get_post_meta( get_the_ID(), '_qd_cs_url', true );
    $cs_sector     = get_post_meta( get_the_ID(), '_qd_cs_sector', true );
    $cs_type       = get_post_meta( get_the_ID(), '_qd_cs_type', true );
    $cs_stack      = get_post_meta( get_the_ID(), '_qd_cs_stack', true );
    $before_ttfb   = get_post_meta( get_the_ID(), '_qd_cs_before_ttfb', true );
    $before_perf   = get_post_meta( get_the_ID(), '_qd_cs_before_perf', true );
    $before_issues = get_post_meta( get_the_ID(), '_qd_cs_before_issues', true );
    $after_ttfb    = get_post_meta( get_the_ID(), '_qd_cs_after_ttfb', true );
    $after_headers = get_post_meta( get_the_ID(), '_qd_cs_after_headers', true );
    $after_ssl     = get_post_meta( get_the_ID(), '_qd_cs_after_ssl', true );
    $intervention  = get_post_meta( get_the_ID(), '_qd_cs_intervention', true );
    $testimonial   = get_post_meta( get_the_ID(), '_qd_cs_testimonial', true );
    $testimonial_a = get_post_meta( get_the_ID(), '_qd_cs_testimonial_author', true );
    $mobile_id     = get_post_meta( get_the_ID(), '_qd_cs_screenshot_mobile', true );
?>

<!-- Breadcrumb -->
<nav class="breadcrumb" aria-label="Fil d'Ariane">
    <a href="<?php echo esc_url( home_url( '/' ) ); ?>">Accueil</a>
    <span>›</span>
    <span><?php the_title(); ?></span>
</nav>

<!-- Hero -->
<header class="hero hero-sm">
    <?php if ( $cs_sector ) : ?>
        <div class="hero-chip"><?php echo esc_html( $cs_sector ); ?></div>
    <?php endif; ?>
    <h1 class="smaller"><?php the_title(); ?></h1>
    <?php if ( $cs_url ) : ?>
        <p class="hero-sub">
            <a href="<?php echo esc_url( $cs_url ); ?>" target="_blank" rel="noopener noreferrer" class="text-primary">
                <?php echo esc_html( wp_parse_url( $cs_url, PHP_URL_HOST ) ); ?> ↗
            </a>
        </p>
    <?php endif; ?>
</header>

<!-- Client Info -->
<section class="warm">
    <div class="container-narrow">
        <div class="section-eyebrow">Le client</div>
        <div class="cs-info-grid">
            <?php if ( $cs_type ) : ?>
                <div class="cs-info-item">
                    <div class="cs-info-label">Type</div>
                    <div class="cs-info-value"><?php echo esc_html( $cs_type ); ?></div>
                </div>
            <?php endif; ?>
            <?php if ( $cs_sector ) : ?>
                <div class="cs-info-item">
                    <div class="cs-info-label">Secteur</div>
                    <div class="cs-info-value"><?php echo esc_html( $cs_sector ); ?></div>
                </div>
            <?php endif; ?>
            <?php if ( $cs_stack ) : ?>
                <div class="cs-info-item">
                    <div class="cs-info-label">Stack</div>
                    <div class="cs-info-value"><?php echo esc_html( $cs_stack ); ?></div>
                </div>
            <?php endif; ?>
        </div>
    </div>
</section>

<!-- Before / After -->
<?php if ( $before_ttfb || $before_perf || $after_ttfb || $after_headers ) : ?>
<section>
    <div class="container-narrow">
        <div class="cs-compare-grid">
            <?php if ( $before_ttfb || $before_perf || $before_issues ) : ?>
            <div class="cs-compare-col cs-before">
                <div class="section-eyebrow">Avant</div>
                <h2 class="cs-compare-title">Etat initial</h2>
                <?php if ( $before_ttfb ) : ?>
                    <div class="cs-metric"><span class="cs-metric-label">TTFB</span> <span class="cs-metric-value"><?php echo esc_html( $before_ttfb ); ?> ms</span></div>
                <?php endif; ?>
                <?php if ( $before_perf ) : ?>
                    <div class="cs-metric"><span class="cs-metric-label">Performance</span> <span class="cs-metric-value"><?php echo esc_html( $before_perf ); ?>/100</span></div>
                <?php endif; ?>
                <?php if ( $before_issues ) : ?>
                    <div class="cs-issues">
                        <strong>Problemes identifies :</strong>
                        <ul>
                            <?php foreach ( explode( "\n", $before_issues ) as $issue ) :
                                $issue = trim( $issue );
                                if ( $issue ) : ?>
                                    <li><?php echo esc_html( $issue ); ?></li>
                                <?php endif;
                            endforeach; ?>
                        </ul>
                    </div>
                <?php endif; ?>
            </div>
            <?php endif; ?>

            <?php if ( $after_ttfb || $after_headers || $after_ssl ) : ?>
            <div class="cs-compare-col cs-after">
                <div class="section-eyebrow">Apres</div>
                <h2 class="cs-compare-title">Etat actuel</h2>
                <?php if ( $after_ttfb ) : ?>
                    <div class="cs-metric"><span class="cs-metric-label">TTFB</span> <span class="cs-metric-value cs-metric-good"><?php echo esc_html( $after_ttfb ); ?> ms</span></div>
                <?php endif; ?>
                <?php if ( $after_headers ) : ?>
                    <div class="cs-metric"><span class="cs-metric-label">Headers securite</span> <span class="cs-metric-value"><?php echo esc_html( $after_headers ); ?></span></div>
                <?php endif; ?>
                <?php if ( $after_ssl ) : ?>
                    <div class="cs-metric"><span class="cs-metric-label">SSL</span> <span class="cs-metric-value cs-metric-good"><?php echo esc_html( $after_ssl ); ?></span></div>
                <?php endif; ?>
            </div>
            <?php endif; ?>
        </div>
    </div>
</section>
<?php endif; ?>

<!-- Intervention -->
<?php if ( $intervention ) : ?>
<section class="cool">
    <div class="container-narrow">
        <div class="section-eyebrow">Notre intervention</div>
        <h2 class="section-title">Ce que nous avons fait</h2>
        <div class="cs-intervention">
            <?php echo wp_kses_post( wpautop( $intervention ) ); ?>
        </div>
    </div>
</section>
<?php endif; ?>

<!-- Screenshots -->
<?php if ( has_post_thumbnail() || $mobile_id ) : ?>
<section>
    <div class="container">
        <div class="text-center">
            <div class="section-eyebrow">Captures</div>
            <h2 class="section-title">Le site en images</h2>
        </div>
        <div class="cs-screenshots">
            <?php if ( has_post_thumbnail() ) : ?>
                <figure class="cs-screenshot cs-screenshot-desktop">
                    <?php the_post_thumbnail( 'large', array(
                        'loading' => 'lazy',
                        'alt'     => sprintf( '%s — Desktop', get_the_title() ),
                    ) ); ?>
                    <figcaption>Version desktop</figcaption>
                </figure>
            <?php endif; ?>
            <?php if ( $mobile_id ) : ?>
                <figure class="cs-screenshot cs-screenshot-mobile">
                    <?php echo wp_get_attachment_image( $mobile_id, 'medium', false, array(
                        'loading' => 'lazy',
                        'alt'     => sprintf( '%s — Mobile', get_the_title() ),
                    ) ); ?>
                    <figcaption>Version mobile</figcaption>
                </figure>
            <?php endif; ?>
        </div>
    </div>
</section>
<?php endif; ?>

<!-- Testimonial -->
<?php if ( $testimonial ) : ?>
<section class="warm">
    <div class="container-narrow text-center">
        <div class="section-eyebrow">Temoignage</div>
        <blockquote class="cs-testimonial">
            <p><?php echo esc_html( $testimonial ); ?></p>
            <?php if ( $testimonial_a ) : ?>
                <cite>— <?php echo esc_html( $testimonial_a ); ?></cite>
            <?php endif; ?>
        </blockquote>
    </div>
</section>
<?php endif; ?>

<!-- CTA -->
<section class="cta-final">
    <div class="container-narrow">
        <h2 class="section-title">Votre site merite le meme traitement.</h2>
        <a href="<?php echo esc_url( home_url( '/diagnostic/' ) ); ?>" class="btn-primary btn-white">Demander un diagnostic technique →</a>
        <p class="cta-subtext">200 € — Rapport PDF + debrief 30 min.</p>
    </div>
</section>

<?php
endwhile;
get_footer();
?>
```

**Step 2: Add CSS for single case study page**

Append to `style.css` (before responsive media queries):

```css
/* === CASE STUDY SINGLE === */
.cs-info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.cs-info-label {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}

.cs-info-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text);
}

.cs-compare-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 1.5rem;
}

.cs-compare-title {
  font-family: var(--font-display);
  font-size: 1.2rem;
  margin: 0.5rem 0 1rem;
}

.cs-before {
  padding: 1.5rem;
  background: var(--danger-bg);
  border-radius: var(--radius);
}

.cs-after {
  padding: 1.5rem;
  background: var(--success-bg);
  border-radius: var(--radius);
}

.cs-metric {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border);
}

.cs-metric-label {
  color: var(--text-secondary);
}

.cs-metric-value {
  font-weight: 600;
}

.cs-metric-good {
  color: var(--success);
}

.cs-issues ul {
  margin: 0.5rem 0 0 1.25rem;
  padding: 0;
}

.cs-issues li {
  margin-bottom: 0.25rem;
  color: var(--text-secondary);
}

.cs-intervention {
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--text-secondary);
}

.cs-screenshots {
  display: flex;
  gap: 2rem;
  justify-content: center;
  align-items: flex-start;
  margin-top: 2rem;
}

.cs-screenshot {
  margin: 0;
  text-align: center;
}

.cs-screenshot img {
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
  max-width: 100%;
  height: auto;
}

.cs-screenshot-desktop {
  flex: 2;
  max-width: 700px;
}

.cs-screenshot-mobile {
  flex: 0 0 auto;
  max-width: 200px;
}

.cs-screenshot figcaption {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 0.5rem;
}

.cs-testimonial {
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-style: italic;
  color: var(--text);
  max-width: 700px;
  margin: 1.5rem auto 0;
}

.cs-testimonial cite {
  display: block;
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-style: normal;
  color: var(--text-muted);
  margin-top: 1rem;
}
```

**Step 3: Add responsive styles**

Append inside the existing `@media (max-width: 768px)` block:

```css
.cs-info-grid {
  grid-template-columns: 1fr;
}

.cs-compare-grid {
  grid-template-columns: 1fr;
}

.cs-screenshots {
  flex-direction: column;
  align-items: center;
}

.cs-screenshot-desktop {
  max-width: 100%;
}

.cs-screenshot-mobile {
  max-width: 160px;
}
```

**Step 4: Commit**

```bash
git add quantum_dev_corporate/single-qd_case_study.php quantum_dev_corporate/style.css
git commit -m "feat: add single case study template with breadcrumb and before/after"
```

---

## Task 6: SEO — Schema JSON-LD + meta description for case studies

**Files:**
- Modify: `quantum_dev_corporate/inc/seo.php`

**Step 1: Add case study schema in `qd_seo_schema_jsonld()`**

Inside the function, after the `is_single()` BlogPosting block (~line 253) and before the BreadcrumbList block, add:

```php
// Case Study single: Article schema
if ( is_singular( 'qd_case_study' ) ) {
    $cs_url = get_post_meta( get_the_ID(), '_qd_cs_url', true );
    $schema[] = array(
        '@context' => 'https://schema.org',
        '@type'    => 'Article',
        'headline' => get_the_title(),
        'datePublished' => get_the_date( 'c' ),
        'dateModified'  => get_the_modified_date( 'c' ),
        'author' => array(
            '@type' => 'Organization',
            'name'  => 'QuantumDev',
            'url'   => home_url( '/' ),
        ),
        'about' => array(
            '@type' => 'Service',
            'name'  => 'Audit technique WordPress',
            'provider' => array(
                '@type' => 'Organization',
                'name'  => 'QuantumDev',
            ),
        ),
    );
}
```

**Step 2: Update BreadcrumbList to handle case study singles**

The existing BreadcrumbList already works for pages via `is_page()`. Case study singles will also be caught by `!is_front_page()` and fall into the `is_page()` check — but `is_page()` returns false for CPTs. We need to also handle `is_singular('qd_case_study')`.

In the BreadcrumbList block (~line 256), after the `if (is_page())` block, add:

```php
if ( is_singular( 'qd_case_study' ) ) {
    $breadcrumbs[] = array(
        '@type'    => 'ListItem',
        'position' => 2,
        'name'     => get_the_title(),
        'item'     => get_permalink(),
    );
}
```

**Step 3: Add meta description for case studies in `qd_get_meta_description()`**

Add before the `is_single()` check:

```php
if ( is_singular( 'qd_case_study' ) ) {
    $cs_sector = get_post_meta( get_the_ID(), '_qd_cs_sector', true );
    return sprintf( 'Etude de cas : %s — %s. Audit technique et maintenance WordPress par QuantumDev.', get_the_title(), $cs_sector );
}
```

**Step 4: Commit**

```bash
git add quantum_dev_corporate/inc/seo.php
git commit -m "feat: add SEO schema + meta description for case study singles"
```

---

## Task 7: Run capture tool, upload screenshots, create case study posts

**Step 1: Run the capture tool**

Run: `cd tools/case-studies && node capture.js`
Expected: 12 PNGs + 3 JSONs + 3 MDs generated.

**Step 2: Copy viewport screenshots to theme assets**

Run:
```bash
mkdir -p quantum_dev_corporate/assets/img/case-studies
cp tools/case-studies/screenshots/*-desktop-viewport.png quantum_dev_corporate/assets/img/case-studies/
cp tools/case-studies/screenshots/*-mobile-viewport.png quantum_dev_corporate/assets/img/case-studies/
```

**Step 3: Review generated Markdown case studies**

Read each `tools/case-studies/output/*-case-study.md` and note the "after" metrics to enter in the WP admin when creating posts.

**Step 4: Commit assets**

```bash
git add quantum_dev_corporate/assets/img/case-studies/ tools/case-studies/output/ tools/case-studies/screenshots/
git commit -m "feat: add captured screenshots and audit data for 3 client sites"
```

**Step 5: Create WP posts (manual)**

In WP admin:
1. Go to "Etudes de cas" → "Ajouter"
2. Create 3 posts (Vivre le Bassin, Urban Arts Magazine, LaboMaison)
3. Fill meta fields from the generated audit JSON/MD
4. Upload desktop viewport as featured image, mobile viewport as screenshot mobile
5. Flush permalinks: Settings → Permalinks → Save (needed after CPT registration)

---

## Task 8: Final verification

**Step 1: Verify homepage renders case studies section**

Navigate to homepage. Between testimonials and maintenance teaser, confirm 3 case study cards appear with screenshot, sector chip, title, domain, and "Voir" link.

**Step 2: Verify single page**

Click a case study card. Confirm:
- Breadcrumb: `Accueil › {titre}` with working link back to homepage
- Hero with sector chip and external link to client site
- Client info grid (type, sector, stack)
- Before/after metrics (or just "after" if before not filled yet)
- Screenshots desktop + mobile
- CTA final with diagnostic link

**Step 3: Verify SEO**

View page source on a case study single. Confirm:
- `<meta name="description">` present with case study text
- `<script type="application/ld+json">` contains `Article` schema
- `BreadcrumbList` schema with Accueil + case study name
- `og:image` points to featured image
- `<meta name="robots" content="index, follow">`

**Step 4: Verify accessibility**

- Breadcrumb has `aria-label="Fil d'Ariane"`
- Images have meaningful `alt` attributes
- Cards use `<h3>` with `<a>` inside (not div wrapping link)
- All interactive elements are keyboard-navigable

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat: case studies — homepage section + singles + SEO + capture tool"
```

---

Plan complete and saved to `docs/plans/2026-02-25-case-studies-implementation.md`. Two execution options:

**1. Subagent-Driven (this session)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** — Open new session with executing-plans, batch execution with checkpoints

Which approach?