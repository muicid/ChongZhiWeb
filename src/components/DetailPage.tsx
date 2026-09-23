import { useEffect } from 'react'
import type { DetailRoute } from '../hooks/useDetailRoute'
import type { SiteConfig } from '../types'
import { ChapterDetail } from './detail/ChapterDetail'
import { DetailRail } from './detail/DetailRail'
import { MissingDetail } from './detail/MissingDetail'
import { RecordDetail } from './detail/RecordDetail'

interface DetailPageProps {
  config: SiteConfig
  route: DetailRoute
  isClosing: boolean
  onClose: () => void
  onNavigate: (route: DetailRoute, trigger?: HTMLElement | null) => void
}

export function DetailPage(props: DetailPageProps) {
  const { config, route, isClosing, onClose } = props

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const resolved = route.kind === 'chapter'
    ? config.chapters.some((chapter) => chapter.id === route.id)
    : config.records.entries.some((record) => record.id === route.id)

  return (
    <div className="detail-page" data-kind={route.kind} data-closing={isClosing ? 'true' : 'false'}>
      <DetailRail config={config} kind={route.kind} onClose={onClose} />
      {!resolved && <MissingDetail config={config} kind={route.kind} onClose={onClose} />}
      {resolved && (route.kind === 'chapter'
        ? <ChapterDetail {...props} />
        : <RecordDetail {...props} />)}
    </div>
  )
}
