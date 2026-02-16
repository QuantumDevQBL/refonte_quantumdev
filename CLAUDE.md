# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WordPress theme for QuantumDev (quantumdev.fr), a French company offering WordPress technical services (audits, maintenance, diagnostics). Built on the Underscores (_s) starter theme with custom service-oriented pages.

**Theme Name**: `quantum_dev_corporate`
**Text Domain**: `quantum_dev_corporate`
**Primary Language**: French (fr)

## Development Setup

### Prerequisites
- Node.js (for SASS compilation and build tools)
- Composer (for PHP dependencies and linting)
- WordPress 4.5+ environment
- PHP 5.6+

### Installation
```bash
cd quantum_dev_corporate
composer install
npm install
```

## Common Development Commands

### CSS Development
```bash
npm run watch              # Watch SASS files and auto-compile (requires sass/ directory)
npm run compile:css        # Compile SASS to CSS with linting
npm run compile:rtl        # Generate RTL stylesheet
npm run lint:scss          # Lint SASS files
```

### PHP Development
```bash
composer lint:wpcs         # Check PHP against WordPress Coding Standards
composer lint:php          # Check PHP syntax errors
composer make-pot          # Generate translation .pot file in languages/
```

### JavaScript
```bash
npm run lint:js            # Lint JavaScript files
```

### Distribution
```bash
npm run bundle             # Create .zip archive for theme distribution
```

## Architecture

### Core Theme Structure

**Main entry point**: `functions.php` - Registers theme supports, enqueues scripts/styles, and includes all modular functionality.

**Modular functionality** (`inc/` directory):
- `custom-header.php` - Custom header implementation
- `template-tags.php` - Custom template tags to keep templates clean and DRY
- `template-functions.php` - Theme enhancement functions
- `customizer.php` - WordPress Customizer additions
- `jetpack.php` - Jetpack compatibility (loaded conditionally)

### Template System

Standard WordPress template hierarchy with custom template parts in `template-parts/`:
- `content.php` - Default post content template
- `content-page.php` - Page content template
- `content-search.php` - Search results template
- `content-none.php` - No content found template

### Static HTML Wireframes

The `page_wireframes/` directory contains **7 static HTML prototypes** representing the full site structure. These are reference implementations for converting to WordPress templates:

1. `01-homepage.html` - Main landing page
2. `02-diagnostic.html` - WordPress technical audit service page (200€)
3. `03-maintenance.html` - Maintenance service page
4. `04-reservation.html` - Service booking/reservation page
5. `05-confirmation-diagnostic.html` - Diagnostic booking confirmation
6. `06-confirmation-maintenance.html` - Maintenance booking confirmation
7. `07-a-propos.html` - About page

**Design System** (defined in wireframe CSS):
- Fonts: Fraunces (display), Instrument Sans (body)
- Colors: Primary `#1b4965`, Accent `#e07a5f`, Background `#ffffff`
- Border radius: `12px` (default), `8px` (small)

### Function Naming Convention

All theme functions are prefixed with `quantum_dev_corporate_` to avoid conflicts:
- `quantum_dev_corporate_setup()` - Theme setup
- `quantum_dev_corporate_widgets_init()` - Widget registration
- `quantum_dev_corporate_scripts()` - Script/style enqueuing

### Navigation

Single registered menu location:
- `menu-1` (Primary navigation)

### Coding Standards

Theme follows WordPress Coding Standards (enforced via PHPCS):
- WordPress ruleset
- WP Theme Review standards
- PHPCompatibility for PHP 5.6+
- Text domain validation for `quantum_dev_corporate`

**PHPCS configuration**: See `phpcs.xml.dist` for detailed rules. Note that the configuration still references `_s` in some places (text_domain, prefixes) which should be updated to `quantum_dev_corporate`.

## WordPress-Specific Workflows

### Translation Workflow
1. Wrap all user-facing strings with `esc_html__()`, `esc_html_e()`, or `_e()` using text domain `'quantum_dev_corporate'`
2. Run `composer make-pot` to generate `languages/quantum_dev_corporate.pot`
3. Translation files go in `languages/` directory

### Custom Template Creation
When creating new page templates:
1. Add template header comment: `/* Template Name: Your Template */`
2. Follow WordPress template hierarchy conventions
3. Use `get_template_part()` to include template parts from `template-parts/`
4. Leverage existing template tags from `inc/template-tags.php`

### Style/Script Enqueuing
Add new assets in `quantum_dev_corporate_scripts()` function in `functions.php`:
```php
wp_enqueue_style('handle', get_template_directory_uri() . '/path.css', array(), _S_VERSION);
wp_enqueue_script('handle', get_template_directory_uri() . '/path.js', array(), _S_VERSION, true);
```

## Important Notes

- **SASS directory missing**: The build configuration expects a `sass/` directory, but it doesn't currently exist. CSS is in `style.css` and `style-rtl.css`.
- **Wireframes are reference only**: The HTML files in `page_wireframes/` are static prototypes to be converted to WordPress templates, not part of the active theme.
- **Underscores remnants**: Some configuration files (phpcs.xml.dist) still reference `_s` and should be updated to `quantum_dev_corporate` for consistency.
- **No WooCommerce**: Despite Underscores supporting WooCommerce, this theme does not appear to need e-commerce functionality based on the service-oriented wireframes.
