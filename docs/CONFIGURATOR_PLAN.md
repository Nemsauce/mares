# Mares: embroidery configurator plan (phase 1)

Status: design only. No configurator code exists. This document is commit G0 of `docs/THEME_PLAN.md` section 8 and expands section 7 of that plan. Where the two disagree, this document wins for the configurator, except for the "Resolved decisions" list in `THEME_PLAN.md` section 0, which wins over both.

Read with: `docs/THEME_PLAN.md` (sections 5, 6.6, 7, 9), `docs/design/README.md`, `docs/design/guia-web.md`, `docs/content/catalogo-y-copy.md`.

## 0. Conventions

**Source tags.** Same convention as `THEME_PLAN.md` section 0, plus one tag for the content file:

| Tag | Meaning |
| --- | --- |
| `[T]` | `docs/design/tokens.json` |
| `[G]` | `docs/design/guia-web.md` |
| `[R]` | `docs/design/README.md` |
| `[C]` | `docs/content/catalogo-y-copy.md` (content source; README wins over it) |
| `[TP]` | Already decided or built in `docs/THEME_PLAN.md` or the theme code (section number or file given) |
| `[P]` | **Proposal.** The documents are silent. Needs owner confirmation. Never treated as design truth. |
| `[V]` | Shopify platform behavior to verify against current Shopify docs before the commit that depends on it. |
| `C-n` | Open question in section 12. Nothing tagged with it can be built until it is answered. |

**Fixed limits from the brief and the plan.**

- Phase 1 has no AI. The customer picks a motif, types a name or initial, picks a thread color, and sees a preview on the garment. AI generation is phase 2, with a per-customer attempt limit `[G]`.
- Personalization costs nothing extra in phase 1, so there is no pricing logic anywhere: no surcharge variant, no fee line, no price shown in the configurator (decided, Q-7, `[TP]` section 0).
- The theme cannot validate anything on the server (section 5.4).
- Thread colors are merchant data, not design tokens. They are the one documented exception to the no-color-literal rule (`THEME_PLAN.md` section 2.7 and 9.5 item 13). The exception covers merchant data rendered at runtime only; no hex value is ever written in a theme file, so `scripts/check-no-hex.sh` keeps passing unchanged.
- Nothing in this document invents a thread color, motif artwork, garment measurement or embroidery position. Where the brand has not decided, section 12 asks.

**What already exists and is reused** `[TP]`:

| Piece | File | Used for |
| --- | --- | --- |
| Chip, radio pattern (`.chip__input` + `label.chip`), 44px target, selected = `brand` fill, unavailable = dashed + strike + text | `assets/component-chip.css` | Motif and thread color options |
| Field (visible label, 48px, `aria-invalid` error state with `.field__message` in the `error` color) | `assets/component-field.css` | Name or initial input |
| Button | `snippets/button.liquid`, `assets/component-button.css` | No new button: the existing "Agregar al carrito" stays the single primary button `[R]` |
| Embroidery motif artwork (7 slugs, 48-unit grid, `stroke="currentColor"`, non-scaling 2px stroke, placeholder art) | `snippets/embroidery-motif.liquid` | Motif chips and the preview layer |
| Icons (`check`, `spool`, `feather`, ...) | `snippets/icon.liquid` | Selected mark, section heading decoration |
| Skeleton | `assets/component-skeleton.css` | Preview while the garment image loads |
| Cart line properties rendered as visible `dt`/`dd` text; keys starting with `_` hidden; names and values escaped; blank values skipped | `snippets/cart-line-item.liquid` | Showing choices in the cart. No change needed. |
| Add to cart posts `new FormData(form)`, which includes every input that joins the form with `form="product-form-{{ product.id }}"` | `assets/product-form.js`, `blocks/buy-buttons.liquid`, `blocks/quantity.liquid` | Sending properties with and without JS. No change needed. |
| `window.Mares.announce` (single polite live region), `Mares.events` | `assets/core.js`, `layout/theme.liquid` | Every announcement in this document |
| Variant change swaps only price, buy region, picker form and quantity state | `assets/variant-picker.js` | The configurator block is never swapped, so its state survives a size change. The buy form keeps its id, so `form=` keeps pointing at it. |

---

## 1. What the customer does

### 1.1 Before they touch anything

On a personalizable product (section 2.2, `mares.personalizable` is true) the product page shows, in the information column, the existing blocks plus one new block, `embroidery-configurator`, placed after `quantity` and before `buy-buttons` `[P]` (so the choices sit above the button that sends them).

The block shows, top to bottom `[P]` (layout), with copy from C-12:

1. A heading, for example "Personalízala" `[P]` (C-12), and one sentence saying what can be chosen.
2. **Motivo** `[G]`: a labelled group of chips, one per allowed motif (section 2.3), each chip showing the motif drawing (`embroidery-motif`, 32px `[P]`) and its name as text. What is preselected depends on C-2.
3. **Nombre o inicial** `[G]`: a text field with a visible label, a hint under it giving the allowed characters and the maximum length (C-4, C-5), empty.
4. **Color de hilo** `[G]`: a labelled group of chips, one per thread color, each chip a small swatch plus the color's name as text. None selected `[P]` (section 2.4 explains why there is no default).
5. The no-exchange notice, copied from the returns policy `[C]`: personalized garments with a name or initial have no exchange because they are embroidered only for the customer. Whether the customer must tick a box to accept it is C-15.
6. The preview panel is **not shown yet** `[P]`. It appears after the first choice (section 8.3). Before that, the gallery above already shows the garment.

