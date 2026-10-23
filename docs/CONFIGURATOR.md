# Mares: embroidery configurator (phase 1)

**Status: paused.** This work is design only: no configurator code exists. When it resumes, the first step is **G1** (section 10): write the configurator strings into `locales/es.default.json` and `locales/es.default.schema.json`. It needs no data and no other code, and the owner reviews the voice of the copy in its diff while doing the admin checklist (section 11, B to D) in parallel.

This document expands the configurator part of `docs/BUILD.md`. Where the two disagree, this document wins for the configurator, except for the "Resolved decisions" list in `docs/BUILD.md` section 0 and the owner's decisions in section 13, which win over this document.

The owner's decisions C-1 to C-17 are folded into the sections below. What is still open is section 12, and it holds debts only: nothing in it blocks a build commit.

Read with: `docs/BUILD.md` (sections 5, 6.6, 8), `docs/DESIGN.md`, `docs/BRAND.md`. The owner's decisions and the thread palette are sections 13 and 14 of this file.

## 0. Conventions

**Source tags.** Same convention as `docs/BUILD.md` section 0, plus tags for the content:

| Tag | Meaning |
| --- | --- |
| `[T]` | `docs/design/tokens.json` |
| `[G]` | The former web guide, now part of `docs/DESIGN.md` |
| `[R]` | The former design README, now part of `docs/DESIGN.md` (the voice rules: `docs/BRAND.md`) |
| `[C]` | `docs/BRAND.md` (content source; `docs/DESIGN.md` wins over it) |
| `[D]` | Section 13 of this file, the owner's decisions. Wins over the rest of this document. |
| `[H]` | Section 14 of this file, the thread palette |
| `[TP]` | Already decided or built in `docs/BUILD.md` or the theme code (section number or file given) |
| `[P]` | **Proposal.** The documents are silent. A default the developer builds; the owner can change it later without it blocking anything. Never treated as design truth. |
| `[V]` | Shopify platform behavior to verify against current Shopify docs before the commit that depends on it. |
| `C-n` | A decision from `[D]`, closed. The number is kept so older references still resolve; the table below says where each one landed. |

**Where each decision landed.**

| Decision | Subject | Applied in |
| --- | --- | --- |
| C-1 | Personalization is optional | 1.1, 3.4, 6 |
| C-2 | The motif can be changed; the product's own is preselected | 1.1, 2.3, 3.2 |
| C-3 | All six products are personalizable | 2.2, 11 D |
| C-4 | Name length limit per garment type (provisional) | 2.6, 5.1, 12 |
| C-5 | Allowed characters | 5.1 |
| C-6 | Name embroidered as typed, first letter capital | 5.1, 5.2 |
| C-7 | The 23 thread colors of `[H]` | 2.4, 11 B |
| C-8 | All 23 colors offered on every garment | 2.4 |
| C-9 | Fraunces 600 for the preview lettering (provisional) | 4.1, 12 |
| C-10 | Named positions, no free drag; name under the motif, smaller | 2.5, 4.1 |
| C-11 | Today's photographs are generated | 2.5, 12 |
| C-12 | Copy written in the voice of `docs/BRAND.md` | 10 (G1 inventory) |
| C-13 | Personalized orders take at least 3 more days | 1.1, 6 |
| C-14 | Every personalized order is reviewed before embroidery | 5.4, 11 F |
| C-15 | Visible notice plus required checkbox (legal point unverified) | 1.1, 3.2, 5.2, 12 |
| C-16 | Hidden keys are sent | 3.2 |
| C-17 | One field for name or initial | 5.1 |

**Fixed limits from the brief and the plan.**

- Phase 1 has no AI. The customer picks a motif, types a name or initial, and, if they typed one, picks a thread color and a position, and sees a preview on the garment. AI generation is phase 2, with a per-customer attempt limit `[G]`.
- Personalization costs nothing extra in phase 1, so there is no pricing logic anywhere: no surcharge variant, no fee line, no price shown in the configurator, no cost per color (decided, Q-7, `[TP]` section 0; `[H]`).
- The theme cannot validate anything on the server (section 5.4).
- Thread colors are merchant data, not design tokens. They are the one documented exception to the no-color-literal rule (`docs/BUILD.md` section 2.7 and 8.5 item 13). The exception covers merchant data rendered at runtime only; no hex value is ever written in a theme file, so `scripts/check-no-hex.sh` keeps passing unchanged.
- Nothing in this document invents a thread color, motif artwork, garment measurement or embroidery position. The 23 thread colors are those of `[H]`, the positions are the four names in `[D]` C-10, the name limits are the three in `[D]` C-4. What is provisional is said to be provisional, and section 12 lists it.

**What already exists and is reused** `[TP]`:

| Piece | File | Used for |
| --- | --- | --- |
| Chip, radio pattern (`.chip__input` + `label.chip`), 44px target, selected = `brand` fill, unavailable = dashed + strike + text | `assets/component-chip.css` | Motif, thread color and position options |
| Field (visible label, 48px, `aria-invalid` error state with `.field__message` in the `error` color) | `assets/component-field.css` | Name or initial input; error messages of the groups |
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

On a personalizable product (section 2.2; all six products are, C-3) the product page shows, in the information column, the existing blocks plus one new block, `embroidery-configurator`, placed after `quantity` and before `buy-buttons` `[P]` (so the choices sit above the button that sends them).

Personalization is optional (C-1). Someone can buy the garment without a name and it arrives with its catalog embroidery.

The block shows, top to bottom `[P]` (layout):

1. A heading and one sentence saying what can be chosen. Copy: G1 (section 10), in the voice of `docs/BRAND.md` (C-12).
2. **Motivo** `[G]`: a labelled group of chips, one per motif of the product's own line (3 for Descanso, 4 for Día, section 2.3), each chip showing the motif drawing (`embroidery-motif`, 32px `[P]`) and its name as text. **The product's own motif is preselected** (C-2). The product name describes the default motif, not an obligation: the customer can change it to any other motif of the same line.
3. **Nombre o inicial** `[G]`: one text field (C-17) with a visible label, empty and optional. Under it, a hint that states the maximum for this garment and the allowed characters, and a character counter (section 2.6, 5.1).
4. **Color de hilo** `[G]`: **hidden until a name is typed** (C-1). A labelled group of 23 chips (C-7, C-8), each a small swatch plus the color's name as text, in the order of `[H]`. None selected `[P]` (section 2.4 explains why). Near the group, one line saying that the color on screen is a sample and the real thread can look different `[H]`.
5. **Ubicación**: **hidden until a name is typed** (C-1). A labelled group of chips, one per position the product allows (C-10, section 2.5): "Centro del pecho" and "Pecho izquierdo" on the pijama, the enterizo and the body; "Borde" on the gorro; "Esquina" on both mantas. A product with a single position shows that one chip already selected (script) so the customer is not asked a question with one answer.
6. **The delivery notice**, always visible, with the words of the owner: "Las prendas personalizadas se bordan y tardan al menos 3 días más en salir." (C-13, `[D]`). It is said here, before adding to the cart, and not in the checkout.
7. **The no-exchange notice**, always visible, copied from the returns policy `[C]`: personalized garments with a name or initial have no exchange because they are embroidered only for the customer. Under it, **a required checkbox** with the sense "Entiendo que las prendas personalizadas no tienen cambio" (C-15), **hidden until a name is typed**. Its label wording is finalized in G1.
8. The preview panel is **not shown yet** `[P]`. It appears after the customer's first interaction with the block (section 8.3). Before that, the gallery above already shows the garment.

Nothing is announced on page load.

### 1.2 Phone (0 to 599px)

The information column is full width, below the gallery `[TP]` 6.6.

