import { useId, useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { SiteConfig } from '../types'
import { StepIllustration } from './StepIllustration'
import { Seal } from './Seal'
import { LinkedText } from './LinkedText'

interface ChapterIndexProps {
  config: SiteConfig
  onOpenDetail: (id: string, trigger: HTMLElement) => void
}

function getTabMoveDelta(key: string): -1 | 0 | 1 {
  if (key === 'ArrowRight' || key === 'ArrowDown') return 1
  if (key === 'ArrowLeft' || key === 'ArrowUp') return -1
  return 0
}

export function ChapterIndex({ config, onOpenDetail }: ChapterIndexProps) {
  const [activeId, setActiveId] = useState(config.chapters[0]?.id ?? '')
  const groupId = useId()
  const activeIndex = Math.max(0, config.chapters.findIndex((chapter) => chapter.id === activeId))
  const active = config.chapters[activeIndex]

  if (!active) return null

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const delta = getTabMoveDelta(event.key)
    if (!delta && event.key !== 'Home' && event.key !== 'End') return
    event.preventDefault()
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? config.chapters.length - 1 : (index + delta + config.chapters.length) % config.chapters.length
    setActiveId(config.chapters[nextIndex]?.id ?? activeId)
    document.getElementById(`${groupId}-${nextIndex}`)?.focus()
  }

  return (
    <section className="section chapters" id="chapters" aria-labelledby="chapters-title">
      <div className="chapters__content">
        <header className="chapters__header" data-reveal="mask">
          <div>
            <span className="eyebrow">{config.copy.chapterIndexKicker}</span>
             <h2 id="chapters-title">{config.copy.chapterTitle}</h2>
          </div>
          <Seal character={active.index} label={`${config.copy.activeChapter}：${active.label}`} small />
        </header>
        <div
          className="chapters__tabs"
          role="tablist"
          aria-label={config.copy.chapterNavLabel}
          aria-orientation="horizontal"
          style={{ gridTemplateColumns: `repeat(${config.chapters.length}, minmax(72px, 1fr))` }}
          data-reveal="stagger"
        >
          {config.chapters.map((chapter, index) => {
            const selected = chapter.id === active.id
            return (
              <button
                id={`${groupId}-${index}`}
                key={chapter.id}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`${groupId}-panel`}
                tabIndex={selected ? 0 : -1}
                className={selected ? 'chapter-tab is-active' : 'chapter-tab'}
                onClick={() => setActiveId(chapter.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
              >
                <span className="chapter-tab__dot" aria-hidden="true" />
                <span className="chapter-tab__label">{chapter.label}</span>
                <span className="chapter-tab__script">{chapter.script}</span>
                <span className="chapter-tab__slit" aria-hidden="true">
                  <img src={chapter.image.src} alt="" style={{ objectPosition: chapter.image.position }} />
                </span>
              </button>
            )
          })}
        </div>
        <article id={`${groupId}-panel`} className="chapters__panel" role="tabpanel" aria-labelledby={`${groupId}-${activeIndex}`} tabIndex={0} data-reveal="rise">
          <span className="chapters__panel-index">{active.index}</span>
          <div>
            <span className="chapters__panel-script">{active.script}</span>
            <h3>{active.title}</h3>
            <p><LinkedText>{active.summary}</LinkedText></p>
            <button
              type="button"
              className="editorial-link chapters__detail-link"
              onClick={(event) => onOpenDetail(active.id, event.currentTarget)}
            >
              <span>{config.copy.openChapterDetail}</span>
              <i aria-hidden="true">→</i>
            </button>
          </div>
        </article>
      </div>
      <div className="chapters__image" data-reveal="image">
        <StepIllustration media={active.image} />
        <div className="chapters__image-wash" aria-hidden="true" />
        <span className="chapters__coordinate micro"><LinkedText>{active.coordinates}</LinkedText></span>
      </div>
    </section>
  )
}