Nothing is announced on page load.

### 1.2 Phone (0 to 599px)

The information column is full width, below the gallery `[TP]` 6.6.

1. The customer scrolls past the gallery, title, price, size chips and quantity, and reaches the configurator.
2. They tap a motif chip. The chip turns selected (`brand` fill, check icon, `[TP]` chip). The preview panel appears at the top of the block, showing the garment photograph with the motif drawn in the embroidery zone (section 4). One announcement (section 6).
3. They tap the name field. The phone keyboard opens. The preview sits above the field `[P]`, so on most phones it is still visible above the keyboard while typing; this needs checking at 375px with a real keyboard (F1 pass). The preview text updates as they type; nothing is announced per keystroke.
4. They leave the field (tap elsewhere or close the keyboard). The value is trimmed and checked (section 5). If it is invalid, the message appears under the field and is announced once.
5. They tap a thread color. The motif and name in the preview take that color. One announcement.
6. They choose a size (existing picker) at any point; the configurator keeps its state.
7. They tap "Agregar al carrito". If anything is missing or invalid, nothing is sent: focus goes to the first problem, its message shows and is announced (section 6). Otherwise the existing add-to-cart flow runs and announces "Agregado al carrito" `[TP]`.

### 1.3 Desktop (1024px and up)

Same steps. The gallery is on the left (7 of 12 columns) and the information column on the right (5 of 12) `[TP]` 6.6. The preview panel sits inside the configurator block in the right column, at most the column width, 4:5 `[G]`, so the photo, the controls and the result are visible together without scrolling on a 900px-tall window `[P]` (verify in the F1 pass). Tablet (600 to 1023px) behaves like the phone layout with more width.

### 1.4 Without JavaScript

The motif and thread color radios, the name field and the hidden version field still join the add to cart form and are posted with it (section 3). The browser's own validation runs from the HTML attributes (`required`, `maxlength`, `pattern`) with the browser's message text, not ours. There is no preview: the panel is rendered `hidden` and only the script reveals it. Everything else works.

---

## 2. Data model

### 2.1 Overview

| Data | Lives in | Type | Filled by |
| --- | --- | --- | --- |
| Product is personalizable | Product metafield `mares.personalizable` | `boolean` | Owner, per product |
| Product line | Product metafield `mares.line` (exists, used by the theme) `[TP]` | `single_line_text_field`, values `descanso` or `dia` | Owner, per product |
| Motifs offered on this product | Depends on C-2 (section 2.3) | | |
| Thread colors | Metaobject definition `mares_thread_color` | entries | Owner |
| Thread colors offered on this product | Product metafield `mares.thread_colors` (optional) `[P]` | `list.metaobject_reference` to `mares_thread_color` | Owner, only to restrict (C-8) |
| Embroidery zone | Product metafields `mares.embroidery_*` (section 2.5) | numbers and an image reference | Owner, per product (values from C-10) |
| Name length limit | Product metafield `mares.name_max_length` `[P]` | `number_integer` | Owner, per product (C-4) |
| Configurator copy (labels, hints, errors, announcements, preview note) | `locales/es.default.json` | strings | Developer copies them from owner-approved text (C-12) |
| Block placement | `templates/product.json` block `embroidery-configurator` | theme block, no settings `[P]` | Developer once; owner can move it in the theme editor |
| Motif artwork and slugs | `snippets/embroidery-motif.liquid` `[TP]` | SVG paths | Developer, from the designer's files (Q-6) |
| Motif display names | `locales/es.default.json` | strings | Developer, from `[R]` |
| Property keys and format version | Theme code (section 3) | constants | Developer |

**The merchant maintains:** the personalizable flag, the line, thread colors, per-product thread restriction, embroidery zone, name length limit. All in the Shopify admin, no code.
**The theme hard-codes:** the seven motif slugs and their artwork, their display names (locale), which line owns which motif `[R]`, the property keys, the validation character set, the format version, all UI copy (locale).

Why metafields and metaobjects and not section settings: settings are per template, while every value above is per product (one product template serves all six products) or shop-wide data the owner edits without opening the theme editor. The block has no settings `[P]`.

### 2.2 `mares.personalizable` (product, boolean)

- `true`: the block renders and `configurator.js` loads.
- `false` or empty: the block renders nothing, no script loads, and the page is exactly today's page.
- Which of the six products get `true` is C-3.

### 2.3 Motifs

The seven motifs and their lines are fixed by the brand `[R]`:

| Line | Slug (`embroidery-motif`) | Display name (sentence case `[R]`) |
| --- | --- | --- |
| Descanso | `ola-suave` | Ola suave |
| Descanso | `luna-sobre-el-mar` | Luna sobre el mar |
| Descanso | `conchitas-nacaradas` | Conchitas nacaradas |
| Día | `estrella-de-mar` | Estrella de mar |
| Día | `caballito-de-mar` | Caballito de mar |
| Día | `palmita` | Palmita |
| Día | `sol` | Sol |

