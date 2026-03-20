import { Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import SongsPage from "./pages/SongsPage"
import SongDetailPage from "./pages/SongDetailPage"
import ArtistsPage from "./pages/ArtistsPage"
import ArtistDetailPage from "./pages/ArtistDetailPage"
import ThemesPage from "./pages/ThemesPage"
import ThemeDetailPage from "./pages/ThemeDetailPage"
import Nav from "./components/Nav"

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/songs" element={<SongsPage />} />
          <Route path="/songs/:slug" element={<SongDetailPage />} />
          <Route path="/artists" element={<ArtistsPage />} />
          <Route path="/artists/:slug" element={<ArtistDetailPage />} />
          <Route path="/themes" element={<ThemesPage />} />
          <Route path="/themes/:slug" element={<ThemeDetailPage />} />
        </Routes>
      </main>
    </>
  )
}
