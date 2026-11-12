#!/usr/bin/env node
/**
 * Rebuild the printable card book from recipes/*.json.
 *   node scripts/recipe-book.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'recipes');

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function qty(n) {
  if (n == null) return '';
  const rounded = Math.round(n * 100) / 100;
  const whole = Math.floor(rounded + 1e-6);
  const frac = rounded - whole;
  const known = [[0.25, '1/4'], [1 / 3, '1/3'], [0.5, '1/2'], [2 / 3, '2/3'], [0.75, '3/4']];
  for (const [value, label] of known) {
    if (Math.abs(frac - value) < 0.04) return (whole ? whole + ' ' : '') + label;
  }
  if (frac < 0.04) return String(whole);
  return String(rounded);
}

function line(ing) {
  if (ing.qty == null) return ing.item;
  return [qty(ing.qty), ing.unit, ing.item].filter(Boolean).join(' ');
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

function tagLine(tags) {
  const seen = new Set();
  const labels = [];
  (tags || []).forEach((tag) => {
    const label = titleTag(tag);
    const key = label.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    labels.push(label);
  });
  return labels.join(' · ');
}

function variationsHtml(recipe) {
  if (!Array.isArray(recipe.variations) || !recipe.variations.length) return '';
  const blocks = recipe.variations.map((variation) => {
    const notes = variation.notes ? '<p class="notes">' + esc(variation.notes) + '</p>' : '';
    const changes = (variation.changes || []).map((change) => '<li>' + esc(change) + '</li>').join('');
    const serve = (variation.serve_with || []).length
      ? '<p><b>Serve with</b> ' + esc(variation.serve_with.join(', ')) + '</p>'
      : '';
    return '<h3>' + esc(variation.name) + '</h3>' + notes + (changes ? '<ul>' + changes + '</ul>' : '') + serve;
  }).join('');
  return '<h2>Variations</h2>' + blocks;
}

const files = fs.readdirSync(root).filter((name) => name.endsWith('.json') && name !== 'index.json' && name !== '_template.json');
const recipes = files.map((name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8')));
recipes.sort((a, b) => a.title.localeCompare(b.title));

const cards = recipes.map((recipe) => {
  const groups = [];
  recipe.ingredients.forEach((ing) => {
    const name = ing.group || '';
    const last = groups[groups.length - 1];
    if (!last || last.name !== name) groups.push({ name, items: [ing] });
    else last.items.push(ing);
  });
  const ingHtml = groups.map((group) => {
    const head = group.name ? '<h3>' + esc(group.name) + '</h3>' : '';
    return head + '<ul>' + group.items.map((ing) => '<li>' + esc(line(ing)) + '</li>').join('') + '</ul>';
  }).join('');
  const time = [recipe.time.prep != null ? 'Prep ' + recipe.time.prep + ' min' : '', recipe.time.cook != null ? 'Cook ' + recipe.time.cook + ' min' : '', recipe.time.total != null ? recipe.time.total + ' min' : ''].filter(Boolean).join(' · ');
  const meta = [recipe.servings != null ? 'Serves ' + recipe.servings : '', time, tagLine(recipe.tags)].filter(Boolean).join(' · ');
  return '<article class="card"><header><h1>' + esc(recipe.title) + '</h1><p>' + esc(meta) + '</p></header><div class="cols"><div><h2>Ingredients</h2>' + ingHtml + '</div><div><img src="photos/' + esc(recipe.photo) + '" alt=""><h2>Method</h2><ol>' + recipe.steps.map((step) => '<li>' + esc(step) + '</li>').join('') + '</ol>' + (recipe.notes ? '<p class="notes">' + esc(recipe.notes) + '</p>' : '') + (recipe.source ? '<p class="src">' + esc(recipe.source) + '</p>' : '') + '</div></div>' + variationsHtml(recipe) + '</article>';
}).join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Knapp recipe cards</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;800&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 12mm; }
  body { font-family: Montserrat, "Segoe UI", sans-serif; font-weight: 500; color: #003253; margin: 0; background: #D6DBE7; }
  h1 { font-size: 22pt; margin: 0; font-weight: 800; }
  header p { margin: 4px 0 0; color: #3d5c78; }
  .card { background: #fffdfb; border-radius: 16px; padding: 18px 20px; margin: 0 0 16px; break-after: page; page-break-after: always; }
  .cols { display: flex; gap: 18px; }
  .cols > div { flex: 1; }
  h2 { font-size: 13pt; margin: 12px 0 6px; font-weight: 800; }
  h3 { font-size: 11pt; margin: 10px 0 4px; font-weight: 800; }
  ul, ol { margin: 0; padding-left: 18px; }
  li { margin: 4px 0; }
  img { width: 100%; max-height: 220px; object-fit: cover; border-radius: 12px; }
  .notes, .src { font-size: 10pt; color: #3d5c78; }
  @media screen { body { padding: 24px; } .card { box-shadow: 0 8px 24px rgba(80,50,20,.06); } }
</style>
</head>
<body>
${cards}
</body>
</html>
`;
fs.writeFileSync(path.join(root, 'book.html'), html);
console.log('Wrote recipes/book.html (' + recipes.length + ' cards)');