A product page shows only one line `[R]`, so it offers only its own line's motifs `[TP]` 7.

**Blocked by C-2.** Every product in the catalog already carries one motif in its name and description ("Pijama ola suave": "una ola bordada en el pecho") `[C]`. What "choosing a motif" means on such a product is undecided. The two readings need different data:

| If the answer is | Motif chips show | Preselected | Extra data |
| --- | --- | --- | --- |
| A. The product's motif is fixed; the customer adds a name or initial in a chosen thread color | No motif group at all, or the product's motif shown as information | n/a | Product metafield `mares.motif` (`single_line_text_field`, one slug), so the preview knows which drawing to place |
| B. The customer picks any motif of the line; the product's own motif is the default | The line's 3 or 4 motifs | The product's motif | Same `mares.motif` metafield, used as the default |
| C. The customer adds a second, chosen motif next to the product's own | The line's motifs | none | `mares.motif` plus a second zone (out of scope as written in 9, "several embroidery locations") |

The plan's section 7 and the guide's wording ("motivo de bordado" as a choice `[G]`) read as B. This document builds B **only after C-2 confirms it**; the data model above works for A and B unchanged.

### 2.4 Thread colors (metaobject `mares_thread_color`)

| Field key | Type | Required | Meaning |
| --- | --- | --- | --- |
| `name` | `single_line_text_field` | yes | The name the customer reads and the order shows, e.g. the brand's own name for the thread. Sentence case `[R]`. |
| `color` | `color` | yes | The swatch and the preview tint. The only color literal that reaches the page, and it comes from data `[TP]` 2.7. |
| `available` | `boolean` | yes, default true `[P]` | False hides the color without deleting it, so past orders still read sensibly. |

- Order of the entries in the admin is the order of the chips `[P]` `[V]` (confirm that `shop.metaobjects.mares_thread_color.values` keeps admin order).
- The definition needs **storefront access** turned on, or Liquid cannot read it `[V]`.
- No entry exists yet. Names and colors are C-7. None is invented here.
- **No default color** `[P]`: preselecting the first entry would make every unpersonalized purchase post a thread color without JS (section 3.4). The customer chooses.
- If `mares.thread_colors` is set on a product, only those entries are offered there (C-8). Otherwise every `available` entry is.
- Liquid reads them; the theme renders each as a radio chip with `style="--swatch: {{ entry.color }}"` on the swatch element only. Light thread colors on `bg-raised` may fall under 3:1, so the swatch always carries a 1px `--control-border` ring `[P]` (R-4 color), and the name is always visible text (section 7.3).

### 2.5 Embroidery zone (per product)

The preview needs to know where on one specific photograph the embroidery goes. Values are percentages of that photograph, so they hold at every image size.

| Metafield | Type | Meaning |
| --- | --- | --- |
| `mares.embroidery_image` | `file_reference` (image) | The photograph the preview uses. Must be one of the product's own photos `[P]`, shot with the garment flat and front-on (C-11). |
| `mares.embroidery_x` | `number_decimal` | Left edge of the zone, percent of the image width (0 to 100). |
| `mares.embroidery_y` | `number_decimal` | Top edge, percent of the image height. |
| `mares.embroidery_width` | `number_decimal` | Width of the zone, percent of the image width. |
| `mares.embroidery_height` | `number_decimal` | Height of the zone, percent of the image height. |

- The zone is a rectangle with no rotation `[P]` (rotation is out of scope, section 9).
- Inside the zone the theme lays out the motif and the name with one fixed rule. Which rule (name under the motif, beside it, above it; the motif-to-name size ratio) is **C-10**. Until then the developer builds the zone as two stacked boxes in a ratio left as a single constant in `configurator.js`, marked `[P]` in a comment.
- Values per product are the owner's or the workshop's, measured on the chosen photo (C-10). Garment measurements in centimeters are not needed for phase 1: the preview is approximate and says so (section 4.4).
- If any of the five metafields is empty, the product falls back to section 4.3 (no photograph).

### 2.6 Name length (`mares.name_max_length`, product, integer)

Per product `[P]`, because a blanket corner and a baby's chest hold different lengths. The value is C-4. If empty, the theme uses one theme-wide fallback (also C-4). The number goes into `maxlength`, the hint text and the JS check.

---

## 3. How the choices reach the order

### 3.1 Transport

The configurator inputs live in the `embroidery-configurator` block, outside the add to cart `<form>`, and join it with `form="product-form-{{ product.id }}"`, exactly as the quantity input does today `[TP]`. Their `name` attributes are `properties[<key>]`. So:

- Without JS, the native form post to `/cart/add` carries them.
- With JS, `product-form.js` posts `new FormData(form)` to `/cart/add.js`, which already includes them. **No change to `product-form.js`.**
- Same variant with different properties becomes a separate cart line `[TP]` 7 `[V]`.
- Line item properties are text. Keep each value short; Shopify's limits on property length and count are `[V]`.

