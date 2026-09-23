import { useEffect } from 'react'

export function useReveal(enabled: boolean) {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (!enabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      nodes.forEach((node) => node.dataset.revealed = 'true')
      return
    }

    const clippedNodes = new Set(
      nodes.filter((node) => node.dataset.reveal === 'mask' || node.dataset.reveal === 'image'),
    )
    const targets = Array.from(new Set(nodes.map((node) => (
      clippedNodes.has(node) ? node.closest<HTMLElement>('.section') ?? node : node
    ))))

    const revealTarget = (target: HTMLElement) => {
      if (target.hasAttribute('data-reveal')) target.dataset.revealed = 'true'
      target.querySelectorAll<HTMLElement>('[data-reveal="mask"], [data-reveal="image"]')
        .forEach((node) => node.dataset.revealed = 'true')
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          revealTarget(entry.target as HTMLElement)
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.12 },
    )

    targets.forEach((target) => observer.observe(target))
    return () => observer.disconnect()
  }, [enabled])
}