1. The customer scrolls past the gallery, title, price, size chips and quantity, and reaches the configurator.
2. If they want a different motif, they tap a motif chip. The chip turns selected (`brand` fill, check icon, `[TP]` chip). The preview panel appears at the top of the block, showing the garment photograph with the motif drawn at the product's first position (section 4). One announcement (section 6).
3. They tap the name field. The phone keyboard opens. The preview sits above the field `[P]`, so on most phones it is still visible above the keyboard while typing; this needs checking at 375px with a real keyboard (G6 pass). The preview text updates as they type; nothing is announced per keystroke. **When the first character appears**, the thread color group, the position group and the checkbox appear below the field, and that is announced once (section 6). If the name becomes empty again they disappear.
4. They leave the field (tap elsewhere or close the keyboard). The value is cleaned (first letter capital, spaces tidied) and checked (section 5). If it is invalid, the message appears under the field and is announced once.
5. They tap a thread color. The motif and name in the preview take that color. One announcement.
6. If the product has two positions, they tap one; the preview moves the embroidery to it. One announcement.
7. They choose a size (existing picker) at any point; the configurator keeps its state.
8. They read the 3-day line and the no-exchange notice and tick the checkbox.
9. They tap "Agregar al carrito". If anything the personalization needs is missing or invalid, nothing is sent: focus goes to the first problem, its message shows and is announced (section 6). Otherwise the existing add-to-cart flow runs and announces "Agregado al carrito" `[TP]`.

A customer who never types a name skips steps 3 to 6 and 8: they tap "Agregar al carrito" and the garment goes with its catalog embroidery. They are not asked for a color, a position or the checkbox, and nothing about those reaches the order (section 3.4).

### 1.3 Desktop (1024px and up)

Same steps. The gallery is on the left (7 of 12 columns) and the information column on the right (5 of 12) `[TP]` 6.6. The preview panel sits inside the configurator block in the right column, at most the column width, 4:5 `[G]`. With 23 thread chips the block is taller than a 900px window, so the preview is `position: sticky` below the header on viewports of 1024px and up `[P]`, which keeps the photo, the controls and the result visible together; confirm it in G4 at 1280×800. Tablet (600 to 1023px) behaves like the phone layout with more width.

### 1.4 Without JavaScript

