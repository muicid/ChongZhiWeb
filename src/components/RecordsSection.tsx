import type { CSSProperties } from 'react'
import type { SiteConfig } from '../types'
import { SafeImage } from './SafeImage'
import { Seal } from './Seal'

interface RecordsSectionProps {
  config: SiteConfig
  onOpenDetail: (id: string, trigger: HTMLElement) => void
}

export function RecordsSection({ config, onOpenDetail }: RecordsSectionProps) {
  const { records } = config

  return (
    <section className="section records" id="records" aria-labelledby="records-title">
      <header className="records__intro" data-reveal="mask">
        <span className="eyebrow">{records.kicker}</span>
        <h2 id="records-title">{records.title}</h2>
        <p>{records.intro}</p>
        <Seal character={config.brand.sealCharacter} label={`${config.brand.name}采集印`} small />
      </header>

      <div className="records__primary-media" data-reveal="image">
        <SafeImage media={records.primaryImage} fallbackLabel={config.copy.imageUnavailable} />
      </div>

      <ol className="records__list">
        {records.entries.map((entry, index) => (
          <li
            key={entry.id}
            className="record-entry"
            data-reveal="ledger"
            style={{ '--motion-delay': `${index * 70}ms` } as CSSProperties}
          >
            <span className="record-entry__index">{entry.index}</span>
            <div className="record-entry__season">
              <strong>{entry.season}</strong>
              <span>{entry.date}</span>
            </div>
            <div className="record-entry__body">
              <h3>{entry.title}</h3>
              <p>{entry.text}</p>
              <button
                type="button"
                className="editorial-link record-entry__detail-link"
                onClick={(event) => onOpenDetail(entry.id, event.currentTarget)}
              >
                <span>{config.copy.openRecordDetail}</span>
                <i aria-hidden="true">→</i>
              </button>
            </div>
          </li>
        ))}
      </ol>

      <div className="records__detail-media" data-reveal="image">
        <SafeImage media={records.detailImage} fallbackLabel={config.copy.imageUnavailable} />
      </div>

      <div className="records__baseline micro" aria-hidden="true">
        <span>01</span><span>10</span><span>20</span><span>30</span><span>40</span><span>50</span>
      </div>
    </section>
  )
}
