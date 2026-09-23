import { useEffect, useRef } from 'react'
import { SafeImage } from '../SafeImage'
import { LinkedText } from '../LinkedText'
import { StepIllustration } from '../StepIllustration'
import type { DetailContentProps } from './DetailTypes'

export function ChapterDetail({ config, route, onClose, onNavigate }: DetailContentProps) {
  const chapterIndex = config.chapters.findIndex((chapter) => chapter.id === route.id)
  const chapter = config.chapters[chapterIndex]
  const next = config.chapters[chapterIndex + 1]
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => titleRef.current?.focus({ preventScroll: true }), [chapter?.id])
  if (!chapter) return null

  return (
    <main className="detail-main detail-main--chapter" id="detail-main">
      <div className="chapter-detail__painting" data-detail-motion="image">
        <StepIllustration media={chapter.image} />
        <div className="chapter-detail__painting-wash" aria-hidden="true" />
         <span className="chapter-detail__coordinate micro"><LinkedText>{chapter.coordinates}</LinkedText></span>
      </div>

      <article className="chapter-detail__article">
        <header className="chapter-detail__header" data-detail-motion="mask">
          <span className="eyebrow">{chapter.detail.kicker}</span>
          <span className="chapter-detail__accent-rule" aria-hidden="true" />
          <h1 ref={titleRef} tabIndex={-1}>{chapter.detail.title}</h1>
          <p>{chapter.detail.intro}</p>
        </header>

        <blockquote className="chapter-detail__quote" data-detail-motion="draw">
          <span aria-hidden="true">“</span>
          <p><LinkedText>{chapter.detail.quote}</LinkedText></p>
          <cite>— {chapter.detail.quoteAttribution}</cite>
          <span aria-hidden="true">”</span>
        </blockquote>

        <div className="chapter-detail__prose" data-detail-motion="stagger">
          {chapter.detail.paragraphs.map((paragraph) => <p key={paragraph}><LinkedText>{paragraph}</LinkedText></p>)}
        </div>

        {chapter.detail.secondaryImage && (
          <figure className="chapter-detail__figure" data-detail-motion="image">
            <SafeImage media={chapter.detail.secondaryImage} fallbackLabel={config.copy.imageUnavailable} />
          </figure>
        )}

        <footer className="detail-pager">
          <span>{chapter.index}</span>
          <span className="detail-pager__line" aria-hidden="true" />
          <span className="detail-pager__footnote">{chapter.detail.footnote}</span>
          <button
            type="button"
            onClick={(event) => next ? onNavigate({ kind: 'chapter', id: next.id }, event.currentTarget) : onClose()}
          >
            <small>{next ? config.copy.nextChapter : config.copy.completeGuide}</small>
            <strong>{next ? next.label : config.copy.chapterDetailBack}</strong>
            <span aria-hidden="true">{next ? '→' : '↩'}</span>
          </button>
        </footer>
      </article>

      <button type="button" className="detail-close-mobile" onClick={onClose}>
        {config.copy.chapterDetailBack}
      </button>
    </main>
  )
}
