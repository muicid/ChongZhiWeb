import { describe, expect, it } from 'vitest'
import { siteConfig } from '../src/config'
import { validateConfig } from '../src/lib/validateConfig'
import type { SiteConfig } from '../src/types'

function cloneConfig(): SiteConfig {
  return structuredClone(siteConfig)
}

describe('validateConfig', () => {
  it('accepts the shipped Chinese sample', () => {
    expect(validateConfig(siteConfig)).toEqual([])
  })

  it('rejects duplicate chapter identifiers', () => {
    const config = cloneConfig()
    config.chapters[1]!.id = config.chapters[0]!.id
    expect(validateConfig(config)).toContain('chapter ids must be unique kebab-case identifiers')
  })

  it('rejects a chapter collection outside the supported range', () => {
    const config = cloneConfig()
    config.chapters = config.chapters.slice(0, 2)
    expect(validateConfig(config)).toContain('chapters must contain 3–6 items')
  })

  it('rejects an incomplete chapter detail page', () => {
    const config = cloneConfig()
    config.chapters[0]!.detail.paragraphs = ['only one paragraph']
    expect(validateConfig(config)).toContain('chapters[0].detail.paragraphs must contain 2–5 non-empty paragraphs')
  })

  it('rejects an unsafe media path and missing alt text', () => {
    const config = cloneConfig()
    config.hero.image = { src: '../private/source.png', alt: '' }
    expect(validateConfig(config)).toEqual(expect.arrayContaining([
      'hero.image.src must use /media/ or an absolute http(s) URL',
      'hero.image.alt must not be empty',
    ]))
  })

  it('rejects incomplete interface copy', () => {
    const config = cloneConfig()
    config.copy.returnToTop = ' '
    expect(validateConfig(config)).toContain('copy.returnToTop must not be empty')
  })

  it('rejects landscape markers outside the safe image area', () => {
    const config = cloneConfig()
    config.landscape.markers[0]!.x = 99
    expect(validateConfig(config)).toContain('landscape.markers[0] coordinates must stay inside the safe image area')
  })

  it('rejects a record collection outside the supported range', () => {
    const config = cloneConfig()
    config.records.entries = config.records.entries.slice(0, 2)
    expect(validateConfig(config)).toContain('records.entries must contain 3–6 items')
  })

  it('rejects an incomplete record detail ledger', () => {
    const config = cloneConfig()
    config.records.entries[0]!.detail.facts = []
    expect(validateConfig(config)).toContain('records.entries[0].detail.facts must contain 3–6 complete items')
  })

  it('accepts a missing motion.scrollCue but rejects a non-boolean one', () => {
    const config = cloneConfig()
    delete config.motion.scrollCue
    expect(validateConfig(config)).toEqual([])
    config.motion.scrollCue = 'yes' as unknown as boolean
    expect(validateConfig(config)).toContain('motion.scrollCue must be boolean')
  })
})
