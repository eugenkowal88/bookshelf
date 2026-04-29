import { useState, useMemo, useEffect } from 'react'
import booksData from './books.json'

const THEMES = [
  { id: 'psychology', label: 'Psychology', color: { bg: '#EEEDFE', fg: '#3C3489' } },
  { id: 'science', label: 'Science', color: { bg: '#E1F5EE', fg: '#085041' } },
  { id: 'meaning', label: 'Philosophy & meaning', color: { bg: '#FAEEDA', fg: '#633806' } },
  { id: 'horror', label: 'Horror', color: { bg: '#FBEAF0', fg: '#72243E' } },
  { id: 'classics', label: 'Classics', color: { bg: '#F1EFE8', fg: '#444441' } },
  { id: 'fantasy', label: 'Fantasy', color: { bg: '#E6F1FB', fg: '#0C447C' } },
  { id: 'mystery', label: 'Mystery', color: { bg: '#FCEBEB', fg: '#791F1F' } },
  { id: 'folklore', label: 'Folklore', color: { bg: '#EAF3DE', fg: '#27500A' } },
  { id: 'history', label: 'History', color: { bg: '#FAECE7', fg: '#712B13' } },
  { id: 'technical', label: 'Technical', color: { bg: '#F1EFE8', fg: '#444441' } },
  { id: 'uncategorized', label: 'Uncategorized', color: { bg: '#F1EFE8', fg: '#5F5E5A' } },
]

const ENERGIES = [
  { id: 1, label: 'Light' },
  { id: 2, label: 'Medium' },
  { id: 3, label: 'Heavy' },
]

const LENGTHS = [
  { id: 'short', label: 'Short' },
  { id: 'medium', label: 'Medium' },
  { id: 'long', label: 'Long' },
]

const PRESETS = [
  { id: 'tonight', label: "Tonight's pick", filter: { rec: true } },
  { id: 'deep', label: 'Deep dive weekend', filter: { energies: [3] } },
  { id: 'jung', label: 'Jung path', filter: { authorMatch: /Jung|Johnson|Campbell/i } },
  { id: 'sapolsky', label: 'Sapolsky path', filter: { authorMatch: /Sapolsky/i } },
  { id: 'horror', label: 'Smart horror', filter: { themes: ['horror'], energies: [2, 3] } },
  { id: 'curated', label: 'Curated picks only', filter: { hasNote: true } },
  { id: 'favorites', label: 'My reading list', filter: { favoritesOnly: true } },
]

const themeMap = Object.fromEntries(THEMES.map(t => [t.id, t]))

function EnergyDots({ level }) {
  return (
    <span className="energy-dots" aria-label={`Energy level ${level} of 3`}>
      {[1, 2, 3].map(i => (
        <span key={i} className={`dot ${i <= level ? 'on' : ''}`} />
      ))}
    </span>
  )
}

function BookCard({ book, expanded, onToggle, isFavorite, onToggleFavorite }) {
  const themeLabel = id => themeMap[id]?.label || id
  const themeColor = id => themeMap[id]?.color || themeMap.uncategorized.color
  const lengthLabel = LENGTHS.find(l => l.id === book.length)?.label || book.length
  const energyLabel = ENERGIES.find(e => e.id === book.energy)?.label || ''

  return (
    <div className={`book-card ${book.rec ? 'featured' : ''} ${expanded ? 'expanded' : ''}`}>
      <div className="book-header" onClick={onToggle}>
        <div className="book-title-block">
          <div className="book-title">{book.t}</div>
          <div className="book-author">{book.a}</div>
        </div>
        <div className="book-header-right">
          <button
            className={`fav-btn ${isFavorite ? 'on' : ''}`}
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(book.id); }}
            aria-label={isFavorite ? 'Remove from reading list' : 'Add to reading list'}
            title={isFavorite ? 'Remove from reading list' : 'Add to reading list'}
          >
            {isFavorite ? '★' : '☆'}
          </button>
          {book.rec && <span className="badge-rec">Recommended</span>}
        </div>
      </div>
      <div className="book-meta">
        {book.themes.map(t => {
          const c = themeColor(t)
          return (
            <span key={t} className="book-tag" style={{ background: c.bg, color: c.fg }}>
              {themeLabel(t)}
            </span>
          )
        })}
        <span className="book-tag book-tag-neutral">
          <EnergyDots level={book.energy} /> {energyLabel}
        </span>
        <span className="book-tag book-tag-neutral">{lengthLabel}</span>
      </div>
      {expanded && book.note && (
        <div className="book-note">{book.note}</div>
      )}
      {expanded && !book.note && (
        <div className="book-note book-note-empty">
          No curated notes yet for this book. Themes and metadata were auto-tagged from author and title patterns.
        </div>
      )}
    </div>
  )
}

const FAVORITES_KEY = 'bookshelf-favorites-v1'
const NOTES_KEY = 'bookshelf-personal-notes-v1'

function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch { return new Set() }
}

function saveFavorites(set) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...set]))
  } catch {}
}

