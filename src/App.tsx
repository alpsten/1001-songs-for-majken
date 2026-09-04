import { Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import SongsPage from "./pages/SongsPage"
import SongDetailPage from "./pages/SongDetailPage"
import ArtistsPage from "./pages/ArtistsPage"
import ArtistDetailPage from "./pages/ArtistDetailPage"
import ThemesPage from "./pages/ThemesPage"
import ThemeDetailPage from "./pages/ThemeDetailPage"
import GenreDetailPage from "./pages/GenreDetailPage"
import FamilyEntryDetailPage from "./pages/FamilyEntryDetailPage"
import Nav from "./components/Nav"
// DeskClutter (ambient background post-its/shapes) is switched off for
// now — turned back on by re-adding the import and <DeskClutter /> below,
// nothing else changed. See docs/DESIGN_SYSTEM.md §7.

export default function App() {
  const currentYear = new Date().getFullYear()

  return (
    <div className="app-shell">
      <Nav />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/songs" element={<SongsPage />} />
          <Route path="/songs/:slug" element={<SongDetailPage />} />
          <Route path="/artists" element={<ArtistsPage />} />
          <Route path="/artists/:slug" element={<ArtistDetailPage />} />
          <Route path="/explore" element={<ThemesPage />} />
          <Route path="/explore/genre/:slug" element={<GenreDetailPage />} />
          <Route path="/explore/family/:slug" element={<FamilyEntryDetailPage />} />
          <Route path="/explore/:slug" element={<ThemeDetailPage />} />
          <Route path="/mood" element={<ThemesPage />} />
          <Route path="/mood/genre/:slug" element={<GenreDetailPage />} />
          <Route path="/mood/family/:slug" element={<FamilyEntryDetailPage />} />
          <Route path="/mood/:slug" element={<ThemeDetailPage />} />
        </Routes>
      </main>

      <footer className="site-footer" aria-label="Site attribution">
        <div className="site-footer-inner">
          <aside className="site-signature">
            <div className="site-signature-name">&copy; {currentYear} Emil Alpsten</div>
          </aside>
        </div>
      </footer>
    </div>
  )
}
