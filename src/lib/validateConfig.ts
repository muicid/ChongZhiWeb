import type { MediaAsset, SectionId, SiteConfig } from '../types'

const HEX = /^#[0-9a-f]{6}$/i
const ID = /^[a-z][a-z0-9-]*$/
const REQUIRED_SECTIONS: SectionId[] = ['cover', 'chapters', 'landscape', 'specimen', 'records', 'colophon']

function isMedia(asset: MediaAsset, path: string, problems: string[]) {
  if (!asset.src.startsWith('./media/') && !/^https?:\/\//.test(asset.src)) {
    problems.push(`${path}.src must use ./media/ or an absolute http(s) URL`)
  }
  if (!asset.alt.trim()) problems.push(`${path}.alt must not be empty`)
}

function findDuplicates(values: string[]) {
  return values.filter((value, index) => values.indexOf(value) !== index)
}

function hasEmptyText(values: string[]) {
  return values.some((value) => !value.trim())
}

function isOutsideRange(values: unknown[], min: number, max: number) {
  return values.length < min || values.length > max
}

export function validateConfig(config: SiteConfig): string[] {
  const problems: string[] = []

  if (!/^[a-z]{2,3}(?:-[A-Z]{2})?$/.test(config.locale)) {
    problems.push('locale must be a BCP-47 language tag such as zh-CN')
  }
  if (!config.siteTitle.trim()) problems.push('siteTitle must not be empty')
  if (!config.siteDescription.trim()) problems.push('siteDescription must not be empty')
  if (!config.brand.name.trim() || !config.brand.subtitle.trim()) problems.push('brand name and subtitle must not be empty')
  if (Array.from(config.brand.sealCharacter).length !== 1) problems.push('brand.sealCharacter must contain exactly one character')

  Object.entries(config.theme).forEach(([key, value]) => {
    if (!HEX.test(value)) problems.push(`theme.${key} must be a six-digit hex color`)
  })

  const navIds = config.navigation.map((item) => item.id)
  if (navIds.join('|') !== REQUIRED_SECTIONS.join('|')) {
    problems.push(`navigation must contain ${REQUIRED_SECTIONS.join(', ')} in that order`)
  }
  if (findDuplicates(config.navigation.map((item) => item.label)).length) {
    problems.push('navigation labels must be unique')
  }

  isMedia(config.hero.image, 'hero.image', problems)
  if (!config.hero.title.trim() || !config.hero.statement.trim()) problems.push('hero title and statement must not be empty')

  if (config.chapters.length < 3 || config.chapters.length > 6) {
    problems.push('chapters must contain 3–6 items')
  }
  const chapterIds = config.chapters.map((chapter) => chapter.id)
  if (chapterIds.some((id) => !ID.test(id))) problems.push('chapter ids must be unique kebab-case identifiers')
  if (findDuplicates(chapterIds).length) problems.push('chapter ids must be unique kebab-case identifiers')
  if (findDuplicates(config.chapters.map((chapter) => chapter.index)).length) problems.push('chapter indexes must be unique')
  config.chapters.forEach((chapter, index) => {
    const path = `chapters[${index}]`
    if (![chapter.label, chapter.script, chapter.title, chapter.summary, chapter.coordinates].every((value) => value.trim())) {
      problems.push(`${path} text fields must not be empty`)
    }
    isMedia(chapter.image, `${path}.image`, problems)
    const detail = chapter.detail
    if (![detail.kicker, detail.title, detail.intro, detail.quote, detail.quoteAttribution, detail.footnote].every((value) => value.trim())) {
      problems.push(`${path}.detail text fields must not be empty`)
    }
    if (isOutsideRange(detail.paragraphs, 2, 5) || hasEmptyText(detail.paragraphs)) {
      problems.push(`${path}.detail.paragraphs must contain 2–5 non-empty paragraphs`)
    }
  })

  if (![config.landscape.kicker, config.landscape.title, config.landscape.intro, config.landscape.folio].every((value) => value.trim())) {
    problems.push('landscape text fields must not be empty')
  }
  isMedia(config.landscape.image, 'landscape.image', problems)
  if (isOutsideRange(config.landscape.markers, 2, 4)) {
    problems.push('landscape.markers must contain 2–4 items')
  }
  const markerIds = config.landscape.markers.map((marker) => marker.id)
  if (markerIds.some((id) => !ID.test(id)) || findDuplicates(markerIds).length) {
    problems.push('landscape marker ids must be unique kebab-case identifiers')
  }
  config.landscape.markers.forEach((marker, index) => {
    if (!chapterIds.includes(marker.chapterId)) problems.push(`landscape.markers[${index}].chapterId must reference an existing chapter`)
    if (!marker.label.trim() || !marker.text.trim()) problems.push(`landscape.markers[${index}] text fields must not be empty`)
    if (marker.x < 5 || marker.x > 95 || marker.y < 5 || marker.y > 85) {
      problems.push(`landscape.markers[${index}] coordinates must stay inside the safe image area`)
    }
    if (marker.align !== 'start' && marker.align !== 'end') {
      problems.push(`landscape.markers[${index}].align must be start or end`)
    }
  })
  if (isOutsideRange(config.landscape.axisLabels, 3, 5) || hasEmptyText(config.landscape.axisLabels)) {
    problems.push('landscape.axisLabels must contain 3–5 non-empty labels')
  }

  if (isOutsideRange(config.specimen.notes, 2, 4)) {
    problems.push('specimen.notes must contain 2–4 items')
  }
  const noteIds = config.specimen.notes.map((note) => note.id)
  if (noteIds.some((id) => !ID.test(id)) || findDuplicates(noteIds).length) {
    problems.push('specimen note ids must be unique kebab-case identifiers')
  }
  isMedia(config.specimen.image, 'specimen.image', problems)
  config.specimen.notes.forEach((note, index) => {
    if (!chapterIds.includes(note.chapterId)) problems.push(`specimen.notes[${index}].chapterId must reference an existing chapter`)
    if (hasEmptyText([note.heading, note.text, note.tag, note.actionLabel])) problems.push(`specimen.notes[${index}] text fields must not be empty`)
  })

  if (![config.records.kicker, config.records.title, config.records.intro].every((value) => value.trim())) {
    problems.push('records text fields must not be empty')
  }
  isMedia(config.records.primaryImage, 'records.primaryImage', problems)
  isMedia(config.records.detailImage, 'records.detailImage', problems)
  isMedia(config.records.specimenImage, 'records.specimenImage', problems)
  if (isOutsideRange(config.records.entries, 3, 6)) {
    problems.push('records.entries must contain 3–6 items')
  }
  const recordIds = config.records.entries.map((entry) => entry.id)
  if (recordIds.some((id) => !ID.test(id)) || findDuplicates(recordIds).length) {
    problems.push('record ids must be unique kebab-case identifiers')
  }
  if (findDuplicates(config.records.entries.map((entry) => entry.index)).length) {
    problems.push('record indexes must be unique')
  }
  config.records.entries.forEach((entry, index) => {
    if (![entry.index, entry.season, entry.date, entry.title, entry.text].every((value) => value.trim())) {
      problems.push(`records.entries[${index}] text fields must not be empty`)
    }
    const detailPath = `records.entries[${index}].detail`
    if (![entry.detail.phenology, entry.detail.noteHeading, entry.detail.note].every((value) => value.trim())) {
      problems.push(`${detailPath} text fields must not be empty`)
    }
    if (
      isOutsideRange(entry.detail.findings, 2, 5) ||
      entry.detail.findings.some((finding) => hasEmptyText([finding.label, finding.text]))
    ) {
      problems.push(`${detailPath}.findings must contain 2–5 complete items`)
    }
    if (
      isOutsideRange(entry.detail.facts, 3, 6) ||
      entry.detail.facts.some((fact) => hasEmptyText([fact.label, fact.value]))
    ) {
      problems.push(`${detailPath}.facts must contain 3–6 complete items`)
    }
  })

  Object.entries(config.copy).forEach(([key, value]) => {
    if (!value.trim()) problems.push(`copy.${key} must not be empty`)
  })
  Object.entries(config.motion).forEach(([key, value]) => {
    if (typeof value !== 'boolean') problems.push(`motion.${key} must be boolean`)
  })

  return problems
}

export function assertValidConfig(config: SiteConfig): void {
  const problems = validateConfig(config)
  if (problems.length) {
    throw new Error(`Invalid site configuration:\n- ${problems.join('\n- ')}`)
  }
}