The motif radios (the product's own preselected), the name field, the thread color radios, the position radios, the checkbox and the static `_config_version` field still join the add to cart form and are posted with it (section 3). Nothing is hidden: the thread, position and checkbox groups are all visible, because only the script can hide them when the name is empty. The browser's own validation runs from the HTML attributes (`maxlength`, `pattern`) with the browser's message text, not ours. Nothing is `required` without JS, because a required thread color would block a plain purchase. So a customer without JS can type a name and skip the color, the position or the checkbox, and reach the cart incomplete; the manual review catches it (section 5.4). The hidden slug and handle keys (`_motivo`, `_hilo`, `_ubicacion`) are filled by the script, so without JS they are absent and the workshop reads the visible names. There is no preview: the panel is rendered `hidden` and only the script reveals it. Everything else works.

---

## 2. Data model

### 2.1 Overview

| Data | Lives in | Type | Filled by |
| --- | --- | --- | --- |
| Product is personalizable | Product metafield `mares.personalizable` | `boolean` | Owner, per product |
| Product line | Product metafield `mares.line` (exists, used by the theme) `[TP]` | `single_line_text_field`, values `descanso` or `dia` | Owner, per product |
| The product's own motif (preselected) | Product metafield `mares.motif` | `single_line_text_field`, one of the seven slugs | Owner, per product |
| Thread colors (23) | Metaobject definition `mares_thread_color` | entries | Owner |
| Positions, with their zone on the photo | Metaobject definition `mares_embroidery_position` | entries, one per product and position | Owner |
| Positions this product allows | Product metafield `mares.positions` | `list.metaobject_reference` to `mares_embroidery_position` | Owner, per product |
| Photograph the preview uses | Product metafield `mares.embroidery_image` | `file_reference` (image) | Owner, per product |
| Name length limit | Product metafield `mares.name_max_length` | `number_integer` | Owner, per product (from `[D]` C-4) |
| Configurator copy (labels, hints, errors, announcements, notices, preview note) | `locales/es.default.json` | strings | Developer in G1, owner reviews the diff (C-12) |
| Block placement | `templates/product.json` block `embroidery-configurator` | theme block, no settings `[P]` | Developer once; owner can move it in the theme editor |
| Motif artwork and slugs | `snippets/embroidery-motif.liquid` `[TP]` | SVG paths | Developer, from the designer's files (Q-6) |
| Motif display names | `locales/es.default.json` | strings | Developer, from `[R]` |
| Property keys and format version | Theme code (section 3) | constants | Developer |

**The merchant maintains, in the Shopify admin with no code:** the personalizable flag, the line, the product's own motif, the 23 thread colors, the position entries and which of them each product allows, the photograph, the name length limit.
**The theme hard-codes:** the seven motif slugs and their artwork, their display names (locale), which line owns which motif `[R]`, the property keys, the validation character set, the format version, the motif-to-name proportion inside a zone (section 4.1), all UI copy (locale).

Why metafields and metaobjects and not section settings: settings are per template, while every value above is per product (one product template serves all six products) or shop-wide data the owner edits without opening the theme editor. The block has no settings `[P]`.

### 2.2 `mares.personalizable` (product, boolean)

- `true`: the block renders and `configurator.js` loads.
- `false` or empty: the block renders nothing, no script loads, and the page is exactly today's page.
- All six products are personalizable (C-3): the owner sets `true` on each.
- A product marked `true` also needs `mares.line`, `mares.motif`, `mares.name_max_length`, at least one entry in `mares.positions`, and at least one available thread color. If any is missing the block renders nothing, as if the flag were false `[P]`. Offering a name without a limit or a place would produce orders the workshop cannot read, and inventing a fallback would invent a value. Step D 7 of the checklist (open the product in the store and look) catches it.

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

**The motif can be changed (C-2).** The product's own motif comes preselected; the customer may change it to any other motif of the same line. The product's own motif is data, `mares.motif`:

| Product | Line `[C]` | `mares.motif` (preselected) |
| --- | --- | --- |
| Pijama ola suave | Descanso | `ola-suave` |
| Manta luna sobre el mar | Descanso | `luna-sobre-el-mar` |
| Gorro conchitas | Descanso | `conchitas-nacaradas` |
| Body estrella de mar | Día | `estrella-de-mar` |
| Enterizo caballito de mar | Día | `caballito-de-mar` |
| Manta palmita | Día | `palmita` |

The pairing follows the word in each product's name; the owner confirms it when filling the field (11 D). The customer adds no second motif and picks no second location (section 9).

### 2.4 Thread colors (metaobject `mares_thread_color`)

| Field key | Type | Required | Meaning |
| --- | --- | --- | --- |
| `name` | `single_line_text_field` | yes | The name the customer reads and the order shows, as written in `[H]`. Sentence case `[R]`. Also the entry's display name. |
| `color` | `color` | yes | The swatch and the preview tint. The only color literal that reaches the page, and it comes from data `[TP]` 2.7. The values in `[H]` are screen samples, not thread references. |
| `available` | `boolean` | yes, default true `[P]` | False hides the color without deleting it, so past orders still read sensibly (`[H]` production note 4: the name travels in the order). |
| `reference` | `single_line_text_field` | no `[P]` | The real thread reference, for the workshop. Never shown to the customer. Empty today; see debt 1 (section 12). |

- **The palette is `[H]`: 23 colors (C-7)**, entered in the order of its tables (the six Tonos Mares, the five Neutros, the twelve of the Círculo cromático). That order is the order of the chips `[H]`. The names are used as written there; no thread brand reference exists yet.
- **All 23 are offered on every garment (C-8).** There is no per-product restriction in the build. If a color later does not work on a fabric, the owner turns `available` off, or a per-product restriction is added then; it needs no change to existing orders.
- The order of the entries in the admin is the order of the chips `[P]` `[V]` (confirm that `shop.metaobjects.mares_thread_color.values` keeps admin order).
- The definition needs **storefront access** turned on, or Liquid cannot read it `[V]`.
- **No default color** `[P]`: a preselected color would post a thread color on every plain purchase when there is no JS (section 3.4), and the customer is only asked when they typed a name.
- Liquid reads them; the theme renders each as a radio chip with `style="--swatch: {{ entry.color }}"` on the swatch element only. Light thread colors on `bg-raised` may fall under 3:1, so the swatch always carries a 1px `--control-border` ring `[P]` (R-4 color), and the name is always visible text (section 7.3). White and crudo thread on a pearl or pale garment nearly vanishes `[H]` production note 1; the preview shows it honestly, and that is the first reason an owner would restrict colors later.
- The line near the group saying the screen color is a sample and the real thread can differ is required `[H]` production note 2. Short, plain, same size as body text, not fine print.
- Closed list, no free color picker `[H]`. No cost per color.

### 2.5 Positions and the photograph (per product)

The customer picks one of the places a garment allows (C-10). The preview needs to know where on one specific photograph each place falls.

**Position entries: metaobject `mares_embroidery_position`.** One entry per product and position (nine entries in total, table below). Values are percentages of the product's embroidery photograph, so they hold at every image size.

| Field key | Type | Required | Meaning |
| --- | --- | --- | --- |
| `admin_label` | `single_line_text_field` | yes | For the owner only, never shown to customers; also the entry's display name. Product and position, e.g. "Pijama ola suave · Centro del pecho", so the entries can be told apart when picking them on a product. |
| `name` | `single_line_text_field` | yes | What the customer reads on the chip and the order shows: "Centro del pecho", "Pecho izquierdo", "Borde" or "Esquina" (`[D]` C-10, sentence case `[R]`). |
| `x` | `number_decimal` | yes | Left edge of the zone, percent of the photo width (0 to 100). |
| `y` | `number_decimal` | yes | Top edge, percent of the photo height. |
| `width` | `number_decimal` | yes | Width of the zone, percent of the photo width. |
| `height` | `number_decimal` | yes | Height of the zone, percent of the photo height. |

Set minimum 0 and maximum 100 on the four numbers so a typo is caught in the admin `[V]`.

**Which positions a product allows.** Product metafield `mares.positions`, a list of references to those entries, in the order the chips should appear. The **first** entry is where the catalog embroidery already sits `[P]`: the preview draws there until the customer picks another, and a product with one entry has nothing to choose. The positions `[D]`:

| Product | Entries (`name`) |
| --- | --- |
| Pijama ola suave | Centro del pecho, Pecho izquierdo |
| Enterizo caballito de mar | Centro del pecho, Pecho izquierdo |
| Body estrella de mar | Centro del pecho, Pecho izquierdo |
| Gorro conchitas | Borde |
| Manta luna sobre el mar | Esquina |
| Manta palmita | Esquina |

Entries are not shared between products, even when the name is the same, because the rectangle belongs to that product's photograph.

**The photograph.** Product metafield `mares.embroidery_image`: the photograph the preview uses. It must be one of the product's own photos `[P]`, with the garment flat and front-on. Today's photographs are generated (C-11): the rectangles are measured on them and must be measured again when the real photographs arrive (debt 3, section 12).

**How the data is used.**
- The zone is a rectangle with no rotation `[P]` (rotation is out of scope, section 9).
- Inside the zone the theme lays out the motif and the name with one fixed rule (C-10): the name goes **below the motif, smaller**, both centered. The split of the zone's height between the two is one constant in `configurator.js`, marked `[P]` in a comment, and tuned by eye in G4. No other layout is offered; free dragging is a phase 2 question, for when we know what customers ask for.
- "Pecho izquierdo" follows the usual convention, the wearer's left, which is the **right** side of a front-on photograph. The owner confirms it by looking at the preview (11 D 7).
- Values per entry are the owner's or the workshop's, measured on the chosen photo. Garment measurements in centimeters are not needed for phase 1: the preview is approximate and says so (section 4.4).
- If `mares.embroidery_image` is empty, or any of the four numbers of the selected position is empty, that position falls back to section 4.3 (no photograph).
- The position's `name` goes to the order as `Ubicación`, and the entry's handle as `_ubicacion` (section 3.2). The script reads each rectangle from `data-` attributes on the position radios; there is no JSON blob.

### 2.6 Name length (`mares.name_max_length`, product, integer)

The limit depends on the kind of garment (C-4), set on each product by the owner:

| Garment | Maximum | Products |
| --- | --- | --- |
| Manta | 16 characters | Manta luna sobre el mar, Manta palmita |
| Pijama, enterizo, body | 12 characters | Pijama ola suave, Enterizo caballito de mar, Body estrella de mar |
| Gorro | 8 characters | Gorro conchitas |

**Provisional.** The numbers depend on the garment's size and on what actually fits embroidered. They are adjusted when the workshop embroiders the first one (debt 2, section 12); because they live in a metafield, adjusting them is an admin edit with no code.

There is no theme-wide fallback: a personalizable product without the number does not render the block (section 2.2).

The number reaches the customer in four places, all from this one value: the `maxlength` attribute, the hint under the field, the visible counter, and the validation message (section 5.2). The customer therefore always sees the limit of the garment in front of them, before typing and while typing.

---

## 3. How the choices reach the order

### 3.1 Transport

The configurator inputs live in the `embroidery-configurator` block, outside the add to cart `<form>`, and join it with `form="product-form-{{ product.id }}"`, exactly as the quantity input does today `[TP]`. Their `name` attributes are `properties[<key>]`. So:

- Without JS, the native form post to `/cart/add` carries them.
- With JS, `product-form.js` posts `new FormData(form)` to `/cart/add.js`, which already includes them. **No change to `product-form.js`.**
- Same variant with different properties becomes a separate cart line `[TP]` 7 `[V]`.
- Line item properties are text. Keep each value short; Shopify's limits on property length and count are `[V]`. With seven visible and hidden keys per line, count the total against that limit in G5.

### 3.2 Keys and values

| Key | Visible to customer | Value shape | Example shape (not real data) |
| --- | --- | --- | --- |
| `Motivo` `[TP]` 7 | yes | The motif's display name from section 2.3, exactly as in the table | `Ola suave` |
| `Nombre o inicial` `[TP]` 7 | yes | The cleaned text (section 5.2): trimmed, inner spaces collapsed, Unicode NFC, first letter capital | `<the typed name>` |
| `Color de hilo` `[TP]` 7 | yes | The thread entry's `name` field, never the color value `[TP]` 7 | `<thread name>` |
| `Ubicación` `[D]` | yes | The position entry's `name` field (section 2.5) | `Centro del pecho` |
| `Aviso de no cambio` `[P]` | yes | `Aceptado`, only when the checkbox was ticked. This is what leaves a record that the customer read the rule (C-15). | `Aceptado` |
| `_config_version` `[TP]` 7 | no | `1`. This is the first format that exists; it already includes the position. | `1` |
| `_motivo` `[P]` | no | The motif slug from section 2.3 | `ola-suave` |
| `_hilo` `[P]` | no | The thread metaobject entry's handle | `<entry handle>` |
| `_ubicacion` `[P]` | no | The position metaobject entry's handle | `<entry handle>` |

The hidden keys are sent (C-16): the customer does not see them and they help the workshop. Why they exist `[P]`: visible values are words for people and may be renamed later; the slug and the handles let the workshop map an old order to the right artwork, thread and rectangle even after a rename. The thread handle also lets the workshop open the thread entry and read its `reference` (debt 1). The theme never reads any of them back. The key names `_motivo`, `_hilo`, `_ubicacion` and `Aviso de no cambio` are proposals; the visible names `Motivo`, `Nombre o inicial`, `Color de hilo` and `Ubicación` are decided.

The three hidden slug/handle inputs are written by the script as choices are made. They exist in the markup disabled and empty, so a missing script sends nothing wrong.

Key order in the form: Motivo, Nombre o inicial, Color de hilo, Ubicación, Aviso de no cambio, then the hidden keys; the cart shows them in submitted order `[V]`.

### 3.3 Where they appear

| Place | What shows | Source |
| --- | --- | --- |
| Cart page | The visible keys as `dt`/`dd` text under the line; underscore keys hidden; values escaped; blank values skipped | `snippets/cart-line-item.liquid` `[TP]`, unchanged |
| Header count, cart Ajax updates | Lines with different properties count and update separately; quantity changes keep the properties (update by line key) | `assets/cart-items.js` `[TP]`, unchanged |
| Checkout (non-Plus, no checkout code `[TP]` R-2) | Visible keys listed under the item; underscore keys hidden | Shopify `[V]` |
| Order confirmation email | Visible keys; underscore keys hidden in the default template | Shopify `[V]` |
| Admin order page | All properties on the line item; whether underscore keys are shown to staff is `[V]`. The workshop reads `Motivo`, `Nombre o inicial`, `Color de hilo`, `Ubicación` and `Aviso de no cambio` from here | Shopify `[V]` |

Editing a configured line in the cart is out of scope: the customer removes it and adds it again `[TP]` 7.

### 3.4 When no name is typed (C-1)

"Personalized" means the name field has a value. With no name, the customer is not asked for a thread color, a position or the checkbox, and nothing about them reaches the order. The garment goes with its catalog embroidery.

With JS, the behavior is a function of one thing, whether the cleaned name is empty:

| Control | Name empty | Name filled |
| --- | --- | --- |
| Color de hilo group | `hidden` and its inputs `disabled` | shown, enabled, `required` |
| Ubicación group | `hidden` and its inputs `disabled` | shown, enabled, `required` (a single position is selected by the script) |
| Acceptance checkbox | `hidden` and `disabled` | shown, enabled, `required` |
| `_hilo`, `_ubicacion`, `Aviso de no cambio` | `disabled`, so not posted | enabled once their control has a value |
| `Nombre o inicial` | posted blank, which the cart skips; whether Shopify drops it from the order is `[V]` | posted |
| `Motivo`, `_motivo` | posted only if the motif differs from the product's own `[P]` | always posted |
| `_config_version` | posted only if some other property is posted | posted |

Disabled controls are not submitted by the browser and are not validated, so a plain purchase posts no thread color, no position, no acceptance and no required-field error. A plain purchase of the product's own motif posts no properties at all.

The motif row is the one case the decisions do not spell out `[P]`: a customer can swap the motif without typing a name. The plan lets that through carrying only `Motivo` and `_motivo`; the swap alone does not ask for thread, position or the checkbox, since `[D]` C-1 ties those to the name.

Without JS, nothing is hidden or disabled (section 1.4): unchecked radios and the unticked checkbox post nothing, the preselected motif posts `Motivo`, and `_config_version` posts, so a plain purchase carries `Motivo` and `_config_version`. A customer without JS who types a name but skips the color, the position or the checkbox reaches the cart incomplete; the theme cannot stop that (section 5.4).

---

## 4. The preview

### 4.1 How it is drawn

- A `<div>` with the garment photograph (`mares.embroidery_image`, rendered through `snippets/image.liquid` with `aspect_ratio: '4 / 5'`, `srcset`, `width`/`height` `[TP]`) and an absolutely positioned SVG layer on top, same box.
- The SVG uses `viewBox="0 0 100 125"` (4:5) `[P]`, so section 2.5 percentages map straight to user units (`x`, `width` × 1; `y`, `height` × 1.25) whatever the displayed size.
- **Zone:** the rectangle of the selected position (section 2.5). Before the customer has chosen one, the first position of `mares.positions` (where the catalog embroidery sits). Choosing another position moves the drawing to its rectangle.
- **Motif:** the chosen motif's drawing, taken from the chip already on the page (the script clones the chip's `svg.embroidery-motif` node; no second copy of the artwork is shipped). Placed in the motif box, the upper part of the zone (C-10), `stroke` set to the thread color, 2px non-scaling stroke as in the snippet `[TP]`. The motif keeps its box whether or not there is a name, so the preview does not jump while the customer types `[P]`.
- **Name:** an SVG `<text>` in the name box, the lower and smaller part of the zone (C-10), `fill` set to the thread color, centered, scaled down to fit the zone width (`textLength` with `lengthAdjust="spacingAndGlyphs"` only when it overflows) `[P]`. The text drawn is the name as it will be embroidered: with its first letter already capital (section 5.2), so what they see is what is embroidered. Typeface: **Fraunces 600, provisional** (C-9), as the stand-in for embroidery lettering until a photograph of a really embroidered name settles it (debt 3). The font is the page's display font, already loaded for headings, so the preview adds no font file.
- With no name there is no text, and no thread color is asked: the motif is drawn in `--color-ink-muted` `[P]` (the embroidery stroke color for decoration `[R]`). The same applies to a name typed before a thread color is chosen, so the preview never shows a color the customer did not pick.
- The preview image is client-side only and **never saved in the order** `[TP]` 7.
- No animation, no zoom, no drag `[G]` (`prefers-reduced-motion`; out of scope 9).