### 3.2 Keys and values

| Key | Visible to customer | Value shape | Example shape (not real data) |
| --- | --- | --- | --- |
| `Motivo` `[TP]` 7 | yes | The motif's display name from section 2.3, exactly as in the table | `Ola suave` |
| `Nombre o inicial` `[TP]` 7 | yes | The validated text (section 5): trimmed, inner spaces collapsed, Unicode NFC | `<the typed name>` |
| `Color de hilo` `[TP]` 7 | yes | The thread entry's `name` field, never the color value `[TP]` 7 | `<thread name>` |
| `_config_version` `[TP]` 7 | no | `1` for this phase | `1` |
| `_motivo` `[P]` | no | The motif slug from section 2.3 | `ola-suave` |
| `_hilo` `[P]` | no | The thread metaobject entry's handle | `<entry handle>` |

Why the two hidden extra keys `[P]`: visible values are words for people and may be renamed later; the slug and the handle let the workshop map an old order to the right artwork and thread even after a rename. The theme never reads them back.

Key order in the form: Motivo, Nombre o inicial, Color de hilo, then the hidden keys `[P]`; the cart shows them in submitted order `[V]`.

### 3.3 Where they appear

| Place | What shows | Source |
| --- | --- | --- |
| Cart page | The three visible keys as `dt`/`dd` text under the line; underscore keys hidden; values escaped; blank values skipped | `snippets/cart-line-item.liquid` `[TP]`, unchanged |
| Header count, cart Ajax updates | Lines with different properties count and update separately; quantity changes keep the properties (update by line key) | `assets/cart-items.js` `[TP]`, unchanged |
| Checkout (non-Plus, no checkout code `[TP]` R-2) | Visible keys listed under the item; underscore keys hidden | Shopify `[V]` |
| Order confirmation email | Visible keys; underscore keys hidden in the default template | Shopify `[V]` |
| Admin order page | All properties on the line item; whether underscore keys are shown to staff is `[V]`. The workshop reads `Motivo`, `Nombre o inicial`, `Color de hilo` from here | Shopify `[V]` |

Editing a configured line in the cart is out of scope: the customer removes it and adds it again `[TP]` 7.

### 3.4 When nothing is personalized

Whether personalization is optional on a personalizable product is **C-1**.

- **If optional `[P]`:** "personalized" means the name field is filled. With JS, while the name is empty the script disables the motif, color and hidden inputs, so a plain purchase posts no properties at all (disabled inputs are not submitted). Without JS, unchecked radios post nothing and the empty name posts an empty value, which the cart already hides; whether Shopify keeps an empty property on the order is `[V]`. A customer without JS who types a name but picks no color reaches the cart incomplete; the theme cannot stop that (section 5.4).
- **If mandatory:** all three inputs are `required`, the hidden keys are always sent, and the "Agregar al carrito" button stays the only way forward.

---

## 4. The preview

### 4.1 How it is drawn

- A `<div>` with the garment photograph (`mares.embroidery_image`, rendered through `snippets/image.liquid` with `aspect_ratio: '4 / 5'`, `srcset`, `width`/`height` `[TP]`) and an absolutely positioned SVG layer on top, same box.
- The SVG uses `viewBox="0 0 100 125"` (4:5) `[P]`, so section 2.5 percentages map straight to user units (`x`, `width` × 1, `y`, `height` × 1.25) whatever the displayed size.
- **Motif:** the chosen motif's drawing, taken from the chip already on the page (the script clones the chip's `svg.embroidery-motif` node; no second copy of the artwork is shipped). Placed in the motif box of the zone (layout rule C-10), `stroke` set to the thread color, 2px non-scaling stroke as in the snippet `[TP]`.
- **Name:** an SVG `<text>` in the name box of the zone, `fill` set to the thread color, centered, scaled down to fit the box width (`textLength` with `lengthAdjust="spacingAndGlyphs"` only when it overflows) `[P]`. Typeface: Fraunces 600 as the stand-in for embroidery lettering until the brand chooses one (Q-6, here C-9). The font is the page's display font, already loaded for headings, so the preview adds no font file.
- Before a thread color is chosen, the motif and name are drawn in `--color-ink-muted` `[P]` (the embroidery stroke color for decoration `[R]`), so the preview never shows a color the customer did not pick.
- The preview image is client-side only and **never saved in the order** `[TP]` 7.
- No animation, no zoom, no drag `[G]` (`prefers-reduced-motion`; out of scope 9).

### 4.2 Per-product data it needs

The five `mares.embroidery_*` metafields (2.5) and the motif (2.3). Nothing else. Garment color variants have no design spec (Q-1); the preview uses one photo per product, not per variant `[P]`.

### 4.3 When the product has no photograph (or no zone)

`[P]`: the panel shows a plain 4:5 box (`bg-raised`, 1px `line` border, `--radius-lg`, as the empty product slide does today `[TP]`) with the motif and name centered in a default zone covering the middle of the box. The preview note (4.4) then says the placement is illustrative. If the owner prefers no preview at all in this case, the panel stays hidden and only the text summary (4.5) remains (part of C-10).

### 4.4 "Approximate preview" note

