# Mares: Shopify theme architecture plan

Status: planning only. No theme code exists yet (the repo holds only this plan, the design docs and the repo config files). This file is the contract every later commit prompt refers to.
Scope: a custom Online Store 2.0 theme built from scratch, vanilla CSS and JS, no build step required to deploy.

## 0. Ground rules

**Source tags.** Every design value in this plan carries its origin:

| Tag | Meaning |
| --- | --- |
| `[T]` | Comes from `docs/design/tokens.json` (wins over everything). |
| `[G]` | Comes from `docs/design/guia-web.md`. |
| `[R]` | Comes from `docs/design/README.md`. |
| `[P]` | **Proposal.** The design docs are silent. Needs owner confirmation before it ships. Never treated as design truth. |
| `[V]` | Shopify platform behavior to verify against current Shopify docs before the commit that depends on it. |

**Decisions this plan makes.**

1. Layout is fluid and responsive at every width. Only two breakpoints exist, 600px and 1024px `[G]`. The 375px viewport is the first mandatory test width, but CSS is not written as a "mobile only, then patch" exercise: every component is checked at 320, 375, 600, 768, 1023, 1024, 1280, 1440 and 1920px.
2. Every color, font size, spacing, radius and shadow comes from a token. No hex anywhere except `assets/tokens.css` (section 2).
3. Checkout is not customized in code. Branding only, set in the Shopify admin (section 9, R-2).
4. Nothing is gateway-specific. No dynamic checkout buttons, no payment icons, no gateway names in code or copy.
5. The theme exposes **no raw color, font or spacing settings** in the theme editor. The editor can pick a *line* (Descanso / Día), never a hex. This protects the tokens from the merchant.
6. Copy comes only from `README.md` / `guia-web.md`. Anything else is a placeholder in `locales/es.default.json`, marked `TODO(copy)`, and listed for the owner.

### Resolved decisions (2026-10-22)

Owner decisions that replace earlier proposals and open questions. If any other part of this plan disagrees with this list, this list wins.

- **R-4, control borders.** Borders of fields, chips and other controls use `--control-border: var(--color-ink-muted)` instead of `line`. Accessibility wins over the guide's wording ("borde 1px `line`"): `ink-muted` is 5.21:1 on `bg` and 5.86:1 on `bg-raised`, against the 3:1 required for control borders, while `line` is 1.32:1 and 1.48:1. `line` stays for dividers (header underline, footer rule, skeleton). `guia-web.md` should be updated to match later; `docs/design/*` is read-only here, so it is not touched now.
- **R-6, focus ring.** Inside `[data-line]` surfaces, `--focus-ring-color: var(--color-ink)`. Everywhere else it stays `var(--color-focus)`. Reason: the `focus` ring is 2.49:1 on turquoise and 2.95:1 on coral, under the 3:1 minimum; `ink` is 4.68:1 or better on all six line colors.
- **Q-12, token script.** `scripts/build-tokens.mjs` is approved. Node built-ins only, no packages. The generated `assets/tokens.css` is committed.
- **Q-2, card density.** The product grid defaults to 2 cards per row on mobile. At 375px that is 163px cards and the card name may wrap to two lines; this is accepted.
- **Q-7, personalization pricing.** Personalization carries no extra cost in phase 1. No surcharge logic is built.
- **Q-3, fonts (partially resolved).** Font placeholders stay for now and `fonts_ready` remains `false` until the real WOFF2 files arrive. Still open: whether to keep Nunito 600 (Q-3 in section 9.1).

---

## 1. Theme file tree

Shopify `assets/` is **flat** (no subfolders), so file groups are expressed as name prefixes. `docs/` and `scripts/` are excluded from upload via `.shopifyignore`.

