import type { DetailRoute } from '../../hooks/useDetailRoute'
import type { SiteConfig } from '../../types'

interface DetailRailProps {
  config: SiteConfig
  kind: DetailRoute['kind']
  onClose: () => void
}

export function DetailRail({ config, kind, onClose }: DetailRailProps) {
  const backLabel = kind === 'chapter'
    ? config.copy.chapterDetailBack
    : config.copy.recordDetailBack
  const kindLabel = kind === 'chapter'
    ? config.copy.detailChapterLabel
    : config.copy.detailRecordLabel

  return (
    <aside className="detail-rail" aria-label={backLabel}>
      <span className="detail-rail__brand">{config.brand.name}</span>
      <span className="detail-rail__rule" aria-hidden="true" />
      <span className="detail-rail__kind">{kindLabel}</span>
      <button
        type="button"
        className="detail-rail__back"
        onClick={onClose}
        aria-label={`${backLabel}，${config.copy.closeDetail}`}
      >
        <span aria-hidden="true">←</span>
        <span>{backLabel}</span>
      </button>
    </aside>
  )
}
