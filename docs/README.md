# Mares: documentation

Five documents and one data file. Each has one job, so nobody has to hold two at once.

**DESIGN.md** is the design system: what the store looks like and why. Colors, type, shape, depth, motion, components, accessibility rules. It is the owner's document and it wins over every other file when they disagree about how something looks.

**BRAND.md** is the voice and the words: who speaks, the writing rules, what is machine work and what is hand work, the copy of every section, the six products, the policy pages, the footer strings, the image brief, and one list of everything still marked PENDIENTE. Every string a customer reads comes from here. It is in Spanish, like the copy it holds.

**BUILD.md** is how the Shopify theme is built: the ground rules and resolved decisions, the file tree, how design tokens become CSS and how to regenerate them, the font, CSS and JavaScript approach, the sections that exist and their editable settings, and the open questions and risks. Read it before changing theme code.

**CONFIGURATOR.md** is the embroidery configurator: data model, how the choices reach the order, the preview, validation, accessibility, the commits to build it, the owner's checklist in the Shopify admin, the owner's decisions and the thread colors. This work is paused; the note at the top says what the first step is when it resumes.

**design/tokens.json** is the only source of design values (colors, type, spacing, radius, shadow). `scripts/build-tokens.mjs` reads it and writes `assets/tokens.css`. It stays in `docs/design/` because the script reads that path; edit it only as BUILD.md section 2.8 describes.
