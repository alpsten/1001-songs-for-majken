import { NavLink } from "react-router-dom"

export default function Nav() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "nav-link nav-link-active" : "nav-link"

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="nav-shell">
        <NavLink to="/" end className="nav-mark">
          <span className="nav-mark-index">1001</span>
          <span className="nav-mark-label">Songs for Majken</span>
        </NavLink>
        <div className="nav-links">
          <NavLink to="/songs" className={linkClass}>
            Songs
          </NavLink>
          <NavLink to="/artists" className={linkClass}>
            Artists
          </NavLink>
          <NavLink to="/explore" className={linkClass}>
            Explore
          </NavLink>
        </div>
      </div>
    </nav>
  )
}
