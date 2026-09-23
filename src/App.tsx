import { useEffect } from 'react'
import type { CSSProperties } from 'react'
import { ArchiveChrome } from './components/ArchiveChrome'
import { ChapterIndex } from './components/ChapterIndex'
import { ColophonSection } from './components/ColophonSection'
import { DetailPage } from './components/DetailPage'
import { HeroSection } from './components/HeroSection'
import { LandscapeAtlasSection } from './components/LandscapeAtlasSection'
import { RecordsSection } from './components/RecordsSection'
import { SpecimenSection } from './components/SpecimenSection'
import { WechatContact } from './components/WechatContact'
import { siteConfig } from './config'
import { useDetailRoute } from './hooks/useDetailRoute'
import { useReveal } from './hooks/useReveal'
import { useScrollFrame } from './hooks/useScrollFrame'
import { assertValidConfig } from './lib/validateConfig'

assertValidConfig(siteConfig)

type ThemeStyle = CSSProperties & Record<`--${string}`, string>
const sectionIds = siteConfig.navigation.map((item) => item.id)

function App() {
  const { activeSection, progress } = useScrollFrame(sectionIds, siteConfig.motion.reveals || siteConfig.motion.imageDrift)
  const { route, isClosing, open, close } = useDetailRoute()
  useReveal(siteConfig.motion.reveals)

  const themeStyle: ThemeStyle = {
    '--paper': siteConfig.theme.paper,
    '--paper-deep': siteConfig.theme.paperDeep,
    '--ink': siteConfig.theme.ink,
    '--muted-ink': siteConfig.theme.mutedInk,
    '--rule': siteConfig.theme.rule,
    '--accent': siteConfig.theme.accent,
    '--mineral': siteConfig.theme.mineral,
  }

  useEffect(() => {
    document.documentElement.lang = siteConfig.locale
    document.title = siteConfig.siteTitle
    document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', siteConfig.siteDescription)
    document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', siteConfig.siteTitle)
    document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content', siteConfig.siteDescription)
  }, [])

  return (
    <div
      className="site-shell"
      style={themeStyle}
      data-brand={siteConfig.brand.name}
      data-chapter-count={siteConfig.chapters.length}
      data-section-count={siteConfig.navigation.length}
      data-image-drift={siteConfig.motion.imageDrift}
      data-paper-breath={siteConfig.motion.paperBreath}
      data-reveals={siteConfig.motion.reveals}
      data-scroll-cue={siteConfig.motion.scrollCue ?? true}
    >
      <a className="skip-link" href={route ? '#detail-main' : '#main'}>{siteConfig.copy.skipToContent}</a>
      <div className="paper-field" aria-hidden="true" />
      {!route && <ArchiveChrome config={siteConfig} activeSection={activeSection} progress={progress} />}
      <main id="main" hidden={Boolean(route)}>
        <HeroSection config={siteConfig} />
        <ChapterIndex
          config={siteConfig}
          onOpenDetail={(id, trigger) => open({ kind: 'chapter', id }, trigger)}
        />
        <LandscapeAtlasSection config={siteConfig} onOpenDetail={(id, trigger) => open({ kind: 'chapter', id }, trigger)} />
        <SpecimenSection config={siteConfig} onOpenDetail={(id, trigger) => open({ kind: 'chapter', id }, trigger)} />
        <RecordsSection
          config={siteConfig}
          onOpenDetail={(id, trigger) => open({ kind: 'record', id }, trigger)}
        />
        <ColophonSection config={siteConfig} />
      </main>
      {route && (
        <DetailPage
          key={`${route.kind}-${route.id}`}
          config={siteConfig}
          route={route}
          isClosing={isClosing}
          onClose={close}
          onNavigate={open}
        />
      )}
      <WechatContact />
    </div>
  )
}

export default App
