import type { MouseEvent } from 'react'

export function navigateToHash(event: MouseEvent<HTMLAnchorElement>) {
  if (
    event.defaultPrevented
    || event.button !== 0
    || event.metaKey
    || event.ctrlKey
    || event.shiftKey
    || event.altKey
  ) return

  const hash = event.currentTarget.hash
  const targetId = decodeURIComponent(hash.slice(1))
  const target = targetId ? document.getElementById(targetId) : null
  if (!target) return

  event.preventDefault()
  const url = new URL(window.location.href)
  url.hash = hash
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
  target.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    block: 'start',
  })
}