A short line under the preview saying it is approximate (thread, size and position may vary) `[TP]` 7. The words are C-12.

### 4.5 What a screen reader user gets

- The preview layer is `aria-hidden="true"`. It repeats what the controls already state.
- Under the preview, a visible text summary of the current choices, e.g. "Ola suave, con el nombre <name>, en hilo <thread name>" (wording C-12). It is ordinary text, always readable, not a live region.
- Changes are announced through the existing live region (section 6), not by the summary.
- The garment photograph keeps the product media's alt text `[G]`, falling back to the product title `[TP]`.

---

## 5. Validation

### 5.1 Rules for "Nombre o inicial"

| Rule | Value | Tag |
| --- | --- | --- |
| Allowed letters | A to Z, a to z, á é í ó ú ü ñ and their capitals (Á É Í Ó Ú Ü Ñ) | `[TP]` 7 ("letters including ñ and tildes"); full set `[P]` |
| Spaces | Allowed between words, or not at all | C-5 |
| Hyphen, apostrophe, period ("María-José", "D'Andrea", "A.") | Not allowed `[P]` | C-5 |
| Digits, emoji, other scripts, symbols | Not allowed `[P]` | |
| Length | 1 to `mares.name_max_length` characters, counted after trimming | C-4 |
| Case | Kept exactly as typed, or forced (all capitals, capitalized) | C-6 |
| Name vs initial | One field accepts both; an initial is just a one-letter name `[P]` | C-17 |
| Required | Depends on C-1 | C-1 |

### 5.2 How it is applied

**HTML, always (works without JS):**
- `maxlength` = the limit.
- `pattern` = the allowed set, including the combining acute, tilde and diaeresis marks (U+0301, U+0303, U+0308) so that a decomposed "ñ" typed on some keyboards also passes `[P]` `[V]` (browser `pattern` handling).
- `required` only if C-1 says personalization is mandatory.
- `autocomplete="off"`, `autocapitalize="words"` `[P]`, `spellcheck="false"`, `inputmode="text"`.

**JS (`configurator.js`), before the value is used:**
1. Normalize to Unicode NFC (`String.prototype.normalize('NFC')`), so "n + combining tilde" becomes "ñ" and length counts are right.
2. Trim, and collapse runs of spaces to one (if spaces are allowed, C-5).
3. Apply case rule (C-6), if any.
4. Check against the allowed set and the length.
5. Write the cleaned value back into the field on `change` (not on every keystroke, so the caret never jumps).

**When it runs:** on `change` (leaving the field) and on submit. Not on every keystroke: the preview updates while typing, the error does not appear until the customer leaves the field `[P]`.

### 5.3 On bad input

- The field gets `aria-invalid="true"`, the 2px `error` border, and a text message under it (`.field__message`, linked with `aria-describedby`) `[G]` `[TP]`. Never color alone.
- The message says what is allowed, not only that something is wrong (wording C-12), e.g. which characters and the maximum length.
- On submit, the script listens for the inputs' native `invalid` event (fired before `submit`), cancels the browser bubble, shows our message, moves focus to the first invalid control and announces once (section 6). `product-form.js` is never reached, because an invalid form does not fire `submit`. No coupling between the two scripts.
- Without JS the browser's own bubble and wording appear instead; acceptable degradation.

### 5.4 What the theme cannot enforce, and the brand must accept

Line item properties are not validated by Shopify `[TP]` R-8. Anyone can post to `/cart/add` with any properties: a 500-character name, a motif from the other line, a thread color that does not exist, a `_config_version` of `9`, or no personalization at all on a mandatory product. A customer without JS who skips a field reaches the cart with an incomplete set. Client-side rules stop honest mistakes only.

Consequences the brand accepts in phase 1:

1. **Every personalized order is checked by a person before embroidery.** The checklist in section 11 includes this step.
2. A bad order is fixed by contacting the customer, not by the store.
3. Because personalization is free (Q-7), forged properties cannot change a price. The risk is wrong embroidery, not money.
4. Real enforcement needs a Cart and Checkout Validation Function (an app, not theme code), out of scope (section 9).

---

## 6. States and errors

All announcements go through `Mares.announce` (the single polite live region in `layout/theme.liquid`) `[TP]` 5. One state change, one announcement. Wording is C-12; the shapes below are `[P]`.

| State | What the customer sees | Announced |
| --- | --- | --- |
| Product not personalizable | Nothing: the block renders no markup, no script loads | Nothing |
| Script not loaded yet / failed / no JS | All controls work and post with the form; preview panel stays hidden | Nothing |
| Nothing chosen yet | Controls, hint, notice; no preview panel; no selected chip (except the default motif if C-2 is B) | Nothing |
| Preview image loading (first choice) | Panel appears with a 4:5 skeleton (`component-skeleton.css`, `aria-hidden`) until the photo loads; the SVG layer is drawn on top as soon as the image box exists | Nothing extra: the choice itself is announced (next row) |
| Motif or thread color chosen | Chip selected; preview updated; summary text updated | Once per choice, e.g. "Motivo: Ola suave" / "Hilo: <name>" |
| Name typed | Preview text updates live | Nothing per keystroke. On `change`, if valid, nothing (the field already holds what they typed) `[P]` |
| Name invalid | Field error state and message | Once, the message text, on `change` |
| Submit with a missing or invalid choice | First problem gets focus, its message shows; other problems show their messages too | Once: the first problem's message, plus how many problems there are when there are several `[P]` |
| Preview image fails to load | Panel falls back to the no-photograph box (4.3) | Nothing (the choices are unaffected) |
| Add to cart succeeds or fails | Existing `product-form.js` behavior: "Agregado al carrito", stock error text, network error text `[TP]` | Once, by `product-form.js` only. The configurator announces nothing on submit success |
| Size changed with the variant picker | Configurator keeps every choice; preview unchanged | Only the picker's own announcement `[TP]` |

