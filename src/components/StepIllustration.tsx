import type { MediaAsset } from '../types'

/** Inline SVG keeps the link hotspot aligned with the artwork at every size. */
export function StepIllustration({ media }: { media: MediaAsset }) {
  return (
    <svg className="step-illustration" viewBox="0 0 560 620" role="group" aria-label={media.alt}>
      <image href={media.src} width="560" height="620" aria-hidden="true" />
      {media.link && (
        <a href={media.link.href} target="_blank" rel="noopener noreferrer" aria-label={media.link.label}>
          <title>{media.link.label}</title>
          {media.link.region === 'button' ? (
            <>
              <rect className="step-illustration__link" x="60" y="365" width="440" height="55" rx="5" />
              <text x="468" y="400" fill="#fffaf2" fontSize="20" aria-hidden="true" pointerEvents="none">↗</text>
            </>
          ) : (
            <>
              <rect className="step-illustration__link" x="48" y="169" width="464" height="40" rx="4" />
              <path d={media.link.href.endsWith('/session') ? 'M54 200H328' : 'M54 200H145'} stroke="#254c40" strokeWidth="1" pointerEvents="none" />
              <text x="484" y="195" fill="#254c40" fontSize="20" aria-hidden="true" pointerEvents="none">↗</text>
            </>
          )}
        </a>
      )}
    </svg>
  )
}
