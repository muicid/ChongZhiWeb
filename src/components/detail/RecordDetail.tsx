import { useEffect, useRef } from 'react'
import { SafeImage } from '../SafeImage'
import { Seal } from '../Seal'
import type { DetailContentProps } from './DetailTypes'

export function RecordDetail({ config, route, onClose, onNavigate }: DetailContentProps) {
  const recordIndex = config.records.entries.findIndex((record) => record.id === route.id)
  const record = config.records.entries[recordIndex]
  const next = config.records.entries[(recordIndex + 1) % config.records.entries.length]
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => titleRef.current?.focus({ preventScroll: true }), [record?.id])
  if (!record || !next) return null

  return (
    <main className="detail-main detail-main--record" id="detail-main">
      <article className="record-detail__article">
        <header className="record-detail__header" data-detail-motion="mask">
          <div>
            <h1 ref={titleRef} tabIndex={-1}>{record.title}</h1>
            <p><strong>{record.season}</strong><span>·</span>{record.date}</p>
            <p className="record-detail__phenology">{record.detail.phenology}</p>
          </div>
          <div className="record-detail__folio">
            <span>{config.copy.recordFolioLabel} {String(recordIndex + 1).padStart(3, '0')}</span>
            <Seal character={record.index} label={`${record.season}季采集印`} small />
          </div>
        </header>

        <div
          className="record-detail__season-index"
          aria-label={config.copy.seasonalIndexLabel}
          data-detail-motion="draw"
        >
          {config.records.entries.map((entry) => (
            <span key={entry.id} className={entry.id === record.id ? 'is-active' : ''}>
              <strong>{entry.season}</strong>
              <small>{entry.date}</small>
            </span>
          ))}
        </div>

        <div className="record-detail__landscape" data-detail-motion="image">
          <SafeImage media={config.records.primaryImage} fallbackLabel={config.copy.imageUnavailable} loading="eager" />
          <span>{record.title}</span>
        </div>

        <section className="record-detail__ledger" data-detail-motion="stagger" aria-labelledby="record-note-title">
          <div className="record-detail__note">
            <h2 id="record-note-title">{record.detail.noteHeading}</h2>
            <p>{record.detail.note}</p>
          </div>
          <div className="record-detail__findings">
            <h2>{config.copy.findingsTitle}</h2>
            {record.detail.findings.map((finding) => (
              <p key={finding.label}><strong>{finding.label}</strong><span>{finding.text}</span></p>
            ))}
          </div>
          <dl>
            {record.detail.facts.map((fact) => (
              <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>
            ))}
          </dl>
        </section>

        <div className="record-detail__specimen" data-detail-motion="specimen">
          <SafeImage media={config.records.specimenImage} fallbackLabel={config.copy.imageUnavailable} loading="eager" />
          <span className="record-detail__annotation record-detail__annotation--top">花苞饱满<br />含苞待放</span>
          <span className="record-detail__annotation record-detail__annotation--bottom">嫩叶初展<br />色有微红</span>
        </div>

        <div className="record-detail__vessel" data-detail-motion="image" aria-hidden="true">
          <img src={config.records.detailImage.src} alt="" style={{ objectPosition: config.records.detailImage.position }} />
        </div>

        <button
          type="button"
          className="record-detail__next"
          onClick={(event) => onNavigate({ kind: 'record', id: next.id }, event.currentTarget)}
        >
          <small>{config.copy.nextRecord}</small>
          <strong>{next.title}</strong>
          <span aria-hidden="true">→</span>
        </button>
      </article>

      <button type="button" className="detail-close-mobile" onClick={onClose}>
        {config.copy.recordDetailBack}
      </button>
    </main>
  )
}