```
.gitignore                      Ignore OS/editor junk, .shopify/ local state.
.shopifyignore                  Keep docs/ and scripts/ out of theme uploads.
.theme-check.yml                Theme Check config (severity, ignore rules we accept).
docs/                           Design docs (read-only) + this plan + later notes.
scripts/
  build-tokens.mjs              tokens.json -> assets/tokens.css. Node built-ins only, no packages.
  check-no-hex.sh               Fails if a color literal or stray breakpoint appears outside its allowed file.

layout/
  theme.liquid                  Document shell: head assets, skip link, header group, <main>, footer group, scripts.
  password.liquid               Minimal shell for the password page (store not yet public).

templates/                      All JSON. Templates only list sections; no markup.
  index.json                    Home: lines-entry + featured-collection (general colors only).
  collection.json               Neutral collection page (no line): main-collection only.
  collection.descanso.json      hero-line (line = descanso) + main-collection.
  collection.dia.json           hero-line (line = dia) + main-collection.
  list-collections.json         All collections.
  product.json                  main-product (blocks decide the content).
  cart.json                     main-cart.
  page.json                     Generic content page (policies, care, contact copy).
  search.json                   Search results using product cards.
  404.json                      Not found, with links to both lines.
  password.json                 Password page content.
  (no customers/*, no gift_card.liquid in phase 1: see Q-10)

sections/
  header-group.json             Section group: header.
  footer-group.json             Section group: footer.
  header.liquid                 Logo left, cart right, 1px line below, 64px tall on mobile.
  footer.liquid                 Link lists, text, brand line, copyright. body-sm.
  hero-line.liquid              Line hero block (one per line) with line color set.
  lines-entry.liquid            Home: one neutral card per line linking to its collection.
  featured-collection.liquid    Home: a row/grid of product cards from a picked collection.
  main-collection.liquid        Collection grid, sorting, pagination.
  main-product.liquid           Product page shell: media + info column that accepts theme blocks.
  main-cart.liquid              Cart page.
  main-page.liquid              Page content.
  main-search.liquid            Search results.
  main-list-collections.liquid  Collection list.
  main-404.liquid               404 content.

blocks/                         Theme blocks, used inside main-product (and reusable later).
  product-title.liquid          Product name (h1, display-sm).
  product-price.liquid          Price + compare-at.
  variant-picker.liquid         Size chips and other options.
  quantity.liquid               Quantity field.
  buy-buttons.liquid            The single primary button "Agregar al carrito" + messages.
  product-description.liquid    Rich description.
  accordion.liquid              Policies, care, shipping (details/summary).
  shipping-note.liquid          Shipping cost / delivery estimate text.
  embroidery-configurator.liquid  Phase 1 configurator slot (added late, section 7).
  _line-tag.liquid              Private: collection tag chip.

snippets/
  head-assets.liquid            Order of <link>/<style>/preloads in <head>.
  fonts.liquid                  @font-face + font preloads (placeholders until files exist).
  meta-tags.liquid              Title, description, Open Graph, canonical.
  icon.liquid                   Inline SVG icons (Lucide subset, 24px, 2px stroke, round caps).
  button.liquid                 Primary / secondary button or link-button.
  image.liquid                  Responsive image: srcset, sizes, width/height, lazy/eager, fetchpriority.
  price.liquid                  Price, compare-at (struck, ink-muted), unit price if present.
  product-card.liquid           The product card.
  collection-tag.liquid         Collection tag chip (sea-glass / turquoise).
  embroidery-motif.liquid       One-line SVG motifs (placeholder art first).
  embroidery-divider.liquid     Section separator in the embroidery stroke.
  pagination.liquid             Numeric pagination.
  cart-line-item.liquid         One cart line (also used by Section Rendering responses).
  cart-count.liquid             Cart count bubble.

assets/
  tokens.css                    GENERATED from tokens.json. Only file allowed to contain color literals.
  base.css                      Reset, element defaults, type classes, focus ring, reduced motion, utilities.
  base-lines.css                Semantic aliases + [data-line] mapping (var() only, no literals).
  grid.css                      Container, 4/8/12 grid, section spacing.
  component-*.css               button, field, chip, tag, icon, price, card-product, skeleton, accordion, pagination.
  section-*.css                 header, footer, hero-line, lines-entry, collection, product, cart, page.
  core.js                       Namespace, routes, fetch helper, cart API wrapper, live-region announcer.
  cart-items.js                 <cart-items> custom element (quantity, remove).
  product-form.js               <product-form> custom element (Ajax add to cart).
  variant-picker.js             <variant-picker> custom element (option change, URL update, section render).
  header-menu.js                <header-menu> custom element (mobile <dialog> menu).
  media-gallery.js              <media-gallery> (thumbnail sync for the scroll-snap gallery).
  configurator.js               Phase 1 configurator (written late, section 7).
  fraunces-600.woff2            Placeholder until supplied.
  nunito-400.woff2              Placeholder until supplied.
  nunito-600.woff2              Placeholder until supplied (see Q-3).
  nunito-700.woff2              Placeholder until supplied.

config/
  settings_schema.json          theme_info, favicon, links to the returns and care pages. No color/font settings.
  settings_data.json            Defaults and presets.

locales/
  es.default.json               Storefront strings (Español de Colombia, tuteo) [R].
  es.default.schema.json        Theme editor labels.
```

Rules for the tree:
- A section/snippet that needs CSS loads only its own file with `stylesheet_tag`. Global CSS is limited to `tokens`, `base`, `base-lines`, `grid`.
- Each commit adds only the locale keys it uses.
- Logo: README mentions `assets/Logos`. That path cannot exist inside a Shopify theme (flat assets). Until the final logo arrives, the header renders the word "Mares" in Fraunces 600 `brand` `[R]`. The final logo is uploaded through the `logo` image setting (R-9).

---

## 2. Tokens to CSS custom properties

### 2.1 Source and generation
- `docs/design/tokens.json` is the only source. It is never copied into the theme.
- `scripts/build-tokens.mjs` (Node built-ins only, **no packages**) reads it and writes `assets/tokens.css`. The generated file is committed. Header comment: `GENERATED from docs/design/tokens.json v1. Do not edit by hand.`
- The script is approved (see Resolved decisions). It is a developer tool only: it is excluded from theme uploads and does not run on deploy.

### 2.2 Naming (1:1 with the token name)

| Group | Token | Custom property |
| --- | --- | --- |
| Color | `bg`, `bg-raised`, `line`, `ink`, `ink-muted`, `brand`, `on-brand`, `focus`, `error`, `success` | `--color-bg`, `--color-bg-raised`, `--color-line`, `--color-ink`, ... |
| Color (line palette) | `sea-glass`, `lavender`, `blush`, `turquoise`, `coral`, `sun` | `--color-sea-glass`, `--color-lavender`, ... |
| Font family | `type.families.display`, `.sans` | `--font-display`, `--font-sans` |
| Type style | e.g. `display-xl` | `--type-display-xl-size`, `-line`, `-weight`, and `-tracking` only where the token has `letterSpacing` (`label`) |
| Spacing | `space-1` ... `space-24` | `--space-1` ... `--space-24` |
| Radius | `radius-sm/md/lg/pill` | `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-pill` |
| Shadow | `shadow-soft` | `--shadow-soft` |

`base.css` turns type styles into classes (`.text-display-xl`, `.text-body`, `.text-label` ...) reading those properties. `label` is uppercase via CSS `text-transform` (`[T]` usage says "en mayúsculas"), not typed in capitals.

### 2.3 Light and dark
- Tokens with a `{ light, dark }` value are emitted twice. Single-value tokens (the six line colors, spacing, radius) are emitted once.
- Light values live on `:root` together with `color-scheme: light`.
- Dark values live on `:root[data-theme="dark"]` together with `color-scheme: dark`. **Nothing sets `data-theme="dark"` in phase 1**: README allows launching light only `[R]`. Enabling dark later is one small commit (add `prefers-color-scheme` or a toggle). No `prefers-color-scheme` rule ships in phase 1, so the store never flips by itself.
- Known dark-mode gap: the line colors have one value for both themes, so `ink` on them fails in dark (R-5). Dark must not ship until the `--color-on-line` alias below is in place.

### 2.4 Derived tokens (generated, inside `tokens.css`)
- `--color-brand-hover`: `[G]` says the primary button hover is `brand` darkened 8%. Emitted as a static fallback computed by the script, then `@supports (color: color-mix(in srgb, red, red))` overrides with `color-mix(in srgb, var(--color-brand) 92%, black)`. Verified: `on-brand` on the hover color is 5.90:1 in light. "Darken 8%" has no exact definition in the docs (Q-13).

### 2.5 Semantic aliases (hand-written, `assets/base-lines.css`, only `var()` references)

