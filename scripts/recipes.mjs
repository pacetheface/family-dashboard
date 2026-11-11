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
  if (data.photo !== slug + '.jpg') fail(name, 'photo must be ' + slug + '.jpg');
  else if (!fs.existsSync(path.join(root, 'photos', data.photo))) fail(name, 'missing photos/' + data.photo);
  if (process.exitCode) return;
  index.push({
    slug: data.slug,
    title: data.title,
    tags: data.tags,
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
