import { useEffect, useState } from 'react'
import type { SectionId } from '../types'

const clamp = (value: number) => Math.min(1, Math.max(0, value))

function getScrollProgress() {
  const available = document.documentElement.scrollHeight - window.innerHeight
  return available > 0 ? clamp(window.scrollY / available) : 0
}

function findActiveSection(sections: HTMLElement[], readingLine: number) {
  return sections.find((section) => {
    const rect = section.getBoundingClientRect()
    return rect.top <= readingLine && rect.bottom > readingLine
  }) ?? sections.reduce<HTMLElement | undefined>((nearest, section) => {
    const rect = section.getBoundingClientRect()
    const distance = Math.abs(rect.top - readingLine)
    if (!nearest) return section
    const nearestRect = nearest.getBoundingClientRect()
    return distance < Math.abs(nearestRect.top - readingLine) ? section : nearest
  }, undefined)
}

function updateSectionMotion(sections: HTMLElement[], viewportHeight: number) {
  sections.forEach((section) => {
    const rect = section.getBoundingClientRect()
    const sectionProgress = clamp((viewportHeight - rect.top) / (viewportHeight + rect.height))
    const shift = (0.5 - sectionProgress) * 44
    section.style.setProperty('--section-shift', `${shift.toFixed(2)}px`)
    section.style.setProperty('--section-shift-soft', `${(shift * 0.46).toFixed(2)}px`)

    if (rect.top > viewportHeight * 0.56) section.dataset.motionState = 'entering'
    else if (rect.bottom < viewportHeight * 0.44) section.dataset.motionState = 'leaving'
    else section.dataset.motionState = 'active'
  })
}

function updateActiveRecord(entries: HTMLElement[], viewportHeight: number) {
  const visibleEntries = entries.filter((entry) => {
    const rect = entry.getBoundingClientRect()
    return rect.bottom > viewportHeight * 0.16 && rect.top < viewportHeight * 0.84
  })
  const activeEntry = visibleEntries.sort((a, b) => {
    const aRect = a.getBoundingClientRect()
    const bRect = b.getBoundingClientRect()
    return Math.abs(aRect.top + aRect.height / 2 - viewportHeight * 0.48)
      - Math.abs(bRect.top + bRect.height / 2 - viewportHeight * 0.48)
  })[0]

  entries.forEach((entry) => {
    entry.dataset.recordActive = entry === activeEntry ? 'true' : 'false'
  })
}

export function useScrollFrame(sectionIds: SectionId[], enabled: boolean) {
  const [activeSection, setActiveSection] = useState<SectionId>(sectionIds[0] ?? 'cover')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section))
    const sectionElements = Array.from(document.querySelectorAll<HTMLElement>('.section'))
    const recordEntries = Array.from(document.querySelectorAll<HTMLElement>('.record-entry'))
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0

    const settleReducedMotion = () => {
      document.documentElement.dataset.motion = 'reduced'
      sectionElements.forEach((section) => {
        section.dataset.motionState = 'active'
        section.style.setProperty('--section-shift', '0px')
        section.style.setProperty('--section-shift-soft', '0px')
      })
      recordEntries.forEach((entry, index) => {
        entry.dataset.recordActive = index === 0 ? 'true' : 'false'
      })
    }

    const update = () => {
      frame = 0

      setProgress(getScrollProgress())

      const readingLine = window.innerHeight * 0.42
      const current = findActiveSection(sections, readingLine)
      if (current) setActiveSection(current.id as SectionId)

      if (!enabled || reducedMotion.matches) {
        settleReducedMotion()
        return
      }

      document.documentElement.dataset.motion = 'full'
      const viewportHeight = window.innerHeight
      updateSectionMotion(sectionElements, viewportHeight)
      updateActiveRecord(recordEntries, viewportHeight)
    }

    const schedule = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    reducedMotion.addEventListener('change', schedule)

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      reducedMotion.removeEventListener('change', schedule)
    }
  }, [sectionIds, enabled])

  return { activeSection, progress }
}
