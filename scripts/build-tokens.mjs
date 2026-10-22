#!/usr/bin/env node
// Generates assets/tokens.css from docs/design/tokens.json.
// Node built-ins only. Idempotent: same input, byte-identical output.
// Naming and rules: docs/THEME_PLAN.md sections 2.2 to 2.4.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = resolve(ROOT, 'docs/design/tokens.json');
const TARGET = resolve(ROOT, 'assets/tokens.css');

const THEMES = ['light', 'dark'];
const SELECTOR = { light: ':root', dark: ':root[data-theme="dark"]' };
const HEX = /^#[0-9A-Fa-f]{6}$/;
const NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const HOVER_BRAND_PERCENT = 92;
const SUPPORTS = '@supports (color: color-mix(in srgb, red, red))';

function fail(message) {
  console.error(`build-tokens: ${message}`);
  process.exit(1);
}

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// A CSS value that cannot break out of its declaration.
function cssValue(value, where) {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value !== 'string' || value.trim() === '') {
    fail(`${where}: expected a non-empty string, got ${JSON.stringify(value)}`);
  }
  if (/[;{}\n\r]|\/\*/.test(value)) fail(`${where}: value contains characters not allowed in CSS: ${JSON.stringify(value)}`);
  return value.trim();
}

function tokenName(token, where) {
  if (!isObject(token)) fail(`${where}: token must be an object`);
  if (typeof token.name !== 'string' || !NAME.test(token.name)) {
    fail(`${where}: missing or invalid "name" (${JSON.stringify(token.name)})`);
  }
  return token.name;
}