| Alias | Value | Why |
| --- | --- | --- |
| `--line-main` | descanso: `var(--color-sea-glass)`; dia: `var(--color-turquoise)` | Principal color of the line `[T]`. |
| `--line-accent` | descanso: `var(--color-lavender)`; dia: `var(--color-coral)` | Accent `[T]`. |
| `--line-soft` | descanso: `var(--color-blush)`; dia: `var(--color-sun)` | Warm / small accent `[T]`. |
| `--color-on-line` | light: `var(--color-ink)`; dark: `var(--color-on-brand)` | Text on line colors. Ink on line colors is fine in light only (R-5). |
| `--control-border` | `var(--color-ink-muted)` | Border of fields, chips and other controls. Decided (R-4): `[G]` said `line`, which fails 3:1. |
| `--focus-ring-color` | `var(--color-focus)`; inside `[data-line]` surfaces `var(--color-ink)` | Decided (R-6): the `focus` ring fails 3:1 on turquoise and coral. |

The mapping is activated by an attribute on the section wrapper: `data-line="descanso"` or `data-line="dia"`. One line per page is enforced by convention and by which sections the template includes `[R]`.

### 2.6 Loading in `layout/theme.liquid`
In `<head>`, in this order, via `snippets/head-assets.liquid`:
1. Inline `<style>@layer tokens, reset, base, components, sections, utilities;</style>`. Declares layer order once, so file load order never changes specificity.
2. `{{ 'tokens.css' | asset_url | stylesheet_tag }}` (wrapped in `@layer tokens`).
3. `snippets/fonts.liquid` (preloads + `@font-face`).
4. `base.css`, `base-lines.css`, `grid.css` (global, small, render-blocking on purpose).
5. Section/snippet CSS loads where used.

### 2.7 The "no hex" rule
- **Rule:** no hex color (`#rgb`, `#rrggbb`, `#rrggbbaa`), no `rgb()/rgba()/hsl()/hsla()/hwb()/lab()/lch()/oklab()/oklch()`, and in `.css` no named colors (except `transparent`, `currentColor`, `inherit`) outside `assets/tokens.css`. Colors elsewhere are `var(--color-*)`, `--line-*` or `currentColor`.
- **Enforcement:** `scripts/check-no-hex.sh` greps `layout sections blocks snippets templates assets config locales` excluding `tokens.css`. It has an explicit allowlist for false positives such as `href="#main"`. It also fails on any `@media` width other than 600px and 1024px. Runs before every commit (section 8 definition of done).
- **Settings:** the theme schema never uses `color` settings or hex `default` values.
- **Documented exceptions (not code):** (a) hex values typed into the Shopify admin (checkout branding, notification emails) must be copied from `tokens.json`; (b) thread-color swatches in the configurator come from merchant data, injected as a CSS variable from the data value (section 7); (c) `<meta name="theme-color">` is omitted in phase 1 because it needs a literal.

---

## 3. Font loading (Fraunces and Nunito)

| Face | Weight | Used by tokens | Preload |
| --- | --- | --- | --- |
| Fraunces | 600 | `display-xl/lg/md/sm` | Yes |
| Nunito | 400 | `body-lg`, `body`, `body-sm` | Yes |
| Nunito | 700 | `label`, `button`, `price` | No (revisit after Lighthouse) |
| Nunito | 600 | none (listed in `[G]` and `[R]`) | No |

- Only these weights; `font-display: swap` on every face `[R][G]`. No italics, no other weights.
- **Source (plan default; real files still pending, see Q-3):** Google Fonts files (both are open licensed) **self-hosted** as WOFF2 in `assets/`. Reason: same-origin on the Shopify CDN, no third-party connection before first paint, preloading works cleanly. Alternatives if declined: Google Fonts stylesheet with `preconnect`, or Shopify's font library (availability of Fraunces there is not verified `[V]`).
- **Subset:** Latin only. Spanish letters (á é í ó ú ñ ü ¿ ¡) live in it.
- **Fallback stacks** come from tokens `[T]`: `--font-display: "Fraunces", Georgia, serif`, `--font-sans: "Nunito", system-ui, -apple-system, sans-serif`.
- **Placeholders for now (decided):** `snippets/fonts.liquid` contains the four `@font-face` blocks and the two preloads behind one flag, `{% assign fonts_ready = false %}`. While false it outputs nothing and the site renders in the fallback stacks. The commit that adds real files flips the flag. Files are named in section 1.
- **CLS:** metric-adjusted fallback faces (`size-adjust`, `ascent-override`, ...) are added in the performance pass, using values measured with the real files. No numbers are invented now.
- `tokens.json` has `type.fonts: []`, so no font files are defined by the design system. Real files are an input needed from the owner (Q-3).

---

## 4. CSS strategy

- **Plain CSS.** No Sass, no Tailwind, no PostCSS, no build step. Only `build-tokens.mjs` exists and it does not run on deploy.
- **File split:** global (`tokens`, `base`, `base-lines`, `grid`) + `component-*` + `section-*` (section 1). Section and snippet files load their own CSS. Cascade layers (`reset`, `base`, `components`, `sections`, `utilities`) make order irrelevant.
- **Naming:** BEM, no prefix: `.product-card`, `.product-card__title`, `.product-card--sold-out`. State by ARIA/attributes first (`[aria-expanded]`, `[aria-current]`, `[disabled]`), else `.is-*`. JS hooks are custom element tags and `data-*` attributes, never styling classes. No IDs for styling. Max specificity 0,2,0. Line theming only through `[data-line]`.
- **Breakpoints `[G]`:** exactly two, as `min-width` queries: `@media (min-width: 600px)` and `@media (min-width: 1024px)`. Media queries cannot read custom properties, so these literals are documented in the header of `base.css` and enforced by `check-no-hex.sh`. Other queries allowed: `prefers-reduced-motion`, `(hover: hover)`.
- **Grid `[G]`:**

| Range | Columns | Side margin | Max content |
| --- | --- | --- | --- |
| 0 to 599px | 4 | `--space-4` (16px) | fluid |
| 600 to 1023px | 8 | `--space-8` (32px) | fluid |
| 1024px and up | 12 | `--space-8` (32px) | 1200px centered |

  `.container { width: min(100% - 2 * var(--page-margin), 1200px); margin-inline: auto; }` and `.grid { display: grid; grid-template-columns: repeat(var(--grid-cols), minmax(0, 1fr)); column-gap: var(--grid-gap); }`. `--grid-cols`, `--page-margin` switch at the two breakpoints. `1200px` is defined once as `--content-max` (it is in `[G]`, not in tokens.json). **Gutter (`--grid-gap`) is not in the docs**: `[P]` `--space-4` below 600px, `--space-6` from 600px (Q-1).
