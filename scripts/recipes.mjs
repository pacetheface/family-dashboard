#!/usr/bin/env node
/**
 * Validate recipes/*.json and rewrite recipes/index.json.
 *   node scripts/recipes.mjs
 * Exits 1 and names the file when a recipe does not match the schema.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'recipes');
const SECTIONS = new Set(['Produce', 'Meat & Fish', 'Dairy & Eggs', 'Bakery', 'Pantry', 'Spices', 'Frozen', 'Drinks', 'Other']);

function fail(file, message) {
  console.error(file + ': ' + message);
  process.exitCode = 1;
}

function isNumOrNull(value) {
  return value === null || (typeof value === 'number' && Number.isFinite(value));
}

const SMALL_WORDS = new Set(['and', 'or', 'of', 'the', 'a', 'an', 'to', 'for', 'in', 'on', 'with']);

function titleTag(tag) {
  let wordIndex = 0;
  return String(tag).trim().split(/(\s+|-)/).map((part) => {
    if (!part || /^\s+$/.test(part) || part === '-') return part;
    const lower = part.toLowerCase();
    const cap = lower.charAt(0).toUpperCase() + lower.slice(1);
    const out = wordIndex > 0 && SMALL_WORDS.has(lower) ? lower : cap;
    wordIndex += 1;
    return out;
  }).join('');
}

function normalizeTags(tags) {
  const seen = new Set();
  const out = [];
  tags.forEach((tag) => {
    const label = titleTag(tag);
    const key = label.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(label);
  });
  return out;
}

function isStringList(value) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string' && item.trim());
}

const files = fs.readdirSync(root).filter((name) => name.endsWith('.json') && name !== 'index.json' && name !== '_template.json');
const index = [];

files.forEach((name) => {
  const full = path.join(root, name);
  let data;
  try {
    data = JSON.parse(fs.readFileSync(full, 'utf8'));
  } catch (err) {
    fail(name, 'is not valid JSON (' + err.message + ')');
    return;
  }
  const slug = name.replace(/\.json$/, '');
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    fail(name, 'must be a JSON object');
    return;
  }
  if (typeof data.title !== 'string' || !data.title.trim()) fail(name, 'title must be a non-empty string');
  if (data.slug !== slug) fail(name, 'slug must match the file name (' + slug + ')');
  if (typeof data.source !== 'string') fail(name, 'source must be a string');
  if (!isNumOrNull(data.servings)) fail(name, 'servings must be a number or null');
  if (!data.time || typeof data.time !== 'object') fail(name, 'time must be an object');
  else ['prep', 'cook', 'total'].forEach((key) => {
    if (!isNumOrNull(data.time[key])) fail(name, 'time.' + key + ' must be a number of minutes or null');
  });
  if (!Array.isArray(data.tags) || data.tags.some((tag) => typeof tag !== 'string' || !tag.trim())) {
    fail(name, 'tags must be an array of non-empty strings');
  }
  if (!Array.isArray(data.ingredients) || !data.ingredients.length) fail(name, 'ingredients must be a non-empty array');
  else data.ingredients.forEach((ing, i) => {
    const where = 'ingredients[' + i + ']';
    if (!ing || typeof ing !== 'object') { fail(name, where + ' must be an object'); return; }
    if (!isNumOrNull(ing.qty)) fail(name, where + '.qty must be a number or null');
    if (typeof ing.unit !== 'string') fail(name, where + '.unit must be a string');
    if (typeof ing.item !== 'string' || !ing.item.trim()) fail(name, where + '.item must be a non-empty string');
    if (!SECTIONS.has(ing.section)) fail(name, where + '.section must be one of ' + [...SECTIONS].join(', '));
    if (ing.group != null && typeof ing.group !== 'string') fail(name, where + '.group must be a string when present');
  });
  if (!Array.isArray(data.steps) || !data.steps.length || data.steps.some((step) => typeof step !== 'string' || !step.trim())) {
    fail(name, 'steps must be a non-empty array of strings');
  }
  if (data.notes != null && typeof data.notes !== 'string') fail(name, 'notes must be a string when present');
  if (data.variations != null) {
    if (!Array.isArray(data.variations)) fail(name, 'variations must be an array when present');
    else data.variations.forEach((variation, i) => {
      const where = 'variations[' + i + ']';
      if (!variation || typeof variation !== 'object' || Array.isArray(variation)) {
        fail(name, where + ' must be an object');
        return;
      }
      if (typeof variation.name !== 'string' || !variation.name.trim()) fail(name, where + '.name must be a non-empty string');
      if (variation.notes != null && typeof variation.notes !== 'string') fail(name, where + '.notes must be a string when present');
      if (!isStringList(variation.changes)) fail(name, where + '.changes must be an array of non-empty strings');
      if (!isStringList(variation.serve_with)) fail(name, where + '.serve_with must be an array of non-empty strings');
    });
  }
  if (data.photo !== slug + '.jpg') fail(name, 'photo must be ' + slug + '.jpg');
  else if (!fs.existsSync(path.join(root, 'photos', data.photo))) fail(name, 'missing photos/' + data.photo);
  if (process.exitCode) return;
  index.push({
    slug: data.slug,
    title: data.title,
    tags: normalizeTags(data.tags),
    time: { prep: data.time.prep, cook: data.time.cook, total: data.time.total },
    photo: data.photo,
    servings: data.servings
  });
});

if (process.exitCode) {
  console.error('Recipe check failed.');
  process.exit(process.exitCode);
}

index.sort((a, b) => a.title.localeCompare(b.title));
fs.writeFileSync(path.join(root, 'index.json'), JSON.stringify(index, null, 2) + '\n');
console.log('Checked ' + index.length + ' recipes. Wrote recipes/index.json');
