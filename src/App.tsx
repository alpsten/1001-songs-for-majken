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

export default function App() {
  const currentYear = new Date().getFullYear()

  return (
    <div className="app-shell">
      {/* Animated gradient — fixed behind everything, always moving */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -10,
          backgroundImage:
            "linear-gradient(162deg, #ff1744 0%, #aa00ff 25%, #ff6d00 50%, #ff1744 75%, #aa00ff 100%)",
          backgroundSize: "100% 300%",
          backgroundPosition: "50% 0%",
          animation: "gradientShift 13s cubic-bezier(0.36, 0.45, 0.63, 0.53) infinite alternate",
        }}
      />

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
            <p className="site-signature-quote">"Majken, this is music provided from your cool old dad."</p>
            <div className="site-signature-name">&copy; {currentYear} Emil Alpsten</div>
          </aside>
        </div>
      </footer>
    </div>
  )
}