The configurator listens to no cart events and dispatches none: it only owns its inputs `[TP]` 5 ("nothing else is coupled").

---

## 7. Accessibility

### 7.1 Labelling

- The block is a `<section>` with an `h2` heading (wording C-12); the product title stays the page's only `h1` `[TP]` R-7.
- Motif and thread color are each a `<fieldset>` with a visible `<legend>` ("Motivo", "Color de hilo" `[G]`), styled like the size picker's legend (`.variant-picker__legend` look: `label` style, `ink-muted`) `[TP]`.
- Options are native radios (`input.chip__input.visually-hidden` + `label.chip`) `[TP]` chip: arrow keys move within a group, one tab stop per group, checked state exposed by the platform.
- The name field has a visible `<label>` and its hint linked with `aria-describedby` `[G]`. The error message is added to the same `aria-describedby` when shown.
- The no-exchange notice is plain text in the block, before the add to cart button in reading order.

### 7.2 Targets

Every chip is at least 44 × 44px (`component-chip.css`) `[G]`. The name field is 48px tall `[G]`. Motif chips holding a 32px drawing plus text stay within the 44px minimum height `[P]`.

### 7.3 Thread colors without relying on color

- Every thread chip shows the color's **name as text** next to the swatch. The name is the label; the swatch is decoration (`aria-hidden`).
- The swatch has a 1px `--control-border` ring so a pale thread stays visible on `bg-raised` `[P]`.
- Selected state is the chip component's own: `brand` fill, `on-brand` text, plus the `check` icon `[TP]`. On the selected (brand-filled) chip the swatch keeps its ring in `on-brand` `[P]` so a dark-blue thread stays distinguishable from the fill.
- An unavailable color is not rendered (2.4 `available`), so there is no color-only disabled state.
- The preview uses the thread color, but the summary text names it, so nothing is conveyed by color alone.

### 7.4 Announcing the preview

The visual preview is `aria-hidden`. Each discrete choice is announced once (section 6); typing is not announced; the summary text under the preview is always current for anyone who navigates to it.

### 7.5 Other

- Focus ring: global `:focus-visible`, drawn on the chip for radios `[TP]` chip; inside the `[data-line]` product section the ring is `ink` (R-6) `[TP]`.
- `prefers-reduced-motion`: there is no motion to remove; the skeleton pulse already stops `[TP]`.
- Language: the name is user text, rendered with `lang` unset (inherits `es`).

---

## 8. Performance

### 8.1 Where the theme is today (measured, HEAD `1a58e78`)

Gzipped bytes, `gzip -c <file> | wc -c`:

| File | Bytes | Loads on |
| --- | --- | --- |
| `core.js` | 2347 | every page with the header |
| `header-menu.js` | 856 | every page with a menu |
| `product-form.js` | 1579 | product |
| `variant-picker.js` | 2054 | product with more than one variant |
| `media-gallery.js` | 1198 | product with more than one media |
| `cart-items.js` | 2560 | cart |
| **All phase 1 JS** | **10594** | |
| **Product page, worst case today** | **8034** | core + header-menu + product-form + variant-picker + media-gallery |

The brief's "8 KB" is the product page figure; the whole theme is 10.6 KB. `THEME_PLAN.md` section 5 keeps the configurator outside the 15 KB phase 1 budget.

### 8.2 Budget `[P]`

- `configurator.js`: at most **4 KB gzipped**, and under the 10,000-byte uncompressed per-file limit Theme Check enforces (`.theme-check.yml`, `AssetSizeJavaScript`).
- Product page JS with the configurator: at most **12.5 KB gzipped** (8.0 today + 4 + margin), comfortably inside the phase 1 15 KB figure even though the configurator is outside it.
- `component-configurator.css`: under 10 KB uncompressed (the per-component budget, `THEME_PLAN.md` section 4); expected far less, since chips and fields reuse existing CSS.
- HTML added by the block: the line's 3 or 4 motif drawings (each a few hundred bytes of SVG, already in the snippet) plus one chip per thread color. No JSON blob of data: everything the script needs is in the markup.

### 8.3 What loads when

| When | What |
| --- | --- |
| Page load, personalizable product only | Block markup, `component-configurator.css`, `configurator.js` with `defer` (small: listeners, validation, normalization) |
| Not loaded on any other page or product | All of the above |
| First choice in the block (pointer or keyboard) | The preview panel is revealed and its photograph is requested. If `mares.embroidery_image` is the gallery's first image at a size the browser already holds, this costs nothing; otherwise one 4:5 image through `srcset`, `loading="lazy"` before reveal `[TP]` image snippet |
| Never | Fonts (the preview uses the already-loaded display face), libraries, a canvas, a second copy of the motif artwork |