export default function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeThemes, setActiveThemes] = useState(new Set())
  const [activeEnergies, setActiveEnergies] = useState(new Set())
  const [activeLengths, setActiveLengths] = useState(new Set())
  const [activePreset, setActivePreset] = useState(null)
  const [expanded, setExpanded] = useState(new Set())
  const [favorites, setFavorites] = useState(loadFavorites())
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false)

  useEffect(() => { saveFavorites(favorites) }, [favorites])

  const toggleSet = (set, setSet, value) => {
    const next = new Set(set)
    next.has(value) ? next.delete(value) : next.add(value)
    setSet(next)
    setActivePreset(null)
  }

  const toggleFavorite = (id) => {
    const next = new Set(favorites)
    next.has(id) ? next.delete(id) : next.add(id)
    setFavorites(next)
  }

  const applyPreset = (preset) => {
    if (activePreset === preset.id) {
      setActivePreset(null)
      setActiveThemes(new Set())
      setActiveEnergies(new Set())
      setActiveLengths(new Set())
      setShowOnlyFavorites(false)
      return
    }
    setActivePreset(preset.id)
    setActiveThemes(new Set(preset.filter.themes || []))
    setActiveEnergies(new Set(preset.filter.energies || []))
    setActiveLengths(new Set(preset.filter.lengths || []))
    setShowOnlyFavorites(!!preset.filter.favoritesOnly)
  }

  const clearAll = () => {
    setActiveThemes(new Set())
    setActiveEnergies(new Set())
    setActiveLengths(new Set())
    setActivePreset(null)
    setSearchQuery('')
    setShowOnlyFavorites(false)
  }

  const filtered = useMemo(() => {
    let result = booksData.slice()
    const preset = PRESETS.find(p => p.id === activePreset)

    if (preset) {
      if (preset.filter.rec) result = result.filter(b => b.rec)
      if (preset.filter.hasNote) result = result.filter(b => b.note)
      if (preset.filter.authorMatch) result = result.filter(b => preset.filter.authorMatch.test(b.a))
      if (preset.filter.favoritesOnly) result = result.filter(b => favorites.has(b.id))
    }

    if (showOnlyFavorites) result = result.filter(b => favorites.has(b.id))
    if (activeThemes.size) result = result.filter(b => b.themes.some(t => activeThemes.has(t)))
    if (activeEnergies.size) result = result.filter(b => activeEnergies.has(b.energy))
    if (activeLengths.size) result = result.filter(b => activeLengths.has(b.length))

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter(b =>
        b.t.toLowerCase().includes(q) ||
        b.a.toLowerCase().includes(q) ||
        b.themes.some(t => t.toLowerCase().includes(q)) ||
        (b.note && b.note.toLowerCase().includes(q))
      )
    }

    return result.sort((a, b) => {
      if (a.rec !== b.rec) return b.rec - a.rec
      if (!!a.note !== !!b.note) return (!!b.note) - (!!a.note)
      return a.t.localeCompare(b.t)
    })
  }, [activePreset, activeThemes, activeEnergies, activeLengths, searchQuery, showOnlyFavorites, favorites])

  const totalBooks = booksData.length
  const matchCount = filtered.length
  const favoriteCount = favorites.size

  const themeCounts = useMemo(() => {
    const counts = {}
    booksData.forEach(b => b.themes.forEach(t => { counts[t] = (counts[t] || 0) + 1 }))
    return counts
  }, [])

  const visibleThemes = THEMES.filter(t => themeCounts[t.id] > 0)

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Your bookshelf</h1>
        <p className="subtitle">
          {totalBooks} books from your Kindle library — filtered by mood, theme, and energy.
          {favoriteCount > 0 && <span className="fav-count"> · {favoriteCount} on your reading list</span>}
        </p>
      </header>

      <section className="presets-section">
        {PRESETS.map(p => (
          <button
            key={p.id}
            className={`preset-btn ${activePreset === p.id ? 'active' : ''}`}
            onClick={() => applyPreset(p)}
          >
            {p.label}
          </button>
        ))}
      </section>

      <section className="search-section">
        <input
          type="search"
          className="search-input"
          placeholder="Search by title, author, or theme…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </section>

      <section className="filters-section">
        <div className="filter-row">
          <div className="filter-label">Theme</div>
          <div className="pill-group">
            {visibleThemes.map(theme => (
              <button
                key={theme.id}
                className={`pill ${activeThemes.has(theme.id) ? 'active' : ''}`}
                onClick={() => toggleSet(activeThemes, setActiveThemes, theme.id)}
              >
                {theme.label}
                <span className="pill-count">{themeCounts[theme.id]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-label">Energy required</div>
          <div className="pill-group">
            {ENERGIES.map(e => (
              <button
                key={e.id}
                className={`pill ${activeEnergies.has(e.id) ? 'active' : ''}`}
                onClick={() => toggleSet(activeEnergies, setActiveEnergies, e.id)}
              >
                {e.label}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-label">Length</div>
          <div className="pill-group">
            {LENGTHS.map(l => (
              <button
                key={l.id}
                className={`pill ${activeLengths.has(l.id) ? 'active' : ''}`}
                onClick={() => toggleSet(activeLengths, setActiveLengths, l.id)}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="results-bar">
        <span className="match-count">
          {matchCount === totalBooks ? `Showing all ${totalBooks} books` : `${matchCount} of ${totalBooks} books match`}
        </span>
        <button className="clear-btn" onClick={clearAll}>Clear all filters</button>
      </section>

      <section className="book-grid">
        {filtered.length === 0 ? (
          <div className="empty">
            No books match these filters. Try clearing one — or your reading list is empty if that's the active preset.
          </div>
        ) : (
          filtered.map(book => (
            <BookCard
              key={book.id}
              book={book}
              expanded={expanded.has(book.id)}
              onToggle={() => {
                const next = new Set(expanded)
                next.has(book.id) ? next.delete(book.id) : next.add(book.id)
                setExpanded(next)
              }}
              isFavorite={favorites.has(book.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))
        )}
      </section>

      <footer className="app-footer">
        <p>
          Curated notes on {booksData.filter(b => b.note).length} books · others auto-tagged from author and title.
          Favorites and expanded state are stored in your browser only.
        </p>
      </footer>
    </div>
  )
}
