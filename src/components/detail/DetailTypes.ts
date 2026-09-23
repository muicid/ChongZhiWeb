import type { DetailRoute } from '../../hooks/useDetailRoute'
import type { SiteConfig } from '../../types'

export interface DetailContentProps {
  config: SiteConfig
  route: DetailRoute
  onClose: () => void
  onNavigate: (route: DetailRoute, trigger?: HTMLElement | null) => void
}
