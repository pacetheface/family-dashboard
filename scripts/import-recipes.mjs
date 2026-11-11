#!/usr/bin/env node
/**
 * One-time import of the print cards in recipes-src into recipes/<slug>.json
 * and recipes/photos/<slug>.jpg. Not used by CI. The JSON files are the source after this.
 *
 *   node scripts/import-recipes.mjs --src /path/to/recipes-src
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const SKIP = new Set(['creamy-balsamic-vinaigrette', 'corn-salad']);

function argValue(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : '';
}

const srcRoot = path.resolve(argValue('--src') || '');
const outRoot = path.resolve(argValue('--out') || path.join(process.cwd(), 'recipes'));
if (!srcRoot || !fs.existsSync(path.join(srcRoot, 'html'))) {
  console.error('Pass --src pointing at the unpacked recipes-src folder.');
  process.exit(1);
}

const htmlDir = path.join(srcRoot, 'html');
const photoDir = path.join(srcRoot, 'photos');
const outPhoto = path.join(outRoot, 'photos');
fs.mkdirSync(outPhoto, { recursive: true });

function decode(s) {
  return String(s || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, ' ')
    .trim();
}

function parseQtyToken(raw) {
  const t = raw.trim();
  const mixed = t.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  const frac = t.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (frac) return Number(frac[1]) / Number(frac[2]);
  if (/^\d+(?:\.\d+)?$/.test(t)) return Number(t);
  return null;
}

const UNIT_RE = /^(tbsp|tablespoons?|tsp|teaspoons?|cups?|lbs?|pounds?|oz|ounces?|kg|grams?|ml|cloves?|stalks?|cans?|packets?|bunches?|slices?|ears?|filets?|fillets?|sticks?|pinch(?:es)?|sprigs?|heads?)\b/i;

function parseLine(line) {
  let text = line.replace(/^(about|approx\.?|approximately|roughly)\s+/i, '');
  if (/^\s*\d[\d\s\/.]*\s*[–—-]\s*\d/.test(text)) {
    return { qty: null, unit: '', item: line };
  }
  const lead = text.match(/^(\d+\s+\d+\s*\/\s*\d+|\d+\s*\/\s*\d+|\d+(?:\.\d+)?)\s+(.*)$/);
  if (!lead) return { qty: null, unit: '', item: line };
  const qty = parseQtyToken(lead[1]);
  if (qty == null) return { qty: null, unit: '', item: line };
  let rest = lead[2];
  const um = rest.match(UNIT_RE);
  let unit = '';
  if (um) {
    unit = um[1];
    rest = rest.slice(um[0].length).replace(/^[\s,]+/, '');
  }
  if (!rest) return { qty: null, unit: '', item: line };
  if (/\d/.test(rest) && /\b(tsp|tbsp|cups?|oz|lbs?|g|kg|ml)\b/i.test(rest)) {
    return { qty: null, unit: '', item: line };
  }
  return { qty, unit, item: rest };
}

function hasWord(text, word) {
  return new RegExp('\\b' + word + 's?\\b', 'i').test(text);
}
function hasAny(text, words) {
  return words.some((word) => hasWord(text, word));
}
function sectionOf(item, unit) {
  const s = (item + ' ' + unit).toLowerCase();
  if (/\bfrozen\b/.test(s)) return 'Frozen';
  if (hasAny(s, ['salt', 'paprika', 'cumin', 'oregano', 'thyme', 'seasoning', 'cayenne', 'cinnamon', 'nutmeg', 'msg']) || /black pepper|white pepper|fennel seed|pepper flake|garlic powder|onion powder|5-spice|smoked paprika|dried dill|dried parsley|italian seasoning/.test(s)) return 'Spices';
  if (/broth|stock|tomato paste|passata|alfredo|marinara|sauce|ketchup|mayo|mayonnaise|vinegar|flour|pasta|rice|noodle|soy|honey|breadcrumb|panko|oil|sugar|tortellini/.test(s)) return 'Pantry';
  if (hasAny(s, ['chicken', 'beef', 'steak', 'sausage', 'pork', 'fish', 'anchovy', 'meatball', 'bacon', 'turkey', 'prawn', 'shrimp']) || /hot dog/.test(s)) return 'Meat & Fish';
  if (hasAny(s, ['cheese', 'cheddar', 'mozzarella', 'parmesan', 'cotija', 'feta', 'milk', 'cream', 'butter', 'yogurt', 'yoghurt', 'egg']) || /sour cream/.test(s)) return 'Dairy & Eggs';
  if (hasAny(s, ['bun', 'bread', 'toast', 'tortilla', 'wrap', 'crescent', 'roll']) && !/spring roll|breadcrumb/.test(s)) return 'Bakery';
  if (hasAny(s, ['wine', 'beer', 'soda', 'juice']) && !/lemon|lime|pickle/.test(s)) return 'Drinks';
  if (hasAny(s, ['onion', 'garlic', 'pepper', 'carrot', 'celery', 'lemon', 'lime', 'parsley', 'cilantro', 'coriander', 'spinach', 'lettuce', 'cabbage', 'potato', 'asparagus', 'corn', 'tomato', 'avocado', 'mango', 'shallot', 'scallion', 'broccoli', 'mushroom', 'apple', 'herb', 'basil', 'chive', 'cucumber', 'pickle', 'ginger']) && !/powder|seasoning|flake|dried/.test(s)) return 'Produce';
  return 'Other';
}

function parseTime(subtitle) {
  const time = { prep: null, cook: null, total: null };
  const notes = [];
  const parts = subtitle.split(/\s*·\s*/);
  function oneDuration(text) {
    if (/[–—-]|\bto\b/i.test(text)) return null;
    const h = text.match(/(\d+)\s*h(?:ours?|r)?/i);
    const m = text.match(/(\d+)\s*min/i);
    if (!h && !m) return null;
    return (h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) : 0);
  }
  parts.forEach((part) => {
    const prep = part.match(/(\d+)\s*min(?:utes?)?\s*prep/i) || part.match(/prep\s*(\d+)\s*min/i);
    if (prep) {
      time.prep = Number(prep[1]);
      return;
    }
    if (/^total\b/i.test(part)) {
      const n = oneDuration(part);
      if (n != null) time.total = n;
      else notes.push(part);
      return;
    }
    if (/\bon low\b|\bon high\b|\bcook\b/i.test(part) && /h|min/i.test(part)) {
      const n = oneDuration(part);
      if (n != null) time.cook = n;
      else notes.push(part);
      return;
    }
    if (/chill|rest|marinate/i.test(part)) {
      notes.push(part);
      return;
    }
    const n = oneDuration(part);
    if (n != null && time.total == null && /min|hour|\dh\b/i.test(part)) time.total = n;
    else if (/\d/.test(part) && /min|hour|\dh\b/i.test(part)) notes.push(part);
  });
  return { time, timeNotes: notes };
}