### 4.2 Per-product data it needs

`mares.embroidery_image`, the entries of `mares.positions` (2.5) and `mares.motif` (2.3). Nothing else. Garment color variants have no design spec (Q-1); the preview uses one photo per product, not per variant `[P]`.

### 4.3 When the product has no photograph (or no zone)

`[P]`: the panel shows a plain 4:5 box (`bg-raised`, 1px `line` border, `--radius-lg`, as the empty product slide does today `[TP]`) with the motif and name centered in a default zone covering the middle of the box, for every position. The preview note (4.4) then says the placement is illustrative. This is also what a failed image load shows.

### 4.4 "Approximate preview" note

A short line under the preview saying it is approximate (thread, size and position may vary) `[TP]` 7. The words are written in G1.

### 4.5 What a screen reader user gets

- The preview layer is `aria-hidden="true"`. It repeats what the controls already state.
- Under the preview, a visible text summary of the current choices, e.g. "Ola suave, con el nombre <name>, en hilo <thread name>, en <position name>" (shape; wording in G1). Parts that do not exist yet are left out: with no name it says only the motif. It is ordinary text, always readable, not a live region.
- Changes are announced through the existing live region (section 6), not by the summary.
- The garment photograph keeps the product media's alt text `[G]`, falling back to the product title `[TP]`.

---

## 5. Validation

### 5.1 Rules for "Nombre o inicial"

| Rule | Value | Tag |
| --- | --- | --- |
| Allowed letters | A to Z, a to z, á é í ó ú ü ñ and their capitals (Á É Í Ó Ú Ü Ñ) | `[D]` C-5 ("letras con tildes y ñ"); full set `[P]` |
| Other characters | Space, hyphen, apostrophe. "María José", "Ana-Lucía" and "D'Angela" must pass. | `[D]` C-5 |
| Not allowed | Digits, emoji, any other symbol (period included), other scripts | `[D]` C-5 |
| Length | 1 to `mares.name_max_length` characters, counted after cleaning. Provisional per garment: manta 16, pijama / enterizo / body 12, gorro 8 | `[D]` C-4 |
| Must contain | At least one letter, so a name of only spaces, hyphens or apostrophes is invalid | `[P]` |
| Case | Embroidered as typed, with the first letter capital automatically. Never forced to all capitals. | `[D]` C-6 |
| Name vs initial | One field accepts both; an initial is just a one-letter name | `[D]` C-17 |
| Required | No. The field is optional (C-1); the rules apply only when it has a value | `[D]` C-1 |

### 5.2 How it is applied

**HTML, always (works without JS):**
- `maxlength` = the garment's limit.
- `pattern` = the allowed set, including the typographic apostrophe (U+2019, which iOS inserts) and the combining acute, tilde and diaeresis marks (U+0301, U+0303, U+0308) so that a decomposed "ñ" typed on some keyboards also passes `[P]` `[V]` (browser `pattern` handling, including where to put the hyphen inside the character class).
- Not `required`.
- `autocomplete="off"`, `autocapitalize="words"` `[P]` (a keyboard hint only; the rule below is what counts), `spellcheck="false"`, `inputmode="text"`.
- The hint and counter are linked with `aria-describedby`.

**JS (`configurator.js`), before the value is used:**
1. Normalize to Unicode NFC (`String.prototype.normalize('NFC')`), so "n + combining tilde" becomes "ñ" and length counts are right.
2. Turn the typographic apostrophe (U+2019) into the plain one, so what is checked and sent is one character.
3. Trim, and collapse runs of spaces to one.
4. Make the first letter of the value a capital (`toLocaleUpperCase('es')`) and leave every other letter as typed (C-6). This is the reading `[P]` of "la primera letra en mayúscula": the first letter of the value, not of each word; the preview shows exactly what will be embroidered.
5. Check against the allowed set, the length and the "at least one letter" rule.
6. Write the cleaned value back into the field on `change` (not on every keystroke, so the caret never jumps). The preview applies steps 1 to 4 live without writing back.

