# Design tokens

`docs/design/tokens.json` is the only source of design values. `assets/tokens.css` is generated from it and committed. Naming and rules: `docs/THEME_PLAN.md` section 2.

## Regenerate

```
node scripts/build-tokens.mjs
```

Node built-ins only, no install step. The output is deterministic: running it twice leaves the file byte-identical. The script exits with an error naming the token if a value is missing or has an unsupported shape.

## No color literals outside tokens.css

`assets/tokens.css` is the only file in the repo allowed to contain a color literal (hex, `rgb()`, `hsl()`, `oklch()` ...). Everything else uses `var(--color-*)` or `currentColor`.

## When tokens.json changes

1. Edit `docs/design/tokens.json` (design owner only; never edit `tokens.css` by hand).
2. Run `node scripts/build-tokens.mjs`.
3. Review the `assets/tokens.css` diff and commit both files together.
4. If the script rejects a new shape (a new token group, a new value type), extend the script in the same commit instead of working around it.
5. Check the derived `--color-brand-hover` still makes sense for the new `brand` values.