function tagsFrom(subtitle) {
  const tags = [];
  subtitle.split(/\s*·\s*/).forEach((part) => {
    if (/^by\s/i.test(part)) return;
    if (/serves|makes|prep|total|kcal|protein/i.test(part)) return;
    let t = part
      .replace(/\d+\s*[–—-]\s*\d+\s*(?:min(?:utes?)?|h(?:ours?)?|°\s*[cf])?/gi, '')
      .replace(/\d+\s*°\s*[cf]/gi, '')
      .replace(/\d+\s*h(?:ours?)?(?:\s*\d+\s*min(?:utes?)?)?/gi, '')
      .replace(/\d+\s*min(?:utes?)?\+?/gi, '')
      .replace(/[+]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^[,.\s]+|[,.\s]+$/g, '');
    if (!t || t.length < 4 || t.length > 28) return;
    if (/^(on|at|or|and|plus|fan|the|for|with)\b/i.test(t)) return;
    if (/\b(at|on|fan)$/i.test(t)) return;
    if (/\d/.test(t)) return;
    tags.push(t);
  });
  return [...new Set(tags)];
}

function servingsOf(subtitle) {
  const serves = subtitle.match(/serves\s+(\d+)\b/i);
  if (serves && !/[–—-]/.test(subtitle.match(/serves\s+[\d–—-]+/i)?.[0] || '')) return Number(serves[1]);
  const makes = subtitle.match(/makes\s+(?:approx\.?\s*)?(\d+)\b/i);
  if (makes && !/[–—-]/.test(subtitle.match(/makes[^·]*/i)?.[0] || '')) return Number(makes[1]);
  return null;
}