**The counter.** Beside the hint, a visible "n de max" counter updates while typing and is `aria-hidden`; the limit itself is already in the hint. `maxlength` stops typing silently, which would look like a broken field, so when the count reaches the limit the counter text changes and the live region announces it once (section 6). Pasting beyond the limit is cut by the browser and the counter shows the full count.

**When it runs:** on `change` (leaving the field) and on submit. Not on every keystroke: the preview and counter update while typing, the error does not appear until the customer leaves the field `[P]`.

**The other required inputs (only when a name is filled, section 3.4):** a thread color, a position and the checkbox are `required` through the script. If one is missing on submit it gets the same treatment as a bad name (5.3): a text message under its group, linked with `aria-describedby`. The checkbox is checked and its message shown the same way (C-15).

### 5.3 On bad input

- The field gets `aria-invalid="true"`, the 2px `error` border, and a text message under it (`.field__message`, linked with `aria-describedby`) `[G]` `[TP]`. Never color alone. A radio group or the checkbox gets the same message pattern under it.
- The message says what is allowed, not only that something is wrong, and carries the garment's own number, e.g. which characters and "máximo 12" (shape; wording in G1).
- On submit, the script listens for the inputs' native `invalid` event (fired before `submit`), cancels the browser bubble, shows our message, moves focus to the first invalid control and announces once (section 6). `product-form.js` is never reached, because an invalid form does not fire `submit`. No coupling between the two scripts. Disabled controls fire no `invalid` event, which is what makes the empty-name case clean.
- Without JS the browser's own bubble and wording appear instead; acceptable degradation.

### 5.4 What the theme cannot enforce, and the brand must accept

Line item properties are not validated by Shopify `[TP]` R-8. Anyone can post to `/cart/add` with any properties: a 500-character name, a motif from the other line, a position the product does not allow, a thread color that does not exist, a `_config_version` of `9`, a name with no color, no position or no ticked acceptance. A customer without JS who skips a field reaches the cart with an incomplete set. Client-side rules stop honest mistakes only.

Consequences the brand accepts in phase 1:

1. **Every personalized order is checked by a person before embroidery** (C-14). The checklist in section 11 includes this step. It is the real control on what arrives written.
2. A bad order is fixed by contacting the customer, not by the store.
3. Because personalization is free (Q-7), forged properties cannot change a price. The risk is wrong embroidery, not money.
4. Real enforcement needs a Cart and Checkout Validation Function (an app, not theme code), out of scope (section 9).

---

## 6. States and errors

All announcements go through `Mares.announce` (the single polite live region in `layout/theme.liquid`) `[TP]` 5. One state change, one announcement. Wording is written in G1; the shapes below are `[P]`.

| State | What the customer sees | Announced |
| --- | --- | --- |
| Product not personalizable, or its data incomplete | Nothing: the block renders no markup, no script loads | Nothing |
| Script not loaded yet / failed / no JS | All controls visible and working, post with the form; preview panel stays hidden | Nothing |
| Page loaded, nothing touched | The motif group with the product's own motif selected, the empty name field with its hint and counter, the delivery notice and the no-exchange notice; thread, position and checkbox hidden; no preview panel | Nothing |
| Preview image loading (first interaction) | Panel appears with a 4:5 skeleton (`component-skeleton.css`, `aria-hidden`) until the photo loads; the SVG layer is drawn on top as soon as the image box exists | Nothing extra: the choice itself is announced (next rows) |
| Motif chosen | Chip selected; preview updated; summary text updated | Once, e.g. "Motivo: Ola suave" |
| First character typed in the name | Thread color group, position group and checkbox appear (a single position is selected); preview shows the name | Once, that color, position and the acceptance are now asked |
| Name typed further | Preview text and counter update live | Nothing per keystroke. On `change`, if valid, nothing (the field already holds what they typed) `[P]` |
| Name reaches the limit | Counter text changes; typing stops | Once, that the maximum was reached and what it is |
| Name emptied | The three groups hide and their choices are dropped from the order; preview shows the motif only | Once, that without a name the garment goes with its catalog embroidery |
| Name invalid | Field error state and message | Once, the message text, on `change` |
| Thread color or position chosen | Chip selected; preview updated; summary text updated | Once per choice, e.g. "Hilo: <name>" / "Ubicación: <name>" |
| Submit with a missing or invalid choice | First problem gets focus, its message shows; other problems show their messages too | Once: the first problem's message, plus how many problems there are when there are several `[P]` |
| Preview image fails to load | Panel falls back to the no-photograph box (4.3) | Nothing (the choices are unaffected) |
| Add to cart succeeds or fails | Existing `product-form.js` behavior: "Agregado al carrito", stock error text, network error text `[TP]` | Once, by `product-form.js` only. The configurator announces nothing on submit success |
| Size changed with the variant picker | Configurator keeps every choice; preview unchanged | Only the picker's own announcement `[TP]` |

The configurator listens to no cart events and dispatches none: it only owns its inputs `[TP]` 5 ("nothing else is coupled").

---

## 7. Accessibility

### 7.1 Labelling

- The block is a `<section>` with an `h2` heading (wording G1); the product title stays the page's only `h1` `[TP]` R-7.
- Motif, thread color and position are each a `<fieldset>` with a visible `<legend>` ("Motivo", "Color de hilo" `[G]`, "Ubicación" `[D]`), styled like the size picker's legend (`.variant-picker__legend` look: `label` style, `ink-muted`) `[TP]`.
- Options are native radios (`input.chip__input.visually-hidden` + `label.chip`) `[TP]` chip: arrow keys move within a group, one tab stop per group, checked state exposed by the platform. The thread group has 23 options; they wrap in rows and arrow keys move through them in order.
- The name field has a visible `<label>` and its hint linked with `aria-describedby` `[G]`. The counter is `aria-hidden`; the limit is in the hint, which is read. The error message is added to the same `aria-describedby` when shown.
- The thread, position and checkbox groups are hidden with the `hidden` attribute while the name is empty, so they are out of the tab order and the reading order, not merely invisible. They come after the name field in the DOM, so when they appear the customer simply continues down the page; focus never moves by itself and never lands on something that just disappeared (the name field is never hidden).
- The acceptance is a native checkbox with a visible label; the no-exchange notice is linked to it with `aria-describedby`. Its error message is shown and linked like any other.
- The delivery notice and the no-exchange notice are plain text in the block, before the add to cart button in reading order.

### 7.2 Targets

Every chip is at least 44 × 44px (`component-chip.css`) `[G]`. The name field is 48px tall `[G]`. Motif chips holding a 32px drawing plus text stay within the 44px minimum height `[P]`. The checkbox and its label form one target of at least 44px high.

### 7.3 Thread colors without relying on color

- Every thread chip shows the color's **name as text** next to the swatch (`[H]` production note 3). The name is the label; the swatch is decoration (`aria-hidden`).
- The swatch has a 1px `--control-border` ring so a pale thread stays visible on `bg-raised` `[P]`.
- Selected state is the chip component's own: `brand` fill, `on-brand` text, plus the `check` icon `[TP]`. On the selected (brand-filled) chip the swatch keeps its ring in `on-brand` `[P]` so a dark-blue thread stays distinguishable from the fill.
- An unavailable color is not rendered (2.4 `available`), so there is no color-only disabled state.
- The preview uses the thread color, but the summary text names it, so nothing is conveyed by color alone.
- Positions are never conveyed by place alone: each chip carries its name as text, and the summary says it.

### 7.4 Announcing the preview

The visual preview is `aria-hidden`. Each discrete choice is announced once (section 6); typing is not announced; the groups appearing and disappearing are announced once; the summary text under the preview is always current for anyone who navigates to it.

### 7.5 Other

- Focus ring: global `:focus-visible`, drawn on the chip for radios `[TP]` chip; inside the `[data-line]` product section the ring is `ink` (R-6) `[TP]`.
- `prefers-reduced-motion`: there is no motion to remove; the skeleton pulse already stops `[TP]`. The groups appearing do not animate.
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

The brief's "8 KB" is the product page figure; the whole theme is 10.6 KB. `docs/BUILD.md` section 5 keeps the configurator outside the 15 KB phase 1 budget.

### 8.2 Budget `[P]`

