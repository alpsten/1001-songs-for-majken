import { NavLink } from "react-router-dom"

export default function Nav() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "ui-pill ui-pill-active"
      : "ui-pill"

  return (
    <nav className="fixed top-4 left-0 right-0 z-50 px-4 py-4">
      <div className="nav-shell flex items-center gap-2">
        <NavLink to="/" end className={linkClass}>
          <span>Home</span>
        </NavLink>
        <NavLink to="/songs" className={linkClass}>
          <span>Songs</span>
        </NavLink>
        <NavLink to="/artists" className={linkClass}>
          <span>Artists</span>
        </NavLink>
        <NavLink to="/explore" className={linkClass}>
          <span>Explore</span>
        </NavLink>
      </div>
    </nav>
  )
}
