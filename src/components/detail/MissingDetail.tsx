import { useEffect, useRef } from 'react'
import type { DetailRoute } from '../../hooks/useDetailRoute'
import type { SiteConfig } from '../../types'

interface MissingDetailProps {
  config: SiteConfig
  kind: DetailRoute['kind']
  onClose: () => void
}

export function MissingDetail({ config, kind, onClose }: MissingDetailProps) {
  const backLabel = kind === 'chapter'
    ? config.copy.chapterDetailBack
    : config.copy.recordDetailBack
  const noteRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => noteRef.current?.focus({ preventScroll: true }), [])

  return (
    <main className="detail-main detail-missing" id="detail-main">
      <p ref={noteRef} tabIndex={-1} className="detail-missing__note">
        {config.copy.detailMissing ?? '此卷页不存在，或已送回档案。'}
      </p>
      <button type="button" className="editorial-link detail-missing__back" onClick={onClose}>
        <span>{backLabel}</span>
        <i aria-hidden="true">←</i>
      </button>
      <button type="button" className="detail-close-mobile" onClick={onClose}>
        {backLabel}
      </button>
    </main>
  )
}