- **Fluid rules:** `minmax(0, 1fr)` columns, `max-width: 100%` on media, `aspect-ratio` boxes, `overflow-wrap: anywhere` on user-facing long strings, nothing with a fixed pixel width wider than the viewport. Tables and code only may scroll horizontally, inside their own container. Type sizes stay at token values (no `clamp()` with invented numbers). The one responsive type switch: hero `display-xl` on desktop, `display-lg` below `[T][G]`. Tablet is not specified; `[P]` use `display-lg` below 1024px (Q-1).
- **Section rhythm `[G]`:** `--section-gap: var(--space-12)`, `var(--space-16)` from 1024px. Hero: `--space-24` above and below on desktop only. Mobile/tablet hero padding is not specified: `[P]` `--space-12` vertical, `--space-8` inside.
- **Components straight from `[G]`:** button (48px min height, `--space-3`/`--space-6` padding, `--radius-md`, `button` style), secondary button (2px `brand` border), field (`bg-raised`, 1px `--control-border` border, `--radius-sm`, 48px, `body` text, visible label above), product card, collection tag (`--radius-pill`, padding `--space-1`/`--space-3`, `label` style, `ink` text), size chip (`--radius-pill`, 1px `--control-border` border, 44px minimum target, selected = `brand` fill + `on-brand`), header (64px mobile, 1px `line` below), hero block (`--radius-lg`). Control borders use `--control-border` (= `ink-muted`), never `line`; `line` is only for dividers (decided, R-4).
- **States `[G]`:** hover only under `(hover: hover)` (button -> `--color-brand-hover`, card -> `--shadow-soft`; no shadows at rest, no gradients `[R]`). Focus: `:focus-visible { outline: 2px solid var(--focus-ring-color); outline-offset: 2px; }` on every control, where `--focus-ring-color` is the `focus` token, switched to `ink` inside `[data-line]` surfaces (decided, R-6). Disabled: `opacity: .5; cursor: not-allowed` plus nearby text explaining why. Error: 2px `--color-error` border plus message text under the field, never color alone. Loading: skeleton `--color-line` on `--color-bg-raised`, animation at most 1.2s. `prefers-reduced-motion: reduce` removes smooth scroll, auto zoom and non-essential motion.
- **Images:** product card and gallery 4:5 `[G]`. WebP/AVIF delivery comes from the Shopify image CDN `[V]`; `srcset` and `sizes` are produced by `snippets/image.liquid`; `loading="lazy"` except the first visible image `[G]`.
- **Budget `[P]`:** global CSS (tokens + base + base-lines + grid) under 20 KB uncompressed; any single component file under 10 KB. Revisit at the performance pass.

---

## 5. JavaScript strategy

- **Vanilla JS, ES2020, classic scripts with `defer`.** No framework, no jQuery, no bundler, no polyfills, no libraries. Reason: no build step, `defer` guarantees execution order, widest support for mobile traffic from ads `[G]`. (An import map with ES modules is the alternative; rejected for older-iOS risk. Revisit only if a file exceeds what is comfortable to keep standalone.)
- **Progressive enhancement:** every flow works without JS first. The add-to-cart form posts to `/cart/add`; the cart quantity form posts to `/cart`; JS only upgrades them.
- **Structure:** one Custom Element per feature (`<product-form>`, `<variant-picker>`, `<cart-items>`, `<header-menu>`, `<media-gallery>`), one file each, registered with `customElements.define`. Shared code lives only in `core.js`, under a single namespace `window.Mares`.
- **`core.js` provides:** `Mares.routes` (from Liquid `routes`: cart add/change/update/url, root), `Mares.fetchJson()` (AbortController, JSON parse, error normalization), `Mares.cart.{get, add, change, update}`, `Mares.announce(text)` (a single `aria-live="polite"` region in `theme.liquid`).
- **Cart, Shopify Ajax Cart API only:** `/cart.js`, `/cart/add.js` (accepts `items[].properties`), `/cart/change.js` (by line `key`), `/cart/update.js`. Rerender with the **Section Rendering API** (`sections` parameter on the same request) so prices stay server-formatted as `$89.900` `[R]`. **No money formatting in JS.** `/cart/clear.js` is unused.
- **Events:** DOM `CustomEvent` on `document`: `mares:cart:updated` (`detail: { cart }`), `mares:cart:error`. The header count listens; nothing else is coupled.
- **Errors `[G]`:** a 422 (stock) maps to a text message next to the control, with the `error` token, not color alone; also announced through the live region. Buttons set `aria-disabled` (not removal from the tab order) while a request is pending.
- **Cart UI in phase 1:** cart **page** with Ajax updates plus the header cart link with a count. A cart drawer is not in the design docs (Q-8).
- **Header menu on mobile:** native `<dialog>` (built-in focus trap and Esc) driven by a tiny `<header-menu>`.
- **Gallery:** CSS `scroll-snap`; `<media-gallery>` only syncs thumbnails. No auto zoom `[G]`.
- **Loading:** `core.js` first on every page, then only what the template uses. Scripts attach `defer`, never block render.
- **Budget `[P]`:** phase 1 JS (everything except the configurator) under 15 KB gzipped.

---

## 6. Sections, snippets and editable settings

"Editable" = exposed in the theme editor. Everything else is fixed by tokens.

### 6.1 Header (`sections/header.liquid`, group `header-group.json`)
- Design `[G]`: `bg` background, logo left, cart right, 1px `line` underneath, 64px tall on mobile. Desktop height not specified: `[P]` 64px. Icons Lucide 24px, 2px `[R]`, with 44px hit areas.
- Logo: image if set, else the word "Mares" in Fraunces 600 `brand` `[R]`.
- Menu: required to reach the two lines, but not in the docs: `[P]` inline links on desktop, `<dialog>` menu on mobile (Q-1).
- **Editable:** `logo` (image picker), `menu` (link list). Nothing else.

