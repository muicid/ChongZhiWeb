import type { SiteConfig } from '../types'
import { navigateToHash } from '../lib/navigateToHash'

interface LandscapeAtlasSectionProps {
  config: SiteConfig
  onOpenDetail: (id: string, trigger: HTMLElement) => void
}

const stepIcons = [
  <><rect x="4" y="6" width="24" height="20" rx="4" /><path d="M4 12h24M9 19h5m5 0h4" /></>,
  <><rect x="5" y="4" width="22" height="24" rx="4" /><path d="m13 12-4 4 4 4m6-8 4 4-4 4" /></>,
  <><circle cx="16" cy="16" r="12" /><path d="M16 9v8l5 3" /></>,
  <><path d="m16 3 11 5v8c0 7-11 13-11 13S5 23 5 16V8Z" /><path d="m11 16 3 3 7-7" /></>,
]

export function LandscapeAtlasSection({ config, onOpenDetail }: LandscapeAtlasSectionProps) {
  const { landscape } = config

  return (
    <section className="section recharge-flow" id="landscape" aria-labelledby="landscape-title">
      <header className="recharge-flow__header">
        <span className="eyebrow">{landscape.kicker}</span>
        <h2 id="landscape-title">{landscape.title}</h2>
        <p>{landscape.intro}</p>
      </header>

      <ol className="recharge-flow__steps" aria-label={config.copy.landscapeMarkersLabel}>
        {landscape.markers.map((step, index) => (
          <li className="flow-step" key={step.id}>
            <div className="flow-step__top">
              <span className="flow-step__number">{String(index + 1).padStart(2, '0')}</span>
              <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {stepIcons[index % stepIcons.length]}
              </svg>
            </div>
            <h3>{step.label}</h3>
            <p>{step.text}</p>
            <button type="button" onClick={(event) => onOpenDetail(step.chapterId, event.currentTarget)} aria-label={`查看${step.label}详解`}>
              查看这一步<span aria-hidden="true">↗</span>
            </button>
            <span className="flow-step__connector" aria-hidden="true">→</span>
          </li>
        ))}
      </ol>

      <footer className="recharge-flow__footer">
        <div>
          <strong>{landscape.readyTitle}</strong>
          <p>{landscape.readyText}</p>
        </div>
        <div className="recharge-flow__actions">
          <a className="recharge-flow__prepare" href="#specimen" onClick={navigateToHash}>{landscape.prepareLabel}<span aria-hidden="true">↓</span></a>
          <a className="recharge-flow__start" href={config.hero.rechargeLink.href} target="_blank" rel="noopener noreferrer">{config.hero.rechargeLink.label}<span aria-hidden="true">↗</span></a>
        </div>
      </footer>
    </section>
  )
}
