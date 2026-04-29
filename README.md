# Bookshelf navigator

An interactive guide for navigating a personal Kindle library by mood, theme, and energy level. Built with React and Vite.

## What it does

- Filter 263 books by theme (psychology, science, philosophy, horror, classics, fantasy, mystery, folklore, history, technical), energy level (light, medium, heavy), and length (short, medium, long).
- Quick presets for common moods: tonight's pick, deep dive weekend, Jung path, Sapolsky path, smart horror, curated picks only, my reading list.
- Search by title, author, theme, or note text.
- Star books to build a personal reading list (saved in your browser).
- Click any book to expand and see curated notes (where available).
- Dark mode adapts to your OS preference.

58 books have hand-written notes; the remainder are auto-tagged from author and title patterns and can be refined over time.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build for production

```bash
npm run build
npm run preview   # to test the production build locally
```

## Deploy to GitHub Pages

There are two paths. The first is fully automatic.

### Option A — automatic via GitHub Actions (recommended)

1. Create a new GitHub repo, e.g. `bookshelf`.
2. Push this project:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```
3. On GitHub, go to **Settings → Pages**, set **Source** to **GitHub Actions**.
4. The included workflow at `.github/workflows/deploy.yml` runs on every push to `main`. It sets `VITE_BASE_PATH` automatically from the repo name, builds, and publishes.
5. Your site will appear at `https://YOUR-USERNAME.github.io/YOUR-REPO/` within a couple of minutes.

### Option B — manual via gh-pages package

```bash
# Set the base path for your repo
echo 'VITE_BASE_PATH=/YOUR-REPO/' > .env.production
npm run deploy
```

This builds the project and publishes the `dist` folder to a `gh-pages` branch. Then in repo Settings → Pages, set Source to `gh-pages` branch.

## Customizing

### Adding curated notes to more books

Edit `src/books.json` directly. Each book is an object like:

```json
{
  "id": 0,
  "t": "The Color of Magic",
  "a": "Terry Pratchett",
  "themes": ["fantasy"],
  "energy": 1,
  "length": "medium",
  "rec": false,
  "note": ""
}
```

Set `note` to your text, adjust `themes`/`energy`/`length`, and toggle `rec` to feature it.

### Available themes

`psychology`, `science`, `meaning` (philosophy), `horror`, `classics`, `fantasy`, `mystery`, `folklore`, `history`, `technical`, `uncategorized`.

To add a new theme, edit the `THEMES` array in `src/App.jsx` and update relevant books in `src/books.json`.

### Energy and length

- Energy: `1` (light), `2` (medium), `3` (heavy).
- Length: `"short"`, `"medium"`, `"long"`.

## Project structure

```
.
├── .github/workflows/deploy.yml   # Auto-deploy to GitHub Pages
├── public/favicon.svg
├── src/
│   ├── App.jsx                    # Main component, all logic
│   ├── books.json                 # All 263 books with metadata
│   ├── main.jsx                   # React entry
│   └── styles.css                 # All styles, with dark mode
├── index.html
├── package.json
└── vite.config.js
```

## License

Personal project — adapt freely.
