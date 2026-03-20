import { NavLink } from "react-router-dom"
import styles from "./Nav.module.css"

export default function Nav() {
  return (
    <nav className={styles.nav}>
      <NavLink to="/" end className={({ isActive }) => isActive ? styles.active : ""}>Home</NavLink>
      <NavLink to="/songs" className={({ isActive }) => isActive ? styles.active : ""}>Songs</NavLink>
      <NavLink to="/artists" className={({ isActive }) => isActive ? styles.active : ""}>Artists</NavLink>
      <NavLink to="/themes" className={({ isActive }) => isActive ? styles.active : ""}>Themes</NavLink>
    </nav>
  )
}
