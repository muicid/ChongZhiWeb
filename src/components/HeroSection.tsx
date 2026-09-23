import type { SiteConfig } from '../types'
import { navigateToHash } from '../lib/navigateToHash'
import { SafeImage } from './SafeImage'
import { Seal } from './Seal'

interface HeroSectionProps {
  config: SiteConfig
}

export function HeroSection({ config }: HeroSectionProps) {
  return (
    <section className="section hero" id="cover" aria-labelledby="hero-title">
      <div className="section-register section-register--top" aria-hidden="true" />
      <div className="hero__edition micro" data-reveal="rise">{config.brand.edition}</div>
      <div className="hero__content">
        <div className="hero__title-card" data-reveal="mask">
          <div className="hero__brand-lockup">
            <img src="./media/chatgpt-mark.svg" alt="" width="56" height="56" />
            <span>PLUS RECHARGE GUIDE<small>ChatGPT 订阅充值教程</small></span>
          </div>
          <h1 id="hero-title"><span className="hero__product">{config.hero.product}</span><span className="hero__title-line">{config.hero.title}<Seal character={config.brand.sealCharacter} label={`${config.brand.name}印`} small /></span></h1>
          <span className="hero__kicker">{config.hero.kicker}</span>
        </div>
        <p className="hero__statement" data-reveal="rise">{config.hero.statement}</p>
        <div className="hero__actions" data-reveal="rise">
          <a className="hero__primary" href="#chapters" onClick={navigateToHash}>{config.hero.scrollLabel}<span aria-hidden="true">↓</span></a>
          <a className="hero__secondary" href={config.hero.rechargeLink.href} target="_blank" rel="noopener noreferrer">{config.hero.rechargeLink.label}<span aria-hidden="true">↗</span></a>
        </div>
        <ul className="hero__benefits" aria-label="服务说明">{config.hero.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul>
      </div>
      <div className="hero__art" aria-hidden="true">
        <SafeImage media={config.hero.image} fallbackLabel={config.copy.imageUnavailable} loading="eager" />
      </div>
      <div className="hero__journey">
        <span className="hero__journey-label">充值路径 <small>STEP BY STEP</small></span>
        <ol>{config.chapters.map((chapter, index) => <li key={chapter.id}><span>{String(index + 1).padStart(2, '0')}</span>{chapter.label}</li>)}</ol>
      </div>
      <a className="hero__scroll" href="#chapters" onClick={navigateToHash}>
        <span>向下查看详细教程</span>
        <i aria-hidden="true" />
      </a>
      <div className="hero__folio micro" aria-hidden="true">{config.copy.archiveFolio}</div>
    </section>
  )
}