The preview photo must never be the LCP candidate: it is below the fold and hidden until the first choice. LCP stays the first gallery image `[TP]` 9.3.

---

## 9. Out of scope for phase 1, and why

| Item | Why it is out |
| --- | --- |
| AI generation and per-customer attempt limits | Phase 2 by the brand's own scope `[G]` |
| Any price or surcharge for personalization | Decided: no extra cost in phase 1 (Q-7) |
| Server-side validation (Cart and Checkout Validation Function) | Needs an app, not theme code `[TP]` R-8; the brand accepts manual review (5.4) |
| Customer image or file uploads | Not in the phase 1 brief `[G]`; needs storage and moderation |
| Saving the preview image on the order; production file export | The preview is approximate by design; the workshop works from the three visible properties `[TP]` 7 |
| Free drag, resize or rotation of the motif or name | Needs per-garment physical limits nobody has defined; one fixed zone keeps orders producible |
| Several embroidery locations on one garment | Same reason; also reading C of C-2 |
| Stitch simulation (texture, thread sheen) | Large cost for an approximate preview; no design spec |
| Editing a configured line in the cart | Remove and re-add is enough at this volume `[TP]` 7; editing needs a cart drawer that does not exist (Q-8) |
| Saved designs, customer accounts integration | No accounts work in phase 1 (Q-10) |
| Translations other than Spanish | Store is Spanish only `[R]` |
| A personalization-specific delivery time | Undecided by the brand (C-13); if it exists it is text, not logic |
| Per-variant (garment color) preview photos | Garment color selection has no design yet (Q-1) |

---

## 10. Commits to build it

Models as in `THEME_PLAN.md` section 8: **S-med** = Sonnet 5.5 medium effort, **S-high** = Sonnet 5.5 high effort, **O-high** = Opus high effort. Every commit follows that section's definition of done (Theme Check clean, `check-no-hex.sh` clean, 375px and 1280px, keyboard pass, only the named files).

| # | Commit | Files | Needs answered | Model |
| --- | --- | --- | --- | --- |
| G0 | docs: configurator design (data model, preview, validation) | `docs/CONFIGURATOR_PLAN.md` | none | O-high |
| G1 | feat(locales): configurator strings | `locales/es.default.json`, `locales/es.default.schema.json` | C-12 | S-med |
| G2 | feat(configurator): block markup without script (motif chips, name field, thread chips, notice, hidden keys joined to the product form) | `blocks/embroidery-configurator.liquid`, `assets/component-configurator.css`, `templates/product.json` | C-1, C-2, C-3, C-4, C-5, C-7, C-15 | S-high |
| G3 | feat(configurator): normalization, validation messages, disabled-when-empty, announcements | `assets/configurator.js`, block hook attributes | C-1, C-5, C-6 | O-high |
| G4 | feat(configurator): preview over the garment photo, no-photo fallback, text summary | `assets/configurator.js`, block markup, CSS | C-9, C-10, C-11 | O-high |
| G5 | chore(configurator): end-to-end check of properties in cart, checkout, email and admin; fix only what the `[V]` items turn up | verification notes in this file; code only if a `[V]` fails | a dev store with real metafields | S-high |
| G6 | chore(configurator): accessibility and performance pass at 320, 375, 1024, 1280px; budget numbers recorded here | various, configurator files only | none | S-high |

Notes:
- G2 is useful on its own: with it, personalized orders already work without any script.
- G3 and G4 both edit `configurator.js`; keep G4's preview code in clearly separate methods so G3 stays reviewable.
- No commit touches `product-form.js`, `cart-line-item.liquid` or `cart-items.js`. If one seems to need it, stop and revisit section 3.

---

## 11. Owner checklist in the Shopify admin

Do these in order. None needs a developer. Each step says where to click in the admin `[V]` (names of menus may differ slightly; ask before guessing).

**A. Answer the questions first.** Section 12, at least C-1 to C-8. Nothing below can be filled correctly before that.

**B. Thread colors.**
1. Settings → Custom data → Metaobjects → Add definition.
2. Name it "Color de hilo"; set its type (handle) to `mares_thread_color`.
3. Add field "Nombre", key `name`, type "Single line text", required.
4. Add field "Color", key `color`, type "Color", required.
5. Add field "Disponible", key `available`, type "True or false", required.
6. Turn on **Storefronts** access for this definition, then save.
7. Content → Metaobjects → Color de hilo → add one entry per thread color, in the order the customer should see them. Use the exact name the workshop uses. Pick the color with the color picker (match the real thread under daylight). Leave "Disponible" on.

**C. Product fields.** Settings → Custom data → Products → Add definition, once each (namespace and key must match exactly):

