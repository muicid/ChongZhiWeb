import type { SiteConfig } from '../types'
import { navigateToHash } from '../lib/navigateToHash'
import { Seal } from './Seal'

interface ColophonSectionProps {
  config: SiteConfig
}

export function ColophonSection({ config }: ColophonSectionProps) {
  const pauseAt = config.colophon.quote.indexOf('，')
  const quoteLead = pauseAt >= 0 ? config.colophon.quote.slice(0, pauseAt + 1) : config.colophon.quote
  const quoteTail = pauseAt >= 0 ? config.colophon.quote.slice(pauseAt + 1) : ''

  return (
    <section className="section colophon" id="colophon" aria-labelledby="colophon-title">
      <div className="colophon__register" aria-hidden="true"><span /><span /></div>
      <div className="colophon__body" data-reveal="mask">
        <span className="eyebrow">{config.colophon.kicker}</span>
        <h2 id="colophon-title">
          {quoteLead}
          {quoteTail && <><br />{quoteTail}</>}
        </h2>
        <p>{config.colophon.note}</p>
        <Seal character={config.brand.sealCharacter} label={`${config.brand.name}卷末印`} />
      </div>
      <a className="colophon__return" href="#cover" onClick={navigateToHash} aria-label={config.copy.returnToTop}>
        <span>{config.colophon.restartLabel}</span>
        <i aria-hidden="true" />
      </a>
      <footer className="colophon__footer">
        <span>{config.brand.name} · {config.brand.subtitle}</span>
        <span>{config.copy.footerCredit}</span>
      </footer>
    </section>
  )
}
