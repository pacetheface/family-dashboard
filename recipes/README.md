# Family recipes

These recipes are public. They are not part of the encrypted calendar.

Each recipe is one file, `recipes/<slug>.json`, plus `recipes/photos/<slug>.jpg`. The hub reads `recipes/index.json` for the grid and the JSON file when you open a recipe.

## Add a recipe

1. Copy `_template.json` to `recipes/<slug>.json`. The slug is lowercase words separated by hyphens, and it must match the file name.
2. Fill in the fields. Do not invent a quantity: if the card does not give a single number, set `qty` to `null` and keep the words in `item`.
3. `section` is the Aldi aisle: Produce, Meat & Fish, Dairy & Eggs, Bakery, Pantry, Spices, Frozen, Drinks, or Other.
4. `time.prep`, `time.cook`, and `time.total` are minutes, or `null` when the card does not say.
5. `variations` is optional. Each item is `{ "name", "notes", "changes", "serve_with" }`. `changes` and `serve_with` are lists of strings. Leave the field out when there are none.
6. Save a photo as `recipes/photos/<slug>.jpg`, about 1200 pixels wide and under 250 KB.
7. Commit both files and push. The Recipe index action checks the JSON and refreshes `recipes/index.json` and `recipes/book.html`. Tag chips use Title Case, so `quick` and `Quick` are the same chip.

You can do the same check on your computer:

```bash
node scripts/recipes.mjs
node scripts/recipe-book.mjs
```

`recipes/book.html` is the printable card book. Open it and print, or use the browser’s Save as PDF.
