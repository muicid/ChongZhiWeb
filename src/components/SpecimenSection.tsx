import type { SiteConfig } from '../types'

interface SpecimenSectionProps {
  config: SiteConfig
  onOpenDetail: (id: string, trigger: HTMLElement) => void
}

export function SpecimenSection({ config, onOpenDetail }: SpecimenSectionProps) {
  const { specimen } = config
  return (
    <section className="section preparation" id="specimen" aria-labelledby="specimen-title">
      <header className="preparation__header">
        <span className="eyebrow">{specimen.kicker}</span>
        <h2 id="specimen-title">{specimen.title}</h2>
        <p>{specimen.summary}</p>
      </header>

      <div className="preparation__layout">
        <div className="preparation__materials">
          {specimen.notes.map((note, index) => (
            <article key={note.id} className="material-card">
              <span className="material-card__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <div className="material-card__body">
                <span className="material-card__tag">{note.tag}</span>
                <h3>{note.heading}</h3>
                <p>{note.text}</p>
                <button type="button" onClick={(event) => onOpenDetail(note.chapterId, event.currentTarget)}>
                  {note.actionLabel}<span aria-hidden="true">↗</span>
                </button>
              </div>
            </article>
          ))}
        </div>

        <aside className="preparation__checklist" aria-labelledby="preparation-checklist-title">
          <span className="preparation__checklist-kicker">{specimen.checklist.kicker}</span>
          <h3 id="preparation-checklist-title">{specimen.checklist.title}</h3>
          <ul>
            {specimen.checklist.items.map((item) => (
              <li key={item.title}>
                <span className="preparation__check" aria-hidden="true">✓</span>
                <div><strong>{item.title}</strong><p>{item.text}</p></div>
              </li>
            ))}
          </ul>
          <a href={config.hero.rechargeLink.href} target="_blank" rel="noopener noreferrer">
            {specimen.checklist.actionLabel}<span aria-hidden="true">↗</span>
          </a>
          <p className="preparation__hint">{specimen.checklist.hint}</p>
        </aside>
      </div>
    </section>
  )
}