// Returns { light, dark } for a themed value, or a plain string for a single value.
function readValue(token, where, { color = false } = {}) {
  const { value } = token;
  if (value === undefined) fail(`${where}: missing "value"`);
  const check = (v, at) => {
    const out = cssValue(v, at);
    if (color && !HEX.test(out) && !/^rgba?\(/.test(out)) fail(`${at}: not a supported color: ${JSON.stringify(v)}`);
    return out;
  };
  if (typeof value === 'string') return check(value, `${where}.value`);
  if (isObject(value)) {
    const keys = Object.keys(value).sort().join(',');
    if (keys !== [...THEMES].sort().join(',')) {
      fail(`${where}.value: themed value needs exactly ${THEMES.join(' and ')}, got {${Object.keys(value).join(', ')}}`);
    }
    return Object.fromEntries(THEMES.map((t) => [t, check(value[t], `${where}.value.${t}`)]));
  }
  return fail(`${where}.value: unsupported shape ${JSON.stringify(value)}`);
}

function list(parent, key, where) {
  const items = parent?.[key];
  if (!Array.isArray(items) || items.length === 0) fail(`${where}.${key}: expected a non-empty array`);
  return items;
}

// brand mixed 92% with black, in sRGB: each channel scaled by 0.92.
function hoverFallback(hex) {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return '#' + channels.map((c) => Math.round((c * HOVER_BRAND_PERCENT) / 100).toString(16).padStart(2, '0')).join('').toUpperCase();
}

let json;
try {
  json = JSON.parse(readFileSync(SOURCE, 'utf8'));
} catch (error) {
  fail(`cannot read ${SOURCE}: ${error.message}`);
}
if (!Number.isInteger(json.version)) fail('"version" must be an integer');

const themeIds = list(json.color, 'themes', 'color').map((t) => t?.id);
if (themeIds.join(',') !== THEMES.join(',')) fail(`color.themes: expected ids ${THEMES.join(', ')}, got ${themeIds.join(', ')}`);

const seen = new Set();
function declare(map, name, prop, value) {
  if (seen.has(prop)) fail(`duplicate custom property ${prop} (token "${name}")`);
  seen.add(prop);
  map.push([prop, value]);
}

function declareThemed(g, name, prop, value) {
  if (seen.has(prop)) fail(`duplicate custom property ${prop} (token "${name}")`);
  seen.add(prop);
  for (const t of THEMES) g[t].push([prop, value[t]]);
}

// Each group: { comment, light: [[prop, value]], dark: [[prop, value]] }.
// Themed groups fill both lists; single-value groups fill light only (:root).
const groups = [];
const group = (comment) => {
  const g = { comment, light: [], dark: [] };
  groups.push(g);
  return g;
};

// Color
const themed = group('Color (themed)');
const single = group('Color (line palette, same in both themes)');
const brand = {};
for (const [i, token] of list(json.color, 'tokens', 'color').entries()) {
  const where = `color.tokens[${i}]`;
  const name = tokenName(token, where);
  const value = readValue(token, `${where} "${name}"`, { color: true });
  const prop = `--color-${name}`;
  if (typeof value === 'string') {
    declare(single.light, name, prop, value);
  } else {
    declareThemed(themed, name, prop, value);
  }
  if (name === 'brand') Object.assign(brand, typeof value === 'string' ? { light: value, dark: value } : value);
}
if (!brand.light) fail('color token "brand" is required to derive --color-brand-hover');
for (const t of THEMES) if (!HEX.test(brand[t])) fail(`color token "brand" (${t}) must be a #RRGGBB hex to derive the hover color`);

// Derived
const derived = group('Derived: primary button hover, brand darkened 8% (see @supports block below)');
const hover = Object.fromEntries(THEMES.map((t) => [t, hoverFallback(brand[t])]));
for (const t of THEMES) derived[t].push(['--color-brand-hover', hover[t]]);

// Type
const families = json.type?.families;
if (!isObject(families) || Object.keys(families).length === 0) fail('type.families: expected a non-empty object');
const fam = group('Font families');
for (const [name, value] of Object.entries(families)) {
  if (!NAME.test(name)) fail(`type.families: invalid family name ${JSON.stringify(name)}`);
  declare(fam.light, name, `--font-${name}`, cssValue(value, `type.families.${name}`));
}
for (const [gi, typeGroup] of list(json.type, 'groups', 'type').entries()) {
  const gWhere = `type.groups[${gi}]`;
  if (typeof typeGroup?.name !== 'string' || typeGroup.name.trim() === '') fail(`${gWhere}: missing "name"`);
  const g = group(`Type: ${typeGroup.name}`);
  for (const [si, style] of list(typeGroup, 'styles', gWhere).entries()) {
    const where = `${gWhere}.styles[${si}]`;
    const name = tokenName(style, where);
    const base = `--type-${name}`;
    declare(g.light, name, `${base}-size`, cssValue(style.fontSize, `${where} "${name}".fontSize`));
    declare(g.light, name, `${base}-line`, cssValue(style.lineHeight, `${where} "${name}".lineHeight`));
    declare(g.light, name, `${base}-weight`, cssValue(style.fontWeight, `${where} "${name}".fontWeight`));
    if (style.letterSpacing !== undefined) {
      declare(g.light, name, `${base}-tracking`, cssValue(style.letterSpacing, `${where} "${name}".letterSpacing`));
    }
  }
}

// Spacing and radius
for (const [key, comment] of [['spacing', 'Spacing'], ['radius', 'Radius']]) {
  const g = group(comment);
  for (const [i, token] of list(json[key], 'tokens', key).entries()) {
    const where = `${key}.tokens[${i}]`;
    const name = tokenName(token, where);
    const value = readValue(token, `${where} "${name}"`);
    if (typeof value !== 'string') fail(`${where} "${name}": ${key} tokens must have a single value`);
    declare(g.light, name, `--${name}`, value);
  }
}

// Shadow
const shadow = group('Shadow (themed)');
for (const [i, token] of list(json.shadow, 'tokens', 'shadow').entries()) {
  const where = `shadow.tokens[${i}]`;
  const name = tokenName(token, where);
  const value = readValue(token, `${where} "${name}"`);
  if (typeof value === 'string') {
    declare(shadow.light, name, `--${name}`, value);
  } else {
    declareThemed(shadow, name, `--${name}`, value);
  }
}

// Emit
const lines = [];
const emit = (indent, text = '') => lines.push(text === '' ? '' : ' '.repeat(indent) + text);

function block(theme) {
  emit(2, `${SELECTOR[theme]} {`);
  emit(4, `color-scheme: ${theme};`);
  for (const g of groups) {
    const decls = g[theme];
    if (decls.length === 0) continue;
    emit(0);
    emit(4, `/* ${g.comment} */`);
    if (theme === 'dark' && g === derived) {
      emit(4, '/* WARNING: darkening is the wrong direction for the dark theme (brand is light on a dark surface). */');
      emit(4, '/* Revisit this rule when dark mode ships. */');
    }
    for (const [prop, value] of decls) emit(4, `${prop}: ${value};`);
  }
  emit(2, '}');
}

emit(0, `/* GENERATED from docs/design/tokens.json v${json.version}. Do not edit by hand. Run scripts/build-tokens.mjs. */`);
emit(0, '@layer tokens {');
block('light');
emit(0);
block('dark');
emit(0);
emit(2, `/* Derived: exact mix where color-mix() is supported, overriding the static hex fallbacks above. */`);
emit(2, `${SUPPORTS} {`);
for (const t of THEMES) {
  emit(4, `${SELECTOR[t]} {`);
  if (t === 'dark') emit(6, '/* Darkening is the wrong direction here; revisit when dark mode ships. */');
  emit(6, `--color-brand-hover: color-mix(in srgb, var(--color-brand) ${HOVER_BRAND_PERCENT}%, black);`);
  emit(4, '}');
}
emit(2, '}');
emit(0, '}');

mkdirSync(dirname(TARGET), { recursive: true });
writeFileSync(TARGET, lines.join('\n') + '\n');
console.log(`build-tokens: wrote ${TARGET.replace(ROOT + '/', '')} (brand-hover light ${hover.light}, dark ${hover.dark})`);