### 6.2 Footer (`sections/footer.liquid`, group `footer-group.json`)
- Design: not specified beyond "pie de página" using `body-sm` `[T]`. `[P]`: `bg` background, 1px `line` above (mirrors header), content in the 4/8/12 grid.
- Blocks: `menu` (heading + link list), `text` (heading + rich text), `brand` (wordmark + line). Default brand line is the provisional working phrase "Hecha con amor para las que más amamos." `[R]`, marked provisional.
- Must link the returns and care pages `[G]` via theme settings `page_returns`, `page_care`. No payment icons (gateway undecided).
- **Editable:** blocks above, `show_copyright`.

### 6.3 Hero per line (`sections/hero-line.liquid`, `snippets/embroidery-motif|divider`)
- Design `[G][T]`: block with `--radius-lg`, background `--line-main` (`sea-glass` for Descanso, `turquoise` for Día), title `display-xl` (`display-lg` below 1024px) in `ink`, desktop vertical padding `--space-24`. Optional decorative motif in the embroidery stroke: 2px, round caps, `ink-muted` `[R]` (not a line color: it would vanish on the same-colored block).
- Used on `collection.descanso.json` and `collection.dia.json`. Two alt templates (instead of a metafield) so the heading, text and image are editable per line in the theme editor.
- The hero button is the page's **single primary button**. Using the secondary style here would put `brand` text on a line color, which fails on turquoise and coral (numbers in R-6). Keyboard focus rings inside this block use `ink` (decided, R-6).
- Motifs `[R]`: Descanso = ola suave, luna sobre el mar, conchitas nacaradas. Día = estrella de mar, caballito de mar, palmita, sol. Placeholder simple SVG first; final artwork comes from the designer (Q-6).
- **Editable:** `line` (select), `heading` (empty = collection title, rendered as `h1`), `text` (short), `button_label`, `button_link`, `image` (optional), `motif` (select, limited to the chosen line, or none).

### 6.4 Product card (`snippets/product-card.liquid`, `assets/component-card-product.css`)
- Design `[G]`: `bg-raised`, `--radius-md`, image 4:5 on top, name in `display-sm`, price in `price` style, `--shadow-soft` only on hover, `--space-4` inner padding `[T]`. Struck compare-at price in `ink-muted` `[T]`. Whole card is one link (stretched pseudo-element), visible focus ring.
- Image alt: the media alt from admin (guide example: "Pijama azul verdoso con ola bordada" `[G]`), falling back to the product title.
- Optional badge: `coral` with `ink` text, "novedad" use per `[T]` (`coral` usage). Optional line tag via `collection-tag` (see Q-5 before enabling by default).
- Sold-out state: text, never only opacity.
- At 375px, 2-up cards are 163px wide and the name may wrap to two lines. This is accepted (decided, Q-2); the card layout must not truncate the name.
- Params: `product`, `image_sizes`, `eager` (first row only: `loading="eager"` + `fetchpriority="high"` for the LCP candidate), `show_tag`.
- **Editable (via parent section):** `show_tag`, `show_compare_at`.

### 6.5 Collection grid (`sections/main-collection.liquid`)
- Card spans: `grid-column: span var(--span)` where Liquid writes `--span-sm/md/lg = grid columns / cards per row`.
- Cards per row only allows values that divide the grid: mobile 1 or 2 (default 2, decided), tablet 2 or 4 (default 2; 3 does not fit an 8-column grid), desktop 3 or 4 (default 3). Mobile 2-up means 163px cards at 375px with a name that may wrap to two lines (accepted, Q-2).
- Empty state in text. Skeleton while loading. Numeric pagination.
- **Editable:** `products_per_page` (range 8 to 24, step 4, default 12), `columns_mobile`, `columns_tablet`, `columns_desktop`, `show_sort` (Shopify `sort_options`), `show_tag`, `empty_text`. Filtering is out of phase 1 (Q-9).

### 6.6 Product page (`sections/main-product.liquid` + `blocks/`)
- Layout `[P]`: stacked below 1024px; from 1024px media spans 7 of 12 columns and info 5 of 12. Gallery images 4:5 with `--radius-lg` (`[T]`: large images). First image eager with `fetchpriority="high"`.
- `data-line` comes from product metafield `mares.line` (`descanso` | `dia`), created manually in the admin (Q-4). Empty = neutral page.
- Blocks:

| Block | Design | Editable |
| --- | --- | --- |
| `product-title` | `h1`, `display-sm` `[T]` | none |
| `product-price` | `price` style, `ink-muted` struck compare-at | `show_compare_at` |
| `variant-picker` | size chips `--radius-pill`, 1px `--control-border` border, selected `brand` + `on-brand`, 44px min target `[G]`; sold-out options disabled with text | `chip_style` limited to chips |
| `quantity` | field per `[G]`, 48px | `show` |
| `buy-buttons` | the single primary button "Agregar al carrito" `[R]`; disabled state with reason text; no dynamic checkout button | none (label from locale) |
| `product-description` | `body` / `body-lg` for intro | none |
| `accordion` | `details/summary`; returns and care must be reachable from here `[G]` | `heading`, `page` (page picker) or rich text |
| `shipping-note` | `body-sm` text: shipping cost and delivery time `[G]` | `text` (owner supplies copy) |
| `embroidery-configurator` | section 7 | later |

- Color options (garment color) have no design spec; phase 1 renders them as text chips (Q-1).
- Structured data via Shopify's `structured_data` filter.

### 6.7 Cart (`sections/main-cart.liquid`, `snippets/cart-line-item.liquid`, `cart-count.liquid`)
- General page: only `bg`, `bg-raised`, `ink`, `brand` `[R]`. No line colors even if lines are mixed.
- Per line: image, title link, variant options, **line item properties as visible key/value text** (configurator choices), quantity control with 44px targets, line price in `price`, remove control.
- Subtotal in `price`. One primary button: checkout. Shipping cost and delivery time visible before payment `[G]`: a text block now; a shipping estimator only if the endpoint is confirmed (R-3).
- Empty state: heading, text, and a primary button; example copy from `[R]` ("Ver la línea Descanso").
- **Editable:** `show_order_note` (default off), `shipping_note` (rich text), `delivery_estimate` (text), `empty_heading`, `empty_text`, `empty_button_label`, `empty_button_link`.