- `configurator.js`: at most **4 KB gzipped**, and under the 10,000-byte uncompressed per-file limit Theme Check enforces (`.theme-check.yml`, `AssetSizeJavaScript`). The show/hide by name and the position handling add logic to the script that the first version of this plan did not count; if 4 KB is not enough, G3 and G4 report the real number and the budget is revisited in G6, not silently exceeded.
- Product page JS with the configurator: at most **12.5 KB gzipped** (8.0 today + 4 + margin), comfortably inside the phase 1 15 KB figure even though the configurator is outside it.
- `component-configurator.css`: under 10 KB uncompressed (the per-component budget, `docs/BUILD.md` section 4); expected far less, since chips and fields reuse existing CSS.
- HTML added by the block: the line's 3 or 4 motif drawings (each a few hundred bytes of SVG, already in the snippet), 23 thread chips, one or two position chips and a checkbox. No JSON blob of data: everything the script needs is in the markup, including each position's rectangle as `data-` attributes.

### 8.3 What loads when

| When | What |
| --- | --- |
| Page load, personalizable product only | Block markup, `component-configurator.css`, `configurator.js` with `defer` (small: listeners, validation, normalization, show/hide) |
| Not loaded on any other page or product | All of the above |
| First interaction in the block (pointer or keyboard) | The preview panel is revealed and its photograph is requested. If `mares.embroidery_image` is the gallery's first image at a size the browser already holds, this costs nothing; otherwise one 4:5 image through `srcset`, `loading="lazy"` before reveal `[TP]` image snippet |
| Never | Fonts (the preview uses the already-loaded display face), libraries, a canvas, a second copy of the motif artwork |

The preview photo must never be the LCP candidate: it is below the fold and hidden until the first interaction. LCP stays the first gallery image `[TP]` 9.3.

---

## 9. Out of scope for phase 1, and why

| Item | Why it is out |
| --- | --- |
| AI generation and per-customer attempt limits | Phase 2 by the brand's own scope `[G]` |
| Any price or surcharge for personalization, or per color | Decided: no extra cost in phase 1 (Q-7, `[H]`) |
| Server-side validation (Cart and Checkout Validation Function) | Needs an app, not theme code `[TP]` R-8; the brand accepts manual review (5.4, C-14) |
| Customer image or file uploads | Not in the phase 1 brief `[G]`; needs storage and moderation |
| Saving the preview image on the order; production file export | The preview is approximate by design; the workshop works from the visible properties `[TP]` 7 |
| Free drag, resize or rotation of the motif or name | Decided (C-10): named positions only. Free placement is a phase 2 question, once we know what customers ask for |
| Several embroidery locations, or a second motif, on one garment | The customer swaps the motif, not adds one (C-2), and picks one position; more needs per-garment physical limits nobody has defined |
| A free color picker | Decided: closed list of 23 `[H]`. Whether phase 2 opens it depends on whether any shade can be sourced and how fast |
| Restricting thread colors per product or fabric | Decided: all 23 everywhere (C-8). Added if a color fails on some fabric; the `available` flag already removes a color everywhere |
| Stitch simulation (texture, thread sheen) | Large cost for an approximate preview; no design spec |
| Editing a configured line in the cart | Remove and re-add is enough at this volume `[TP]` 7; editing needs a cart drawer that does not exist (Q-8) |
| Saved designs, customer accounts integration | No accounts work in phase 1 (Q-10) |
| Translations other than Spanish | Store is Spanish only `[R]` |
| A delivery date computed for personalized orders | The 3 extra days are a sentence next to the configurator (C-13), not logic |
| Per-variant (garment color) preview photos | Garment color selection has no design yet (Q-1) |

---

## 10. Commits to build it

Models: **S-med** = Sonnet 5.5 medium effort, **S-high** = Sonnet 5.5 high effort, **O-high** = Opus high effort. Every commit follows the definition of done in `docs/BUILD.md` section 0 (Theme Check clean, `check-no-hex.sh` clean, 375px and 1280px, keyboard pass, only the named files).

"Needs" lists data in the Shopify admin that must exist to test the commit (steps of section 11). No decision is outstanding: everything below can start.

| # | Commit | Files | Needs | Model |
| --- | --- | --- | --- | --- |
| G0 | docs: configurator design (data model, preview, validation), revised with the owner decisions and the position choice | `docs/CONFIGURATOR_PLAN.md` | none | O-high |
| G1 | feat(locales): configurator strings (inventory below) | `locales/es.default.json`, `locales/es.default.schema.json` | none | S-med |
| G2 | feat(configurator): block markup without script: completeness check, motif chips with the product's own preselected, name field with per-garment limit, hint and counter, 23 thread chips and the screen-sample line, delivery notice and no-exchange notice, `form=`-joined inputs | `blocks/embroidery-configurator.liquid`, `assets/component-configurator.css`, `templates/product.json` | 11 B1, C, and D 1 to 5 for at least one product (thread colors, product fields) | S-high |
| G2b | feat(configurator): position choice and acceptance without script: position chips from `mares.positions` with `data-` rectangles, acceptance checkbox, `Ubicación`, `Aviso de no cambio`, `_ubicacion` keys | `blocks/embroidery-configurator.liquid`, `assets/component-configurator.css` | 11 B2 (position entries) and D 4 (`mares.positions` on the product) | S-high |
| G3 | feat(configurator): normalization and first-letter capital, validation messages, counter and limit announcement, show/hide of thread, position and checkbox by name, required toggling, single-position auto-select, hidden-key filling, announcements | `assets/configurator.js`, block hook attributes | none new | O-high |
| G4 | feat(configurator): preview over the garment photo in the selected position, name under the motif, no-photo fallback, text summary, sticky preview on desktop | `assets/configurator.js`, block markup, CSS | `mares.embroidery_image` and the rectangles (11 D 5 and 6) for at least one product | O-high |
| G5 | chore(configurator): end-to-end check of properties in cart, checkout, email and admin for the five visible keys and the hidden ones, a plain purchase posting nothing extra, property count and length limits; fix only what the `[V]` items turn up | verification notes in this file; code only if a `[V]` fails | a dev store with real metafields | S-high |
| G6 | chore(configurator): accessibility and performance pass at 320, 375, 1024, 1280px, including a screen reader pass over the groups appearing and disappearing; budget numbers recorded here | various, configurator files only | none | S-high |

Notes:
- **G1 is the first commit.** It needs no data and no other code, the three markup and script commits read their text from it, and the owner reviews the voice of the copy in its diff while doing section 11 B to D in the admin.
- G2 is useful on its own: with it, personalized orders already work without any script. G2b adds the position and the acceptance to that same no-script form, so a customer without JS also gets them.
- G3 is the largest script commit: hiding and disabling by name is the heart of C-1. Keep that code in its own functions, separate from the text normalization.
- G3 and G4 both edit `configurator.js`; keep G4's preview code in clearly separate methods so G3 stays reviewable.
- No commit touches `product-form.js`, `cart-line-item.liquid` or `cart-items.js`. If one seems to need it, stop and revisit section 3.

**G1 string inventory** (all in `locales/es.default.json`, in the voice of `docs/BRAND.md`, C-12; the owner reviews the diff):

| Group | Strings |
| --- | --- |
| Block | Heading; one-sentence intro |
| Legends and labels | "Motivo", "Nombre o inicial", "Color de hilo" `[G]`, "Ubicación" `[D]` |
| Motif names | The seven in section 2.3 |
| Name field | Hint with the garment's limit and the allowed characters; counter "n de max"; limit-reached announcement |
| Name errors | Not allowed character; too long (with the limit); no letter |
| Thread | The screen-sample line `[H]`; missing-color error |
| Position | Missing-position error. Position names come from data, not locale |
| Notices | Delivery notice, verbatim: "Las prendas personalizadas se bordan y tardan al menos 3 días más en salir." `[D]` C-13; the no-exchange notice from the policy `[C]`; the checkbox label; missing-acceptance error |
| Preview | The approximate-preview note; the summary sentence with and without name |
| Announcements | Motif, thread, position chosen; groups appearing; groups hidden (no name); "n problems" on submit |

---

## 11. Owner checklist in the Shopify admin

Do these in order. None needs a developer. Each step says where to click in the admin `[V]` (names of menus may differ slightly; ask before guessing).

