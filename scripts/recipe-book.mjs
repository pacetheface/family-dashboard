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
  const meta = [recipe.servings != null ? 'Serves ' + recipe.servings : '', time, (recipe.tags || []).join(' · ')].filter(Boolean).join(' · ');
  return '<article class="card"><header><h1>' + esc(recipe.title) + '</h1><p>' + esc(meta) + '</p></header><div class="cols"><div><h2>Ingredients</h2>' + ingHtml + '</div><div><img src="photos/' + esc(recipe.photo) + '" alt=""><h2>Method</h2><ol>' + recipe.steps.map((step) => '<li>' + esc(step) + '</li>').join('') + '</ol>' + (recipe.notes ? '<p class="notes">' + esc(recipe.notes) + '</p>' : '') + (recipe.source ? '<p class="src">' + esc(recipe.source) + '</p>' : '') + '</div></div></article>';
}).join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Knapp recipe cards</title>
<style>
  @page { size: A4; margin: 12mm; }
  body { font-family: Georgia, "Iowan Old Style", serif; color: #2c261f; margin: 0; background: #f6f1e7; }
  h1 { font-size: 22pt; margin: 0; }
  header p { margin: 4px 0 0; color: #6d645c; }
  .card { background: #fffdfb; border-radius: 16px; padding: 18px 20px; margin: 0 0 16px; break-after: page; page-break-after: always; }
  .cols { display: flex; gap: 18px; }
  .cols > div { flex: 1; }
  h2 { font-size: 13pt; margin: 12px 0 6px; }
  h3 { font-size: 11pt; margin: 10px 0 4px; }
  ul, ol { margin: 0; padding-left: 18px; }
  li { margin: 4px 0; }
  img { width: 100%; max-height: 220px; object-fit: cover; border-radius: 12px; }
  .notes, .src { font-size: 10pt; color: #6d645c; }
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