function parseCard(file, html) {
  const slug = file.replace(/\.html$/, '');
  const title = decode((html.match(/<h1>([\s\S]*?)<\/h1>/i) || [])[1] || slug);
  const subtitle = decode((html.match(/<h1>[\s\S]*?<\/h1>\s*<p>([\s\S]*?)<\/p>/i) || [])[1] || '');
  const source = (html.match(/<a href="([^"]+)"/i) || [])[1] || '';
  const c1 = (html.match(/<div class="c1">([\s\S]*?)<\/div>\s*<div class="c2">/i) || [])[1] || '';
  const ingHtml = c1.replace(/^[\s\S]*?<h2>\s*Ingredients\s*<\/h2>/i, '');
  const chunks = ingHtml.split(/<h3>/i);
  const ingredients = [];
  chunks.forEach((chunk, i) => {
    let group = '';
    let body = chunk;
    if (i > 0) {
      const m = chunk.match(/^([\s\S]*?)<\/h3>([\s\S]*)$/i);
      if (!m) return;
      group = decode(m[1]);
      body = m[2];
    }
    for (const li of body.matchAll(/<li>([\s\S]*?)<\/li>/gi)) {
      const line = decode(li[1]);
      if (!line) continue;
      const parsed = parseLine(line);
      const row = {
        qty: parsed.qty,
        unit: parsed.unit,
        item: parsed.item,
        section: sectionOf(parsed.item, parsed.unit)
      };
      if (group) row.group = group;
      ingredients.push(row);
    }
  });
  const c2 = (html.match(/<div class="c2">([\s\S]*?)<\/div>\s*<\/div>\s*<\/body>/i) || [])[1] || '';
  const steps = [];
  for (const li of c2.matchAll(/<li>([\s\S]*?)<\/li>/gi)) {
    const withLead = li[1].replace(/<b>([\s\S]*?)<\/b>/gi, (_, t) => decode(t).replace(/\.$/, '') + '. ');
    const step = decode(withLead);
    if (step) steps.push(step);
  }
  const foot = (html.match(/<p class="f">([\s\S]*?)<\/p>/i) || [])[1] || '';
  let notes = decode(foot.replace(/<a[\s\S]*?<\/a>/gi, '').replace(/Source:[\s\S]*$/i, ''));
  const { time, timeNotes } = parseTime(subtitle);
  if (timeNotes.length) notes = [notes, 'Time on the card: ' + timeNotes.join('; ')].filter(Boolean).join(' ');
  const video = (source.match(/[?&]v=(\d+)/) || [])[1] || '';
  const photoNotes = {
    '1315204634060265': 'The reel frame used for the photo ends on a drink, not the finished dish.',
    '2520498325072096': 'The reel frame shows the cook more than the finished dish.',
    '1445224464284591': 'The reel frame shows the chili-crunch sauce, not the finished tenders.'
  };
  if (photoNotes[video]) notes = [notes, photoNotes[video]].filter(Boolean).join(' ');
  const recipe = {
    title,
    slug,
    source,
    servings: servingsOf(subtitle),
    time,
    tags: tagsFrom(subtitle),
    ingredients,
    steps,
    photo: slug + '.jpg'
  };
  if (notes) recipe.notes = notes;
  return { recipe, video };
}

function savePhoto(src, dest) {
  const py = `
import sys
from PIL import Image
im = Image.open(sys.argv[1]).convert("RGB")
w, h = im.size
if w > 1200:
    im = im.resize((1200, round(h * 1200 / w)), Image.Resampling.LANCZOS)
dest = sys.argv[2]
for q in (85, 75, 65, 55, 45, 35, 28):
    im.save(dest, "JPEG", quality=q, optimize=True)
    if __import__("os").path.getsize(dest) <= 250 * 1024:
        break
else:
    im.resize((900, round(im.size[1] * 900 / im.size[0])), Image.Resampling.LANCZOS).save(dest, "JPEG", quality=40, optimize=True)
`;
  const run = spawnSync('python3', ['-c', py, src, dest], { encoding: 'utf8' });
  if (run.status !== 0) throw new Error(run.stderr || 'photo failed');
}

const uncertain = [];
const files = fs.readdirSync(htmlDir).filter((f) => f.endsWith('.html') && f !== '_contents.html' && !SKIP.has(f.replace(/\.html$/, '')));
let count = 0;
for (const file of files) {
  const html = fs.readFileSync(path.join(htmlDir, file), 'utf8');
  const { recipe, video } = parseCard(file, html);
  const slugPng = path.join(htmlDir, recipe.slug + '.png');
  const idJpg = video ? path.join(photoDir, video + '.jpg') : '';
  const photoSrc = fs.existsSync(slugPng) ? slugPng : (idJpg && fs.existsSync(idJpg) ? idJpg : '');
  if (!photoSrc) uncertain.push(recipe.slug + ': no photo file');
  else savePhoto(photoSrc, path.join(outPhoto, recipe.photo));
  if (!recipe.ingredients.length) uncertain.push(recipe.slug + ': no ingredients');
  if (!recipe.steps.length) uncertain.push(recipe.slug + ': no steps');
  if (!recipe.source) uncertain.push(recipe.slug + ': no source link');
  if (recipe.servings == null) uncertain.push(recipe.slug + ': servings not a single number');
  const missingQty = recipe.ingredients.filter((i) => i.qty == null).length;
  if (missingQty) uncertain.push(recipe.slug + ': ' + missingQty + ' ingredient line(s) kept as written, no single quantity');
  fs.writeFileSync(path.join(outRoot, recipe.slug + '.json'), JSON.stringify(recipe, null, 2) + '\n');
  count += 1;
}
console.log('Wrote ' + count + ' recipes to ' + outRoot);
uncertain.forEach((line) => console.log('uncertain: ' + line));