**A. Before you start.** The decisions are closed (section 13). What is left is the four debts in section 12, and none stops you. Have sections 13 and 14 of this file open next to the admin.

**B1. Thread colors.**
1. Settings → Custom data → Metaobjects → Add definition.
2. Name it "Color de hilo"; set its type (handle) to `mares_thread_color`.
3. Add field "Nombre", key `name`, type "Single line text", required.
4. Add field "Color", key `color`, type "Color", required.
5. Add field "Disponible", key `available`, type "True or false", required.
6. Add field "Referencia de hilo", key `reference`, type "Single line text", **not** required. Leave it empty for now.
7. Turn on **Storefronts** access for this definition, then save.
8. Content → Metaobjects → Color de hilo → add the 23 entries of section 14, **in the order of its tables**: the six Tonos Mares, the five Neutros, the twelve of the Círculo cromático. Use the exact name written there and the sample color from the same row. Leave "Disponible" on and the reference empty.
9. To stop offering a color later, switch its "Disponible" off. Do not delete it: old orders keep its name.

**B2. Positions.**
1. Settings → Custom data → Metaobjects → Add definition.
2. Name it "Ubicación del bordado"; set its type (handle) to `mares_embroidery_position`.
3. Add these fields, all required: "Etiqueta interna" (`admin_label`, Single line text; make it the entry's display name), "Nombre" (`name`, Single line text), "Izquierda %" (`x`), "Arriba %" (`y`), "Ancho %" (`width`), "Alto %" (`height`), the last four of type "Decimal", minimum 0 and maximum 100.
4. Turn on **Storefronts** access, then save.
5. Add the nine entries. The four numbers are measured in step D 6 once a photograph is chosen, so create the entries with their names now and fill the numbers then (if the admin insists on them, enter 0 and replace them). Etiqueta interna is product and position; Nombre is exactly what the customer should read:

| Etiqueta interna | Nombre |
| --- | --- |
| Pijama ola suave · Centro del pecho | Centro del pecho |
| Pijama ola suave · Pecho izquierdo | Pecho izquierdo |
| Enterizo caballito de mar · Centro del pecho | Centro del pecho |
| Enterizo caballito de mar · Pecho izquierdo | Pecho izquierdo |
| Body estrella de mar · Centro del pecho | Centro del pecho |
| Body estrella de mar · Pecho izquierdo | Pecho izquierdo |
| Gorro conchitas · Borde | Borde |
| Manta luna sobre el mar · Esquina | Esquina |
| Manta palmita · Esquina | Esquina |

**C. Product fields.** Settings → Custom data → Products → Add definition, once each (namespace and key must match exactly):

| Name | Namespace and key | Type |
| --- | --- | --- |
| Personalizable | `mares.personalizable` | True or false |
| Línea (already used by the theme; create only if missing) | `mares.line` | Single line text, choices `descanso`, `dia` |
| Motivo del producto | `mares.motif` | Single line text, choices: the seven slugs in section 2.3 |
| Ubicaciones permitidas | `mares.positions` | Metaobject, list, type Ubicación del bordado |
| Largo máximo del nombre | `mares.name_max_length` | Integer |
| Foto para la vista previa | `mares.embroidery_image` | File, images only |

**D. Each of the six products.** Products → open the product → Metafields section at the bottom:
1. Personalizable: on (all six, C-3).
2. Línea and Motivo del producto: set (pairing in section 2.3).
3. Largo máximo del nombre: manta 16, pijama / enterizo / body 12, gorro 8. These are provisional (section 12, debt 2).
4. Ubicaciones permitidas: pick this product's entries from B2, **first the place where the embroidery already sits in the catalog photo**. The chips appear in this order. The label in the picker tells the entries apart.
5. Foto para la vista previa: choose the flat, front-on photo of this garment. Today's photographs are generated; you will repeat steps 5 to 7 when the real ones arrive (debt 3).
6. Place each of this product's positions on that photo: open Content → Metaobjects → Ubicación del bordado → the entry, and measure where the embroidery goes, the motif **and** the name under it as one block. Izquierda and Arriba are where the block starts, as a percent of the photo's width and height; Ancho and Alto are its size. Example of reading, not a value: a block starting a third of the way across has Izquierda about 33.
7. Save, open the product in the store, type a name, and check the preview sits on the right spot for each position. Adjust the numbers until it does. Two things to look at:
   - "Pecho izquierdo" is the baby's left, so on a front-on photo it is on the right-hand side. If you want the other meaning, swap the two entries' numbers.
   - The thread colors on the garment, white and crudo on the pearl and pale garments especially (section 2.4).

**E. Policy page.** Online Store → Pages → Cambios: make sure the text includes the no-exchange rule for personalized garments `[C]`, since the configurator repeats it and asks the customer to tick that they understand it. The legal check of this rule is pending (debt 4); it does not stop you.

**F. Every personalized order, before embroidery** (C-14). Orders → open the order → read Motivo, Nombre o inicial, Color de hilo, Ubicación and Aviso de no cambio on each line. Check: the spelling and length of the name for that garment; the motif belongs to the product's line; the thread exists; the position is one the product allows; the notice shows Aceptado. If a hidden `_hilo` key is shown, it is the thread entry's handle: open that entry to read its reference. If anything is off, contact the customer before starting (section 5.4). A customer who bought without a name needs no check beyond the motif.

---

## 12. What is still open

These are debts, not blockers. Every decision the owner could make is made (section 0 says where each landed). Each item below says what it would change later; the build reads all of it from data or one constant, so none of it stops a commit.

1. **Debt 1. The thread colors have no thread reference.** `[H]` has "PENDIENTE" in every row. While the same person embroiders, the name works: they know which thread is their "Verde agua". The day another person joins the workshop, an order that says "Verde agua" is ambiguous. *What it would change later:* when the thread is bought, the owner fills the optional `reference` field of each of the 23 entries (admin, no code). The order already carries the entry's handle in `_hilo`, so the workshop can open the entry and read the reference; no code is needed for that. If the reference should also travel as text on the order, it is a small addition to the hidden keys in the block markup.

2. **Debt 2. The name limits are provisional.** 16, 12 and 8 characters (`[D]` C-4) are estimates; what fits embroidered depends on the size of the garment. *What it would change later:* after the workshop embroiders the first one of each kind, the owner edits `mares.name_max_length` on the products (admin, no code); the hint, counter, `maxlength` and messages follow. If it turns out the limit depends on the size, not only on the kind of garment, that is a new decision that moves the limit from the product to the variant.

3. **Debt 3. The photographs are generated.** Everything measured on them is approximate: the position rectangles of the nine entries, the proportion between motif and name inside a zone, and the Fraunces 600 stand-in for the lettering (C-9), which is decided from a photograph of a really embroidered name. *What it would change later:* when the real photographs arrive, the owner replaces `mares.embroidery_image` and measures the nine rectangles again (section 11 D 6, no code); the developer retunes the one proportion constant and, if the real lettering is not Fraunces, the preview typeface (a font file would be a cost to re-check in G6). The buyer-facing note already says the preview is approximate.

4. **Debt 4. The legal value of the no-exchange checkbox is not verified.** In Colombia the right of withdrawal has exceptions for goods made to measure, but whether this garment falls under them is for a lawyer to confirm, not this document (`[D]` C-15). *What it would change later:* if confirmed, nothing. If not, the wording of the policy page, the notice and the checkbox label changes (copy in `locales/es.default.json` and the policy page), and what is sold as non-exchangeable may change with it; the checkbox, the `Aviso de no cambio` key and the page layout are built either way.

---

## 13. Owner decisions (C-1 to C-17)

Respuestas cerradas a las preguntas C-1 a C-17. Si algo de esta sección contradice al resto del documento, manda esta sección.

---

**C-1. La personalización es opcional.**
Se puede comprar la prenda sin nombre y llega con su bordado de catálogo. Si el
cliente no escribe nombre, no se le piden color de hilo ni posición.

**C-2. El motivo se puede cambiar.**
El motivo propio de la prenda viene preseleccionado. El cliente puede cambiarlo
por cualquier otro de su misma línea. El nombre del producto describe el motivo
por defecto, no una obligación.

**C-3. Los seis productos son personalizables.**

**C-4. Largo máximo del nombre, por tipo de prenda.**

| Prenda | Máximo |
| --- | --- |
| Manta | 16 caracteres |
| Pijama, enterizo, body | 12 caracteres |
| Gorro | 8 caracteres |

Provisional. Depende del tamaño de la prenda y de lo que quepa bordado de
verdad. Se ajusta cuando el taller borde el primero.

**C-5. Caracteres permitidos.**
Letras con tildes y ñ, espacio, guion y apóstrofo. Entran "María José",
"Ana-Lucía" y "D'Angela". Sin números, sin emoji, sin otros signos.

**C-6. El nombre se borda tal como se escribe**, con la primera letra en
mayúscula automáticamente. No se fuerza todo a mayúsculas.

**C-7. La paleta de hilos es la de la sección 14.**
23 colores. Se trabaja con los nombres, sin referencia de marca de hilo por
ahora (ver deudas al final).

**C-8. Los 23 colores se ofrecen en todas las prendas.**
Si más adelante algún color no funciona en cierta tela, se limita entonces.

**C-9. La tipografía del nombre en la vista previa es Fraunces 600,
provisional.** Se decide con una foto de un nombre bordado real.

**C-10. Posiciones con nombre, no arrastre libre.**
El cliente escoge entre los sitios que cada prenda permite:

| Prenda | Posiciones |
| --- | --- |
| Pijama ola suave | Centro del pecho, pecho izquierdo |
| Enterizo caballito de mar | Centro del pecho, pecho izquierdo |
| Body estrella de mar | Centro del pecho, pecho izquierdo |
| Gorro conchitas | Borde |
| Manta luna sobre el mar | Esquina |
| Manta palmita | Esquina |

El nombre va debajo del motivo, más pequeño. El arrastre libre queda como
pregunta de fase 2, cuando se sepa qué piden los clientes.

**C-11. Las fotos de hoy son generadas.**
Las posiciones de la vista previa hay que volver a medirlas cuando lleguen las
fotos reales de las prendas.

**C-12. Los textos del configurador** se escriben en la voz de `docs/BRAND.md`, con las
demás respuestas ya cerradas.

**C-13. Los pedidos personalizados demoran al menos 3 días más.**
Eso se dice junto al configurador, antes de agregar al carrito, no en el
checkout. Texto propuesto: "Las prendas personalizadas se bordan y
tardan al menos 3 días más en salir."

**C-14. Cada pedido personalizado se revisa manualmente antes de bordar.**
La página no puede validar del lado del servidor, así que la revisión humana es
el control real sobre lo que llega escrito.

**C-15. Aviso visible más casilla obligatoria.**
Antes de agregar al carrito, el cliente marca que entiende que las prendas
personalizadas no tienen cambio. La casilla deja constancia de que lo leyó.
Pendiente de verificación legal: en Colombia el derecho de retracto tiene
excepciones para bienes hechos a la medida, pero eso lo confirma un abogado,
no este documento.

**C-16. Las claves ocultas sí se envían al pedido.**
No las ve el cliente y le sirven al taller.

**C-17. Un solo campo para nombre o inicial.**
Quien quiera una inicial escribe una letra.

---

### Lo que cambia respecto al plan original

1. Entra una cuarta opción: la posición, con sus chips.
2. El pedido lleva una propiedad más: `Ubicación`.
3. Cada producto necesita saber qué posiciones permite y dónde cae cada una
   sobre su foto.
4. El largo máximo del nombre depende del tipo de prenda, no es uno solo.
5. Si no se escribe nombre, se ocultan color de hilo, posición y la casilla.
6. El aviso de los 3 días va en la página de producto, junto al configurador.

### Deudas, no bloqueos

1. **Los colores no tienen referencia de hilo.** Mientras borde la misma
   persona funciona, porque sabe cuál es su "verde agua". El día que entre
   alguien más al taller, un pedido que diga "verde agua" es ambiguo. Conviene
   anotar la referencia real cuando se compre el hilo.
2. **Los largos máximos son estimados.** Se ajustan con la primera prenda
   bordada de verdad.
3. **Las fotos son generadas**, así que las posiciones de la vista previa son
   aproximadas hasta tener las reales.
4. **La casilla de no cambio no está verificada legalmente.**

---

## 14. Thread colors

Lista inicial de colores para el configurador de bordado.

Estado: propuesta. Los hex son para la muestra en pantalla, no para comprar hilo.
La columna de referencia la llenas tú con el hilo real que usas.

### Cómo se usa esta lista

- Cada fila es una opción del selector de color de hilo.
- El nombre es lo que ve el cliente y lo que llega al pedido. No el hex.
- El hex solo pinta la muestra en pantalla y la vista previa sobre la prenda.
- La referencia es lo que usa producción para comprar y bordar.
- El orden de esta tabla es el orden en que aparecen en el selector.

### Tonos Mares

Los seis de la marca. Son los que combinan con las prendas, así que van primero.

| Nombre | Hex muestra | Referencia de hilo |
| --- | --- | --- |
| Verde agua | `#A8CFC2` | PENDIENTE |
| Lavanda | `#C9BFDD` | PENDIENTE |
| Rosa arena | `#EBCFC4` | PENDIENTE |
| Turquesa | `#4FB8C4` | PENDIENTE |
| Coral | `#F2A68F` | PENDIENTE |
| Amarillo sol | `#F6D77A` | PENDIENTE |

### Neutros

Los que más se piden para un nombre. El azul profundo es el de la marca.

| Nombre | Hex muestra | Referencia de hilo |
| --- | --- | --- |
| Blanco | `#FFFFFF` | PENDIENTE |
| Crudo | `#EFE6D8` | PENDIENTE |
| Gris | `#8C8C8C` | PENDIENTE |
| Azul profundo | `#3E6A85` | PENDIENTE |
| Negro | `#1E1E1E` | PENDIENTE |

### Círculo cromático

Primarios, secundarios y terciarios, para quien quiera un color fuerte.

| Nombre | Tipo | Hex muestra | Referencia de hilo |
| --- | --- | --- | --- |
| Rojo | Primario | `#D7262E` | PENDIENTE |
| Rojo naranja | Terciario | `#E24E1B` | PENDIENTE |
| Naranja | Secundario | `#EE7B2E` | PENDIENTE |
| Amarillo naranja | Terciario | `#F4A62A` | PENDIENTE |
| Amarillo | Primario | `#F2CE2B` | PENDIENTE |
| Amarillo verde | Terciario | `#A8C33A` | PENDIENTE |
| Verde | Secundario | `#3E9E52` | PENDIENTE |
| Azul verde | Terciario | `#2E9E95` | PENDIENTE |
| Azul | Primario | `#2D6CB3` | PENDIENTE |
| Azul violeta | Terciario | `#4A4A9E` | PENDIENTE |
| Violeta | Secundario | `#7B4397` | PENDIENTE |
| Rojo violeta | Terciario | `#B83A7E` | PENDIENTE |

Total: 23 colores.

### Notas de producción

1. **Hilo claro sobre tela clara casi no se ve.** Blanco y crudo sobre una prenda
   perla o rosa arena desaparecen en foto y casi en persona. O los sacas de la
   lista para esas prendas, o avisas al cliente antes de que compre.
2. **La muestra en pantalla no es el hilo.** Ningún monitor reproduce el color
   del hilo con fidelidad. La página debe decirlo en una línea cerca del
   selector, con una frase corta y sin letra chica.
3. **El color nunca va solo.** Cada muestra lleva su nombre escrito al lado, no
   solo el cuadrito, porque hay clientes que no distinguen ciertos colores.
4. **Si un color se descontinúa**, se quita de la lista y los pedidos viejos
   conservan el nombre que eligieron, porque el nombre viaja en el pedido.

### Decisiones tomadas

- Lista cerrada, no selector libre de color. Un selector libre deja pedir tonos
  que no existen en hilo y la vista previa prometería algo imposible de bordar.
- Sin costo extra por color, igual que el resto de la personalización en fase 1.

### Pendientes

1. La referencia real de hilo de cada color.
2. Confirmar si los 23 se quedan o se recorta la lista.
3. Si algún color no aplica a ciertas prendas, cuáles.
4. Fase 2: ¿se abre el selector libre de color? Depende de si puedes conseguir
   cualquier tono y en cuánto tiempo.
