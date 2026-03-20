import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { loadThemes } from "../lib/parseContent"
import type { Theme } from "../types"
import styles from "./ThemesPage.module.css"

export default function ThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([])

  useEffect(() => {
    loadThemes().then((list) => setThemes(list.sort((a, b) => a.name.localeCompare(b.name))))
  }, [])

  return (
    <div>
      <h1>Themes</h1>
      <div className={styles.grid}>
        {themes.map((theme) => (
          <Link key={theme.id} to={`/themes/${theme.slug}`} className={styles.card}>
            <div className={styles.name}>{theme.name}</div>
            {theme.description && <p className={styles.desc}>{theme.description}</p>}
          </Link>
        ))}
      </div>
    </div>
  )
}
