import { useParams } from "react-router-dom"
import { getFamilyEntryBySlug } from "../lib/familyEntries"

export default function FamilyEntryDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const entry = slug ? getFamilyEntryBySlug(slug) : null

  if (!entry) return null

  return (
    <div className="detail-page">
      <header className="detail-header">
        <h1 className="detail-title font-normal">{entry.name}</h1>
        <p className="detail-note not-italic">
          Songs picked by {entry.name} will appear here.
        </p>
      </header>

      <div className="detail-stack">
        <section className="detail-panel">
          <p className="detail-placeholder">[No songs added]</p>
        </section>
      </div>
    </div>
  )
}