| Name | Namespace and key | Type |
| --- | --- | --- |
| Personalizable | `mares.personalizable` | True or false |
| Línea (already used by the theme; create only if missing) | `mares.line` | Single line text, choices `descanso`, `dia` |
| Motivo del producto | `mares.motif` | Single line text, choices: the seven slugs in section 2.3 |
| Colores de hilo permitidos (optional) | `mares.thread_colors` | Metaobject, list, type Color de hilo |
| Largo máximo del nombre | `mares.name_max_length` | Integer |
| Foto para la vista previa | `mares.embroidery_image` | File, images only |
| Bordado: izquierda (%) | `mares.embroidery_x` | Decimal |
| Bordado: arriba (%) | `mares.embroidery_y` | Decimal |
| Bordado: ancho (%) | `mares.embroidery_width` | Decimal |
| Bordado: alto (%) | `mares.embroidery_height` | Decimal |

**D. Each personalizable product.** Products → open the product → Metafields section at the bottom:
1. Personalizable: on.
2. Línea and Motivo del producto: set.
3. Largo máximo del nombre: the number agreed in C-4.
4. Foto para la vista previa: choose the flat, front-on photo of this garment (C-11).
5. The four Bordado percentages: measure on that photo where the embroidery goes. Left and top are where the zone starts, as a percent of the photo's width and height; ancho and alto are its size. Example of reading, not a value: a zone starting a third of the way across has izquierda about 33.
6. Colores de hilo permitidos: leave empty unless this product must offer fewer colors.
7. Save, open the product in the store, and check the preview sits on the right spot. Adjust the numbers until it does.

**E. Policy page.** Online Store → Pages → Cambios: make sure the text includes the no-exchange rule for personalized garments `[C]`, since the configurator repeats it.

**F. Every personalized order, before embroidery.** Orders → open the order → read Motivo, Nombre o inicial, Color de hilo on each line. Check spelling, length, that the motif belongs to the product's line and the thread exists. If anything is off, contact the customer before starting (section 5.4).

---

## 12. Open questions

Each says what cannot be built until it is answered.

1. **C-1. Is personalization optional on a personalizable product?** Can someone buy the pijama without a name? Blocks G2 and G3 (`required` attributes, disabled-when-empty behavior, section 3.4).
2. **C-2. What does choosing a motif mean on a product that already has its own motif?** A: fixed motif, the customer adds only name and thread color. B: the customer picks any motif of the line, the product's own is the default. C: a second motif is added. Blocks the motif group, the `mares.motif` use, the preview layout, the `Motivo` property and the admin checklist (sections 2.3, 3.2, 4.1, 11).
3. **C-3. Which of the six products are personalizable?** Blocks the admin setup (11 D) and testing.
4. **C-4. Maximum length of the name, per product, and the default when a product has none.** Blocks the field limit, hint and validation (2.6, 5.1).
5. **C-5. Which characters besides letters are allowed: spaces (compound names like "María José"), hyphen, apostrophe, period after an initial?** Blocks the `pattern` and the JS check (5.1).
6. **C-6. Is the name embroidered exactly as typed, or always in capitals, or first letter capitalized?** Blocks the normalization step and the preview text (5.2).
7. **C-7. The thread palette: the name and the real color of every thread.** Blocks the metaobject entries, the thread chips and all testing (2.4, 11 B).
8. **C-8. Are thread colors limited per product or per line, or is every thread offered everywhere?** Blocks whether `mares.thread_colors` is used (2.4).
9. **C-9. Which typeface represents embroidered lettering in the preview?** (Same as part of Q-6.) Fraunces 600 is the stand-in. Blocks final preview text in G4; G4 can ship with the stand-in.
10. **C-10. Where the embroidery goes on each garment, and how the motif and the name sit together** (name under the motif, beside it, above it; their relative size). Also whether products without a usable photo show the plain-box preview or none. Blocks the per-product zone values and the layout rule in G4 (2.5, 4.1, 4.3).
11. **C-11. Real garment photos, flat and front-on with consistent framing, one per personalizable product.** Today's images are generated placeholders `[C]`; a preview positioned on them would have to be redone. Blocks meaningful zone measurements and G4 sign-off.
12. **C-12. The configurator's words:** block heading and intro, hint, every error message, the "approximate preview" note, the summary sentence and the announcement shapes. Labels "Motivo", "Nombre o inicial", "Color de hilo" come from the guide `[G]`. Blocks G1, and through it G2 to G4.
13. **C-13. Do personalized orders take longer to ship, and should the product page say so?** Blocks only the delivery text near the configurator; nothing else waits on it.
14. **C-14. Who checks personalized orders before embroidery, and how fast?** Not a code blocker; the brand must own the step in 11 F before launch, because the theme cannot validate (5.4).
15. **C-15. Must the customer actively accept the no-exchange rule (a checkbox) before adding to cart, or is the visible notice enough?** A legal and brand decision for Colombia. Blocks the notice markup in G2 and whether a fourth required input exists.
16. **C-16. Do the hidden keys `_motivo` and `_hilo` help the workshop, or should only the three visible keys be sent?** Blocks the final key list in G2 (3.2); default is to send them.
17. **C-17. Is "Nombre o inicial" one field, or does the customer first choose between a name and an initial?** One field is proposed. Blocks the field markup in G2 if the answer is two modes.