### 6.7b Home and supporting pages
- `lines-entry`: two `bg-raised` cards, `ink` text, `brand` link, linking to each line. No line colors, because the home page is a general page `[R]` (Q-5). Editable: per-block `title`, `text`, `link`, `image`.
- `featured-collection`: heading + product cards. Editable: `heading`, `collection`, `max_products`.
- `main-page`, `main-search`, `main-list-collections`, `main-404`: minimal, reusing the same components.

---

## 7. Embroidery configurator (high level only)

Scope `[G]`: phase 1 is a configurator **without AI**: embroidery motif, name or initial, thread color, preview on the garment. AI generation is phase 2 with a per-customer attempt limit.

**Approach**
- A theme block `embroidery-configurator` inside `main-product`, shown only when the product is flagged personalizable (metafield `mares.personalizable`, `[P]`, Q-4). Unflagged products are unaffected.
- **Line item properties.** Choices are sent with `/cart/add.js` as `properties`. Visible keys (human-readable Spanish, also shown in cart, checkout and the order in admin): `Motivo`, `Nombre o inicial`, `Color de hilo`. Hidden helper keys use a leading underscore (e.g. `_config_version`) `[V]`. Values are names (e.g. "Ola suave", the thread color's name), never hex.
- Same variant with different properties becomes separate cart lines (Shopify behavior), which is what we want.
- Motif list comes from `[R]`: 3 Descanso motifs, 4 Día motifs. A product offers only its own line's motifs (one line per page).
- **Thread colors** are data (a metaobject list with name + color), not tokens. Their swatches are the only colors not coming from tokens (documented exception, section 2.7). Palette is an owner input (Q-6).
- **Preview on the garment:** client-side only. A layered SVG over the variant's garment photo: motif stroke tinted with the thread color, plus the name text. Needs a per-product "embroidery zone" (position and size) stored as data. A live-region text alternative describes the selection. Includes a short "approximate preview" note (copy from owner). The preview image is **not** saved in the order.
- Controls use the same field/chip components, 44px targets, visible labels, errors by text `[G]`.
- Validation: client-side only (length limit, letters including ñ and tildes). Server-side enforcement is not available in theme code (R-8).

**Out of scope for phase 1**
- AI generation and attempt limits (phase 2 `[G]`).
- Customer image uploads; saving the preview image on the order; production-file export.
- Free drag/resize/rotate of the motif; several embroidery locations; stitch simulation.
- Editing a configured line in the cart (customer removes and re-adds).
- Embroidery price surcharge or any pricing logic (decided: personalization carries no extra cost in phase 1, Q-7).
- Server-side validation (Cart/Checkout Validation Function), saved designs, accounts.
- Translations other than `es`.

A separate `docs/CONFIGURATOR_PLAN.md` will detail the data model and preview geometry before any code (commit G0).

---

## 8. Ordered commits

**Definition of done for every commit:** `shopify theme check` clean; `scripts/check-no-hex.sh` clean (once it exists); checked at 375px and 1280px, plus the width list in section 0 for layout commits; keyboard-only pass for anything interactive; only the files named in the commit prompt are changed; no store-touching command without explicit approval.

Models: **S-med** = Sonnet 5.5 medium, **S-high** = Sonnet 5.5 high, **O-high** = Opus high.

### Phase A: repository and config
| # | Commit | Files | Model |
| --- | --- | --- | --- |
| A1 | chore: ignore files and Theme Check config | `.gitignore`, `.shopifyignore`, `.theme-check.yml` | S-med |
| A2 | feat(config): theme settings schema and data | `config/settings_schema.json`, `config/settings_data.json` | S-med |
| A3 | feat(locales): default Spanish locale skeleton | `locales/es.default.json`, `locales/es.default.schema.json` | S-med |

### Phase B: design foundation
| # | Commit | Files | Model |
| --- | --- | --- | --- |
| B1 | feat(tokens): generator and `tokens.css` (light, dark, derived) | `scripts/build-tokens.mjs`, `assets/tokens.css` | S-high |
| B2 | chore(guard): no-hex and breakpoint check script | `scripts/check-no-hex.sh` | S-med |
| B3 | feat(layout): `theme.liquid` shell, head assets, live region, skip link | `layout/theme.liquid`, `snippets/head-assets.liquid` | S-high |
| B4 | feat(fonts): `fonts.liquid` with placeholder flag | `snippets/fonts.liquid` | S-med |
| B5 | feat(css): base reset, type classes, focus ring, reduced motion, utilities | `assets/base.css` | S-high |
| B6 | feat(css): container, 4/8/12 grid, section spacing, line aliases | `assets/grid.css`, `assets/base-lines.css` | S-high |
| B7 | feat(snippets): icon snippet (Lucide subset) | `snippets/icon.liquid`, `assets/component-icon.css` | S-med |
| B8 | feat(components): button (primary, secondary, disabled, loading) | `snippets/button.liquid`, `assets/component-button.css` | S-high |
| B9 | feat(components): form field, chip, tag, skeleton | `assets/component-field.css`, `component-chip.css`, `component-tag.css`, `component-skeleton.css`, `snippets/collection-tag.liquid` | S-high |
| B10 | feat(snippets): responsive image and price | `snippets/image.liquid`, `snippets/price.liquid`, `assets/component-price.css` | S-med |

### Phase C: global chrome and generic pages
| # | Commit | Files | Model |
| --- | --- | --- | --- |
| C1 | feat(header): header section and group (no JS) | `sections/header.liquid`, `header-group.json`, `assets/section-header.css` | S-high |
| C2 | feat(header): mobile menu dialog | `assets/header-menu.js`, header edits | S-high |
| C3 | feat(footer): footer section and group | `sections/footer.liquid`, `footer-group.json`, `assets/section-footer.css` | S-med |
| C4 | feat(pages): `page`, `404`, `password` templates and layout | `templates/page.json`, `404.json`, `password.json`, `layout/password.liquid`, `sections/main-page.liquid`, `main-404.liquid` | S-med |

### Phase D: catalog
| # | Commit | Files | Model |
| --- | --- | --- | --- |
| D1 | feat(card): product card snippet and CSS | `snippets/product-card.liquid`, `assets/component-card-product.css` | S-high |
| D2 | feat(collection): grid section, sorting, pagination, neutral template | `sections/main-collection.liquid`, `templates/collection.json`, `snippets/pagination.liquid`, `assets/section-collection.css`, `component-pagination.css` | S-high |
| D3 | feat(embroidery): placeholder motif and divider snippets (7 motifs) | `snippets/embroidery-motif.liquid`, `embroidery-divider.liquid` | S-med |
| D4 | feat(hero): hero-line section and the two line collection templates | `sections/hero-line.liquid`, `templates/collection.descanso.json`, `collection.dia.json`, `assets/section-hero-line.css` | S-high |
| D5 | feat(home): lines-entry, featured collection, home template | `sections/lines-entry.liquid`, `featured-collection.liquid`, `templates/index.json`, CSS | S-high |
| D6 | feat(search): search and collection list | `templates/search.json`, `list-collections.json`, sections | S-med |

### Phase E: product and cart
| # | Commit | Files | Model |
| --- | --- | --- | --- |
| E1 | feat(product): `main-product` shell, gallery (scroll-snap), title/price/description/quantity/buy blocks, native form | `sections/main-product.liquid`, `blocks/*`, `templates/product.json`, `assets/section-product.css` | O-high |
| E2 | feat(product): variant picker block (size chips, sold-out, disabled states) | `blocks/variant-picker.liquid`, CSS | S-high |
| E3 | feat(js): `core.js` namespace + Ajax add to cart with errors and live region | `assets/core.js`, `assets/product-form.js` | O-high |
| E4 | feat(js): variant change without reload (URL update, section rendering) | `assets/variant-picker.js` | O-high |
| E5 | feat(product): accordion and shipping-note blocks (returns, care, shipping) | `blocks/accordion.liquid`, `shipping-note.liquid`, `assets/component-accordion.css` | S-med |
| E6 | feat(product): gallery thumbnail sync | `assets/media-gallery.js` | S-med |
| E7 | feat(cart): cart page, line items, empty state (no JS) | `sections/main-cart.liquid`, `snippets/cart-line-item.liquid`, `templates/cart.json`, `assets/section-cart.css` | S-high |
| E8 | feat(js): Ajax quantity and remove through Section Rendering | `assets/cart-items.js` | O-high |
| E9 | feat(header): live cart count | `snippets/cart-count.liquid`, header edits | S-med |
| E10 | feat(cart): shipping cost and delivery notice (estimator only if R-3 is confirmed) | `sections/main-cart.liquid` | S-high |

### Phase F: quality and handover
F1 is not blocked on R-4: control borders are decided (`--control-border` = `ink-muted`), so the audit checks the implemented choice.

| # | Commit | Files | Model |
| --- | --- | --- | --- |
| F1 | chore(a11y): audit and fixes (contrast script, focus, 44px targets, landmarks, headings, alt text) | various | O-high |
| F2 | perf: LCP and CLS pass (image priority, preloads, font fallbacks with real files, CSS split) | various | O-high |
| F3 | feat(seo): meta tags, Open Graph, structured data | `snippets/meta-tags.liquid`, product section | S-med |
| F4 | docs: dev workflow and Theme Check notes | `docs/DEV.md` | S-med |
| F5 | docs: checkout branding checklist (values copied from tokens) | `docs/CHECKOUT_BRANDING.md` | S-med |

### Phase G: configurator (after F)
| # | Commit | Files | Model |
| --- | --- | --- | --- |
| G0 | docs: configurator design (data model, preview geometry, validation) | `docs/CONFIGURATOR_PLAN.md` | O-high |
| G1 | feat(locales,docs): configurator strings and admin data setup notes | locales, docs | S-med |
| G2 | feat(configurator): block UI for motif, name, thread color (no preview) | `blocks/embroidery-configurator.liquid`, CSS | S-high |
| G3 | feat(configurator): garment preview rendering | `assets/configurator.js` | O-high |
| G4 | feat(configurator): line item properties wired to add to cart and cart display | `product-form.js`, `cart-line-item.liquid` | S-high |
| G5 | chore(configurator): validation, a11y and performance pass | various | S-high |

---

## 9. Open questions and risks

### 9.1 Questions for the owner (design gaps and decisions)
Q-2, Q-7, Q-12 and part of Q-3 are decided (see Resolved decisions in section 0). The remaining questions keep their numbers.

- **Q-1 Missing specs.** Not in the docs, planned as `[P]`: grid gutter; tablet (600 to 1023px) section spacing and hero title size; header height on desktop; main navigation and its mobile pattern; footer design; garment-color selector; product page column split.
- **Q-3 Fonts.** Placeholders stay until the real files arrive (decided). Still open: keep or drop Nunito 600 (listed by `[G][R]`, used by no token), and supply the Fraunces/Nunito WOFF2 files (self-hosting is the plan default).
- **Q-4 Admin data.** Approve creating metafield `mares.line` (product), `mares.personalizable` (product), and a thread-color metaobject. These are admin changes, not theme code.
- **Q-5 One line per page vs general pages.** README: home, cart, checkout use only `bg`, `bg-raised`, `ink`, `brand`; one line's colors per page. So the home cannot show both line colors, and product cards in mixed lists (search, "all products") would show both line tags. Plan: neutral home; tags only where the page has a line. Confirm.
- **Q-6 Art and palette.** Final one-line motif SVGs (7), real garment photos with consistent framing, thread color palette, and which typeface represents an embroidered name in the preview (Fraunces 600 as stand-in).
- **Q-8 Cart drawer.** Not in the design docs. Phase 1 is a cart page. Confirm.
- **Q-9 Search and filters.** Not in the design docs. Phase 1 ships sorting only and a basic search page.
- **Q-10 Customer accounts.** Plan assumes Shopify-hosted accounts (no `templates/customers/*`). Confirm; gift cards also omitted.
- **Q-11 Brand name casing.** `[G]` lists "nombre en título, minúscula o mayúscula" as pending.
- **Q-13 Hover.** "Oscurece `brand` un 8%" is not defined precisely; plan mixes with black.

### 9.2 Accessibility risks (found by computing WCAG ratios from tokens.json)
Targets from `[G]`: 4.5:1 normal text, 3:1 for 24px+ text, icons and control borders, visible focus, 44px targets.

- **R-1 What passes (light):** `ink` on `bg` 9.72, on `bg-raised` 10.93; `ink-muted` on `bg` 5.21; `brand` on `bg` 5.18, on `bg-raised` 5.83; `on-brand` on `brand` 5.18; `error` on `bg` 4.84; `success` on `bg` 5.57; `ink` on sea-glass 6.44, lavender 6.24, blush 7.42, turquoise 4.68, coral 5.53, sun 7.77. The numbers quoted in `tokens.json` (9.7, 5.2, 5.2) check out. `ink` on turquoise (4.68) is the thinnest margin and applies to the 13px `label`.
- **R-4 Control borders (decided).** `[G]` specified a 1px `line` border for fields and chips while also requiring 3:1 for control borders. `line` on `bg` is 1.32:1, on `bg-raised` 1.48:1, and the white field on pearl is 1.12:1. Decision: `--control-border` is `var(--color-ink-muted)` (5.21 on `bg`, 5.86 on `bg-raised`). `guia-web.md` should be updated to match later. F1 audits this choice; it is not blocked.
- **R-5 Dark mode and line colors.** Line colors have one value for both themes. In dark, `ink` on them is 1.2 to 2.0:1 (fail), while `on-brand` (dark) is 6.9 to 11.4:1. The alias `--color-on-line` flips it. Dark stays off until that alias exists (section 2.3). The R-6 focus rule has the same dark problem (`ink` on line colors in dark); the dark-mode commit must switch the in-surface ring to `--color-on-line` as well.
- **R-6 Focus ring on line colors (decided).** The `focus` ring (`brand`) on turquoise is 2.49:1 and on coral 2.95:1 (both under 3:1); sea-glass 3.43, lavender 3.32, blush 3.95, sun 4.14 pass. Decision: inside `[data-line]` surfaces `--focus-ring-color` is `var(--color-ink)` (4.68 or better on all six line colors); elsewhere it stays `var(--color-focus)`. The same numbers show `brand` text on any line color fails 4.5:1 (best case 4.14), so no brand-colored text or secondary buttons over line colors.
- **R-7 Other:** color never as the only signal (errors, selected chip, sold out, disabled); icon-only buttons need accessible names; one `h1` per page; skip link; `prefers-reduced-motion`; alt text depends on merchant data entry; `label` uppercase done by CSS so screen readers read normal text.

### 9.3 Performance risks (target LCP < 2.5s on 4G mobile `[G]`)
- LCP is the hero block/image or the first product image. It must be eager with `fetchpriority="high"`, correct `srcset`/`sizes`, explicit `width`/`height`, and never lazy.
- Fonts: swap prevents invisible text; real fonts cause layout shift unless fallback metrics are adjusted (F2). Preload only two faces.
- Render-blocking CSS must stay small (budget in section 4). No carousel or animation libraries.
- Third-party code (analytics/ad pixels for the ad traffic `[G]`, any apps) can sink LCP and is outside the theme. Measure with and without. Each app block must be justified.
- Images: merchant uploads must be sized sensibly; Shopify CDN formats `[V]`.
- Measure with Lighthouse mobile throttled, on a published dev theme, at F2 and after real photos arrive.

### 9.4 Platform and business risks
- **R-2 Checkout (non-Plus).** No checkout code. Only branding in the checkout editor (logo, colors, fonts, corner radius and similar) `[V]`. Branding values must be typed by hand from `tokens.json`, so the cart-to-checkout visual jump is accepted. Configurator choices appear in checkout as plain property lines. The gateway is undecided and nothing in the theme depends on it. Checkout address fields (department and city as lists, 10-digit mobile `[G]`) follow what Shopify provides for Colombia `[V]`, not the theme.
- **R-3 Shipping before payment `[G]`.** Shopify normally calculates shipping at checkout. A cart estimator (`/cart/shipping_rates.json`) must be verified for current support and Colombian addresses `[V]`. Fallback: static text from `shipping_note`.
- **R-8 Personalization correctness.** Line item properties are not validated by Shopify. Bad input (long names, odd characters) reaches the order. Mitigation: client-side limits now, manual review in production, validation Function later (out of scope).
- **R-9 Logo and assets.** `assets/Logos` (README) does not fit Shopify's flat assets. Final logo not available.
- **R-10 Price format.** `$89.900` needs store money format `${{amount_no_decimals_with_comma_separator}}` in admin settings `[V]`. This is an admin setting, not theme code.
- **R-11 Copy.** Several UI strings (sold out, remove, quantity, etc.) are not in the docs. Placeholders in the locale file, reviewed by the owner against the tone rules in `[R]` (no false urgency, no diminutives in every sentence).
- **R-12 No store connection yet.** Visual verification needs `shopify theme dev` against a development theme later. That touches the store and needs approval at that time.

### 9.5 Contradictions and ambiguities found in the design docs
1. **Font weights.** README: both fonts at 400/600/700. Guide: Fraunces 600, Nunito 400/600/700. tokens.json: Fraunces 600 only; Nunito 400 and 700 only (no token uses Nunito 600). `type.fonts` is empty.
2. **Control borders** (R-4, resolved): guide requires 3:1 but specifies `line` (1.32:1); the `line` token says not to use it alone. The plan uses `ink-muted`; the guide still says `line` until updated.
3. **Dark values** (R-5): README says `ink` on line colors is fine; dark `ink` fails there.
4. **Focus ring** (R-6, resolved): `focus` token fails 3:1 on turquoise and coral. The plan switches to `ink` inside `[data-line]` surfaces.
5. **Home page and lines:** README says home uses only general colors and each page one line, while the brief asks for a hero per line and the tag spec uses both line colors.
6. **README turquoise wording:** the list of colors that may carry `ink` omits turquoise, the next sentence says use only `ink` on turquoise. Contrast says `ink` is OK (4.68).
7. **Shadow:** README says `shadow-soft` only on hover; the token also lists dropdown menus.
8. **display-sm:** guide uses it for the card name; the token says product page name. Treated as both.
9. **Mobile first:** guide says mobile first; this plan's brief says fluid at all sizes with 375px working well. The brief wins; 375px stays the first test width.
10. **Tablet gaps:** spacing, hero type and card columns are specified for mobile and desktop only.
11. **"Darken 8%"** has no definition.
12. **`assets/Logos`** conflicts with Shopify's flat `assets/`.
13. **"Every color from a token"** vs thread-color swatches (merchant data) and `theme-color` meta.
