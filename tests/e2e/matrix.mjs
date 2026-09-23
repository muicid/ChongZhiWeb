import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { chromium } from 'playwright-core'

const projectDir = process.cwd()
const port = Number(process.env.QIXIU_PORT ?? 4175)
const baseURL = process.env.QIXIU_BASE ?? `http://127.0.0.1:${port}`
const shotsDir = path.join(projectDir, 'tests/e2e/shots')
mkdirSync(shotsDir, { recursive: true })

const builtHtml = readFileSync(path.join(projectDir, 'dist/index.html'), 'utf8')
const builtCssName = readdirSync(path.join(projectDir, 'dist/assets')).find((name) => name.endsWith('.css'))
const builtCss = readFileSync(path.join(projectDir, 'dist/assets', builtCssName), 'utf8')

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

assert(!builtHtml.includes('rel="preload" href="./fonts/'), 'unused decorative font must not be preloaded')
assert(builtCss.includes('url(../fonts/LXGWWenKaiLite-Regular.woff2)'), 'production CSS must resolve the webfont relative to the emitted stylesheet')
assert(!existsSync(path.join(projectDir, 'dist/fonts/LXGWWenKaiLite-Regular.ttf')), 'the source TTF must stay out of the deployment bundle')

async function waitForServer(url) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {
      // Preview is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error(`Preview did not become ready at ${url}`)
}

function resolveChrome() {
  const isWin = process.platform === 'win32'
  const candidates = [
    process.env.CHROME_BIN,
    chromium.executablePath(),
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    isWin ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : null,
    isWin ? 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe' : null,
    isWin ? `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe` : null,
    isWin ? `${process.env.PROGRAMFILES}/Google/Chrome/Application/chrome.exe` : null,
  ].filter(Boolean)
  return candidates.find((candidate) => existsSync(candidate))
}

const preview = process.env.QIXIU_BASE ? null : spawn(
  process.platform === 'win32' ? 'cmd.exe' : 'npm',
  process.platform === 'win32'
    ? ['/c', 'npm', 'run', 'preview', '--', '--host', '127.0.0.1', '--port', String(port)]
    : ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(port)],
  { cwd: projectDir, stdio: ['ignore', 'pipe', 'pipe'] },
)

try {
  await waitForServer(baseURL)
  const executablePath = resolveChrome()
  if (!executablePath) {
    console.log('SKIP: no Chromium or Chrome executable available')
    process.exitCode = 0
  } else {
    const browser = await chromium.launch({ headless: true, executablePath })
    const consoleProblems = []

    try {
      const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } })
      const fontResponses = []
      desktop.on('console', (message) => {
        if (message.type() === 'error' || message.type() === 'warning') consoleProblems.push(`${message.type()}: ${message.text()}`)
      })
      desktop.on('pageerror', (error) => consoleProblems.push(`pageerror: ${error.message}`))
      desktop.on('response', (response) => {
        if (response.url().includes('LXGWWenKaiLite-Regular.woff2')) fontResponses.push({ status: response.status(), url: response.url() })
      })
      await desktop.goto(baseURL, { waitUntil: 'networkidle' })
      await desktop.waitForFunction(() => document.documentElement.dataset.motion === 'full')

      assert(await desktop.locator('html').getAttribute('lang') === 'zh-CN', 'document language must be zh-CN')
      assert(await desktop.locator('html').getAttribute('data-motion') === 'full', 'desktop must enable the full motion system')
      const shell = desktop.locator('.site-shell')
      const configuredBrand = await shell.getAttribute('data-brand')
      const configuredChapterCount = Number(await shell.getAttribute('data-chapter-count'))
      const configuredSectionCount = Number(await shell.getAttribute('data-section-count'))
      assert(Boolean(configuredBrand) && (await desktop.title()).includes(configuredBrand), 'runtime title must use configured brand')
      await desktop.evaluate(async () => {
        await document.fonts.load('48px "Qixiu WenKai"', '栖岫山水')
        await document.fonts.ready
      })
      const fontFaceRule = await desktop.evaluate(() => Array.from(document.styleSheets)
        .flatMap((sheet) => {
          try {
            return Array.from(sheet.cssRules)
          } catch {
            return [] /* cross-origin sheets (webfont CDN links) are unreadable */
          }
        })
        .find((rule) => rule.cssText.includes('Qixiu WenKai'))?.cssText ?? '')
      assert(fontResponses.some(({ status }) => status >= 200 && status < 300), 'bundled webfont must be fetched successfully over HTTP')
      assert(!fontFaceRule.includes('local(') && fontFaceRule.includes('/fonts/'), 'webfont source must be a same-site URL without local()')
      assert(await desktop.evaluate(() => document.fonts.check('48px "Qixiu WenKai"', '栖岫山水')), 'bundled Chinese webfont must render without a device-local install')
      assert(await desktop.locator('#hero-title').isVisible(), 'hero title must be visible')
      assert(await desktop.locator('.archive-rail').isVisible(), 'desktop archive rail must be visible')
      assert(await desktop.locator('.archive-rail .section-link').count() === configuredSectionCount, 'desktop navigation must match configured section count')
      assert(!(await desktop.locator('.mobile-dock').isVisible()), 'mobile dock must stay hidden on desktop')
      const desktopActiveIndicator = await desktop.locator('.archive-rail .section-link.is-active').evaluate((node) => getComputedStyle(node, '::after').content)
      assert(desktopActiveIndicator === 'none', 'desktop archive rail must not inherit the mobile active underline')
      const desktopOverflow = await desktop.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      assert(desktopOverflow <= 1, `desktop horizontal overflow: ${desktopOverflow}px`)
      await desktop.waitForFunction(() => document.querySelector('.hero__title-card')?.getAttribute('data-revealed') === 'true')
      await desktop.waitForTimeout(1200)
      const desktopMicroSize = await desktop.locator('.hero__edition').evaluate((node) => Number.parseFloat(getComputedStyle(node).fontSize))
      assert(desktopMicroSize >= 11.5, `desktop microcopy must remain readable: ${desktopMicroSize}px`)
      const cueAnimation = await desktop.locator('.hero__scroll i').evaluate((node) => getComputedStyle(node, '::after').animationName)
      assert(cueAnimation === 'scroll-diamond', 'scroll cue animation must run while motion.scrollCue is enabled')
      await desktop.evaluate(() => { document.querySelector('.site-shell').dataset.scrollCue = 'false' })
      const gatedCueAnimation = await desktop.locator('.hero__scroll i').evaluate((node) => getComputedStyle(node, '::after').animationName)
      assert(gatedCueAnimation === 'none', 'scroll cue animation must stop when motion.scrollCue is disabled')
      await desktop.evaluate(() => { document.querySelector('.site-shell').dataset.scrollCue = 'true' })
      await desktop.screenshot({ path: path.join(shotsDir, 'desktop-hero.png'), fullPage: false })

      await desktop.locator('.archive-rail .section-link[href="#chapters"]').click()
      await desktop.waitForFunction(() => location.hash === '#chapters' && Math.abs(document.querySelector('#chapters')?.getBoundingClientRect().top ?? 999) < 2)
      assert(await desktop.evaluate(() => window.scrollY > 0), 'desktop archive navigation must move the document to the selected section')
      assert(await desktop.locator('.archive-rail .section-link[href="#chapters"]').getAttribute('aria-current') === 'location', 'desktop archive navigation must update its active section after scrolling')
      const tabs = desktop.getByRole('tab')
      assert(await tabs.count() === configuredChapterCount, 'rendered chapter count must match configured chapter count')
      const firstPanelText = await desktop.getByRole('tabpanel').textContent()
      await tabs.nth(1).hover()
      assert(await tabs.nth(0).getAttribute('aria-selected') === 'true', 'hovering must not change the selected step')
      await tabs.nth(1).click()
      assert(await tabs.nth(1).getAttribute('aria-selected') === 'true', 'clicked chapter must become active')
      assert((await desktop.getByRole('tabpanel').textContent()) !== firstPanelText, 'chapter panel must update from config')
      await tabs.nth(1).press('ArrowRight')
      assert(await tabs.nth(2).getAttribute('aria-selected') === 'true', 'arrow keys must advance the active chapter tab')
      await tabs.nth(2).press('ArrowLeft')
      assert(await tabs.nth(1).getAttribute('aria-selected') === 'true', 'arrow keys must move the active chapter tab back')
      await desktop.waitForTimeout(1200)
      await desktop.screenshot({ path: path.join(shotsDir, 'desktop-chapters.png'), fullPage: false })

      const chapterDetailTrigger = desktop.getByRole('button', { name: '展开此步' })
      await chapterDetailTrigger.scrollIntoViewIfNeeded()
      const chapterScrollY = await desktop.evaluate(() => window.scrollY)
      await chapterDetailTrigger.click()
      await desktop.waitForURL((url) => Boolean(url.searchParams.get('chapter')))
      assert(await desktop.locator('.detail-main--chapter h1').isVisible(), 'chapter detail must resolve from the active preview tab')
      assert(await desktop.locator('.detail-rail').isVisible(), 'chapter detail must replace the archive rail with a back rail')
      assert(await desktop.evaluate(() => document.fonts.check('16px "Qixiu WenKai"')), 'bundled Chinese display font must load')
      assert(await desktop.locator('.detail-main--chapter').evaluate((node) => document.activeElement === node.querySelector('h1')), 'chapter detail heading must receive focus')
      assert((await desktop.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)) <= 1, 'chapter detail must not overflow horizontally')
      await desktop.waitForTimeout(900)
      await desktop.screenshot({ path: path.join(shotsDir, 'desktop-chapter-detail.png'), fullPage: false })
      const detailMotionName = await desktop.locator('[data-detail-motion]').first().evaluate((node) => getComputedStyle(node).animationName)
      assert(detailMotionName !== 'none', 'detail entrance animation must run while motion.reveals is enabled')
      await desktop.evaluate(() => { document.querySelector('.site-shell').dataset.reveals = 'false' })
      const gatedDetailMotion = await desktop.locator('[data-detail-motion]').first().evaluate((node) => getComputedStyle(node).animationName)
      assert(gatedDetailMotion === 'none', 'detail entrance animation must flatten when motion.reveals is disabled')
      const gatedDetailOpacity = await desktop.locator('.detail-main--chapter h1').evaluate((node) => getComputedStyle(node).opacity)
      assert(gatedDetailOpacity === '1', 'detail content must stay visible when motion.reveals is disabled')
      await desktop.evaluate(() => { document.querySelector('.site-shell').dataset.reveals = 'true' })
      await desktop.keyboard.press('Escape')
      await desktop.waitForURL((url) => !url.searchParams.has('chapter'))
      await desktop.waitForTimeout(80)
      assert(Math.abs((await desktop.evaluate(() => window.scrollY)) - chapterScrollY) < 4, 'closing chapter detail must restore the previous scroll position')
      assert(await chapterDetailTrigger.evaluate((node) => document.activeElement === node), 'Escape must restore focus to the chapter detail trigger')

      // Closing a sequence returns to the originating overview, while browser Back
      // still visits earlier details and preserves their own reading positions.
      await chapterDetailTrigger.click()
      await desktop.waitForURL((url) => url.searchParams.get('chapter') === 'submit-session')
      await desktop.locator('.detail-pager button').click()
      await desktop.waitForURL((url) => url.searchParams.get('chapter') === 'confirm-result')
      await desktop.locator('.detail-pager button').click()
      await desktop.waitForURL((url) => url.searchParams.get('chapter') === 'check-arrival')
      assert((await desktop.locator('.detail-pager button').textContent()).includes('完成阅读'), 'the final step must finish rather than loop')
      await desktop.goBack()
      await desktop.waitForURL((url) => url.searchParams.get('chapter') === 'confirm-result')
      await desktop.goForward()
      await desktop.waitForURL((url) => url.searchParams.get('chapter') === 'check-arrival')
      await desktop.locator('.detail-pager button').click()
      await desktop.waitForURL((url) => !url.searchParams.has('chapter'))
      await desktop.waitForFunction((expected) => Math.abs(window.scrollY - expected) < 4, chapterScrollY)
      assert(await chapterDetailTrigger.evaluate((node) => document.activeElement === node), 'closing a sequence must restore the original trigger focus')

      await desktop.goForward()
      await desktop.waitForURL((url) => url.searchParams.get('chapter') === 'submit-session')
      await desktop.keyboard.press('Escape')
      await desktop.goBack()
      await desktop.waitForURL((url) => !url.searchParams.has('chapter'))
      await desktop.waitForTimeout(550)
      assert(!new URL(desktop.url()).searchParams.has('chapter'), 'browser Back during closing must cancel the pending close timer')

      await desktop.locator('#landscape').scrollIntoViewIfNeeded()
      assert(await desktop.locator('#landscape-title').isVisible(), 'landscape atlas must be reachable')
      assert(await desktop.locator('.flow-step').count() === 4, 'flow overview must expose all four steps')
      await desktop.waitForTimeout(1100)
      await desktop.screenshot({ path: path.join(shotsDir, 'desktop-landscape.png'), fullPage: false })
      const flowTrigger = desktop.getByRole('button', { name: '查看等待完成详解' })
      await flowTrigger.click()
      await desktop.waitForURL((url) => url.searchParams.get('chapter') === 'confirm-result')
      await desktop.keyboard.press('Escape')
      await desktop.waitForURL((url) => !url.searchParams.has('chapter'))
      await desktop.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === '查看等待完成详解')

      await desktop.locator('#specimen').scrollIntoViewIfNeeded()
      assert(await desktop.locator('#specimen h2').isVisible(), 'specimen section must be reachable')
      assert(await desktop.locator('.material-card').count() === 2, 'preparation must show both required materials')
      await desktop.screenshot({ path: path.join(shotsDir, 'desktop-specimen.png'), fullPage: false })
      await desktop.getByRole('button', { name: '查看 Session 获取方法' }).click()
      await desktop.waitForURL((url) => url.searchParams.get('chapter') === 'submit-session')
      await desktop.keyboard.press('Escape')
      await desktop.waitForURL((url) => !url.searchParams.has('chapter'))
      await desktop.waitForFunction(() => document.activeElement?.textContent.includes('查看 Session 获取方法'))

      await desktop.locator('#records').scrollIntoViewIfNeeded()
      assert(await desktop.locator('#records-title').isVisible(), 'records section must be reachable')
      const renderedRecordCount = await desktop.locator('.record-entry').count()
      assert(renderedRecordCount >= 3 && renderedRecordCount <= 6, 'records section must stay within its supported range')
      await desktop.waitForFunction(() => document.querySelector('.record-entry')?.getAttribute('data-revealed') === 'true')
      await desktop.waitForTimeout(1100)
      const desktopRecordBodySize = await desktop.locator('.record-entry__body p').first().evaluate((node) => Number.parseFloat(getComputedStyle(node).fontSize))
      assert(desktopRecordBodySize >= 14, `desktop record copy must remain readable: ${desktopRecordBodySize}px`)
      assert(await desktop.locator('.record-entry[data-record-active="true"]').count() === 1, 'scroll motion must activate exactly one visible record')
      assert(await desktop.locator('.archive-rail .section-link[href="#records"]').getAttribute('aria-current') === 'location', 'archive rail must follow the records section')
      const recordsMediaOverlap = await desktop.evaluate(() => {
        const media = document.querySelector('.records__detail-media').getBoundingClientRect()
        let area = 0
        document.querySelectorAll('.record-entry h3, .record-entry p, .record-entry__detail-link').forEach((node) => {
          const text = node.getBoundingClientRect()
          const ix = Math.max(0, Math.min(text.right, media.right) - Math.max(text.left, media.left))
          const iy = Math.max(0, Math.min(text.bottom, media.bottom) - Math.max(text.top, media.top))
          area += ix * iy
        })
        return Math.round(area)
      })
      assert(recordsMediaOverlap === 0, `records detail media must not cover entry text: ${recordsMediaOverlap}px^2`)
      await desktop.screenshot({ path: path.join(shotsDir, 'desktop-records.png'), fullPage: false })

      await desktop.locator('.record-entry__detail-link').first().click()
      await desktop.waitForURL((url) => Boolean(url.searchParams.get('record')))
      assert(await desktop.locator('.detail-main--record h1').isVisible(), 'record detail must resolve from the selected seasonal entry')
      assert(await desktop.locator('.record-detail__ledger dt').count() >= 3, 'record detail must expose a readable facts ledger')
      assert(await desktop.locator('.record-detail__specimen img').getAttribute('src') === '/media/ink-token.webp', 'record detail must use the transparent local specimen asset')
      assert((await desktop.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)) <= 1, 'record detail must not overflow horizontally')
      await desktop.waitForTimeout(900)
      await desktop.screenshot({ path: path.join(shotsDir, 'desktop-record-detail.png'), fullPage: false })
      await desktop.goBack()
      await desktop.waitForURL((url) => !url.searchParams.has('record'))
      assert(await desktop.locator('#records-title').isVisible(), 'browser back must return from record detail to the records section')

      await desktop.locator('#colophon').scrollIntoViewIfNeeded()
      assert(await desktop.locator('#colophon-title').isVisible(), 'colophon section must be reachable')
      await desktop.waitForFunction(() => document.querySelector('.colophon__body')?.getAttribute('data-revealed') === 'true')
      await desktop.waitForTimeout(1000)
      await desktop.screenshot({ path: path.join(shotsDir, 'desktop-colophon.png'), fullPage: false })
      await desktop.locator('.colophon__return').click()
      await desktop.waitForFunction(() => location.hash === '#cover' && window.scrollY < 2)
      await desktop.close()

      const laptop = await browser.newPage({ viewport: { width: 1280, height: 720 } })
      laptop.on('console', (message) => {
        if (message.type() === 'error' || message.type() === 'warning') consoleProblems.push(`laptop ${message.type()}: ${message.text()}`)
      })
      laptop.on('pageerror', (error) => consoleProblems.push(`laptop pageerror: ${error.message}`))
      await laptop.goto(baseURL, { waitUntil: 'networkidle' })
      await laptop.waitForFunction(() => document.documentElement.dataset.motion === 'full')
      assert(await laptop.locator('.archive-rail').isVisible(), 'small laptop must keep the desktop archive rail')
      assert(!(await laptop.locator('.mobile-dock').isVisible()), 'small laptop must not show the mobile dock')
      assert((await laptop.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)) <= 1, 'small laptop must not overflow horizontally')
      await laptop.locator('#records').scrollIntoViewIfNeeded()
      await laptop.waitForTimeout(900)
      const laptopMediaOverlap = await laptop.evaluate(() => {
        const media = document.querySelector('.records__detail-media').getBoundingClientRect()
        let area = 0
        document.querySelectorAll('.record-entry h3, .record-entry p, .record-entry__detail-link').forEach((node) => {
          const text = node.getBoundingClientRect()
          const ix = Math.max(0, Math.min(text.right, media.right) - Math.max(text.left, media.left))
          const iy = Math.max(0, Math.min(text.bottom, media.bottom) - Math.max(text.top, media.top))
          area += ix * iy
        })
        return Math.round(area)
      })
      assert(laptopMediaOverlap === 0, `small laptop records detail media must not cover entry text: ${laptopMediaOverlap}px^2`)
      const laptopMicroSize = await laptop.locator('.hero__edition').evaluate((node) => Number.parseFloat(getComputedStyle(node).fontSize))
      assert(laptopMicroSize >= 11.5, `small laptop microcopy must remain readable: ${laptopMicroSize}px`)
      await laptop.close()

      const unknown = await browser.newPage({ viewport: { width: 1440, height: 900 } })
      unknown.on('console', (message) => {
        if (message.type() === 'error' || message.type() === 'warning') consoleProblems.push(`unknown-route ${message.type()}: ${message.text()}`)
      })
      unknown.on('pageerror', (error) => consoleProblems.push(`unknown-route pageerror: ${error.message}`))
      await unknown.goto(`${baseURL}/?chapter=no-such-chapter`, { waitUntil: 'networkidle' })
      assert(await unknown.locator('.detail-missing__note').isVisible(), 'unknown chapter route must show a readable fallback')
      assert((await unknown.locator('.detail-missing__note').textContent()).trim().length > 0, 'unknown route fallback must carry a readable message')
      await unknown.locator('.detail-missing__back').click()
      await unknown.waitForURL((url) => !url.searchParams.has('chapter'), { timeout: 4000 })
      assert(await unknown.locator('#hero-title').isVisible(), 'leaving the unknown-route fallback must return to the scroll narrative')
      await unknown.close()

      const direct = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
      await direct.goto(`${baseURL}/?chapter=confirm-result`, { waitUntil: 'networkidle' })
      await direct.locator('.detail-pager button').click()
      await direct.waitForURL((url) => url.searchParams.get('chapter') === 'check-arrival')
      await direct.reload()
      await direct.locator('.detail-pager button').click()
      await direct.waitForURL((url) => !url.searchParams.has('chapter'))
      assert(await direct.locator('#hero-title').isVisible(), 'closing a directly opened sequence after reload must stay on the site')
      await direct.close()

      const broken = await browser.newPage({ viewport: { width: 1440, height: 900 } })
      await broken.route('**/media/ink-panorama.webp', (route) => route.abort())
      await broken.goto(baseURL, { waitUntil: 'networkidle' })
      await broken.waitForTimeout(900)
      assert((await broken.locator('.safe-image__fallback').count()) >= 1, 'broken media must render the readable image fallback')
      assert((await broken.locator('.safe-image__fallback small').first().textContent()).trim().length > 0, 'image fallback must carry the configured label')
      await broken.close()

      const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
      mobile.on('console', (message) => {
        if (message.type() === 'error' || message.type() === 'warning') consoleProblems.push(`${message.type()}: ${message.text()}`)
      })
      mobile.on('pageerror', (error) => consoleProblems.push(`pageerror: ${error.message}`))
      await mobile.goto(baseURL, { waitUntil: 'networkidle' })
      await mobile.waitForFunction(() => document.documentElement.dataset.motion === 'reduced')
      assert(await mobile.locator('html').getAttribute('data-motion') === 'reduced', 'reduced-motion preference must disable scroll choreography')
      assert(await mobile.locator('.mobile-header').isVisible(), 'mobile archive header must be visible')
      assert(await mobile.locator('.mobile-dock').isVisible(), 'mobile chapter dock must replace desktop rail')
      assert(!(await mobile.locator('.archive-rail').isVisible()), 'desktop rail must be hidden on mobile')
      assert(await mobile.locator('.mobile-dock .section-link').count() === configuredSectionCount, 'mobile navigation must match configured section count')
      const mobileActiveIndicator = await mobile.locator('.mobile-dock .section-link.is-active').evaluate((node) => getComputedStyle(node, '::after').content)
      assert(mobileActiveIndicator !== 'none', 'mobile navigation must retain its active underline')
      const mobileOverflow = await mobile.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      assert(mobileOverflow <= 1, `mobile horizontal overflow: ${mobileOverflow}px`)
      assert(await mobile.locator('.wechat-contact').evaluate((node) => getComputedStyle(node).position === 'relative'), 'mobile contact card must stay in document flow without covering the guide')
      const revealOpacity = await mobile.locator('.hero__title-card').evaluate((node) => getComputedStyle(node).opacity)
      assert(revealOpacity === '1', 'reduced motion must reveal primary content immediately')
      const mobileStatementHalo = await mobile.locator('.hero__statement').evaluate((node) => getComputedStyle(node).textShadow)
      assert(mobileStatementHalo !== 'none', 'mobile hero statement must keep a paper halo over the artwork')
      const mobileArtWash = await mobile.locator('.hero__art').evaluate((node) => getComputedStyle(node, '::after').opacity)
      assert(Number.parseFloat(mobileArtWash) >= 0.9, `mobile hero artwork wash must protect statement contrast: ${mobileArtWash}`)
      await mobile.screenshot({ path: path.join(shotsDir, 'mobile-hero.png'), fullPage: false })
      await mobile.locator('.mobile-dock .section-link[href="#chapters"]').click()
      await mobile.waitForFunction(() => location.hash === '#chapters' && window.scrollY > 0 && (document.querySelector('#chapters')?.getBoundingClientRect().top ?? 999) <= 65)
      assert(await mobile.locator('.chapters__content').evaluate((node) => node.getBoundingClientRect().bottom <= document.querySelector('.chapters__image').getBoundingClientRect().top + 1), 'mobile step selection and instructions must precede the illustration')
      await mobile.getByRole('tab').first().press('End')
      assert(await mobile.getByRole('tab').last().getAttribute('aria-selected') === 'true', 'End must select the final step')
      await mobile.getByRole('tab').last().press('Home')
      assert(await mobile.getByRole('tab').first().getAttribute('aria-selected') === 'true', 'Home must select the first step')
      await mobile.screenshot({ path: path.join(shotsDir, 'mobile-chapters.png'), fullPage: false })
      await mobile.getByRole('button', { name: '展开此步' }).click()
      await mobile.waitForURL((url) => Boolean(url.searchParams.get('chapter')))
      assert(await mobile.locator('.detail-close-mobile').isVisible(), 'mobile chapter detail must expose a fixed back control')
      assert((await mobile.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)) <= 1, 'mobile chapter detail must not overflow horizontally')
      await mobile.screenshot({ path: path.join(shotsDir, 'mobile-chapter-detail.png'), fullPage: false })
      await mobile.locator('.detail-close-mobile').click()
      await mobile.waitForURL((url) => !url.searchParams.has('chapter'))
      await mobile.locator('#landscape').scrollIntoViewIfNeeded()
      await mobile.waitForTimeout(250)
      await mobile.screenshot({ path: path.join(shotsDir, 'mobile-landscape.png'), fullPage: false })
      await mobile.locator('#records').scrollIntoViewIfNeeded()
      await mobile.waitForTimeout(250)
      const mobileRecordBodySize = await mobile.locator('.record-entry__body p').first().evaluate((node) => Number.parseFloat(getComputedStyle(node).fontSize))
      assert(mobileRecordBodySize >= 15, `mobile record copy must remain readable: ${mobileRecordBodySize}px`)
      const mobileDateLines = await mobile.locator('.record-entry__season span').first().evaluate((node) => {
        const cs = getComputedStyle(node)
        return node.getBoundingClientRect().height / Number.parseFloat(cs.lineHeight)
      })
      assert(mobileDateLines <= 1.3, `mobile record dates must stay on one line: ${mobileDateLines}`)
      await mobile.screenshot({ path: path.join(shotsDir, 'mobile-records.png'), fullPage: false })
      await mobile.locator('.record-entry__detail-link').first().click()
      await mobile.waitForURL((url) => Boolean(url.searchParams.get('record')))
      const mobileLedgerSize = await mobile.locator('.record-detail__note p').evaluate((node) => Number.parseFloat(getComputedStyle(node).fontSize))
      assert(mobileLedgerSize >= 15, `mobile record detail copy must remain readable: ${mobileLedgerSize}px`)
      const seasonDateLines = await mobile.locator('.record-detail__season-index small').first().evaluate((node) => {
        const cs = getComputedStyle(node)
        return node.getBoundingClientRect().height / Number.parseFloat(cs.lineHeight)
      })
      assert(seasonDateLines <= 1.3, `record detail season dates must stay on one line: ${seasonDateLines}`)
      assert((await mobile.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)) <= 1, 'mobile record detail must not overflow horizontally')
      await mobile.screenshot({ path: path.join(shotsDir, 'mobile-record-detail.png'), fullPage: false })
      await mobile.keyboard.press('Escape')
      await mobile.waitForURL((url) => !url.searchParams.has('record'))
      await mobile.goto(`${baseURL}/?record=no-such-record`, { waitUntil: 'networkidle' })
      assert(await mobile.locator('.detail-missing__note').isVisible(), 'unknown record route must show a readable fallback on mobile')
      assert(await mobile.locator('.detail-close-mobile').isVisible(), 'mobile unknown-route fallback must keep the fixed back control')
      await mobile.locator('.detail-close-mobile').click()
      await mobile.waitForURL((url) => !url.searchParams.has('record'))
      await mobile.close()

      // Verify text containment, ordering and link reachability, including zoom-sized layouts.
      const flowPage = await browser.newPage({ reducedMotion: 'reduce' })
      for (const width of [1920, 1440, 1024, 900, 768, 390, 320]) {
        await flowPage.setViewportSize({ width, height: 900 })
        await flowPage.goto(`${baseURL}/#landscape`, { waitUntil: 'networkidle' })
        const layout = await flowPage.locator('#landscape').evaluate((section) => {
          const cards = Array.from(section.querySelectorAll('.flow-step'))
          const sectionBox = section.getBoundingClientRect()
          return {
            horizontalTitle: getComputedStyle(section.querySelector('h2')).writingMode === 'horizontal-tb',
            contained: cards.every((card) => {
              const box = card.getBoundingClientRect()
              return box.left >= sectionBox.left && box.right <= sectionBox.right + 1
                && Array.from(card.querySelectorAll('h3, p, button')).every((child) => {
                  const text = child.getBoundingClientRect()
                  return text.left >= box.left && text.right <= box.right + 1 && text.bottom <= box.bottom + 1
                })
            }),
            singleColumn: cards.every((card) => Math.abs(card.getBoundingClientRect().left - cards[0].getBoundingClientRect().left) < 1),
          }
        })
        assert(layout.horizontalTitle && layout.contained, `flow title and cards must stay readable and contained at ${width}px`)
        if (width <= 600) assert(layout.singleColumn, 'phone flow must use a vertical sequence')
        assert(await flowPage.locator('.flow-step p').first().isVisible(), 'phone flow descriptions must not be hidden')
        if (width === 1440 || width === 390) {
          await flowPage.locator('#landscape').screenshot({
            path: path.join(shotsDir, `flow-redesign-${width}.png`),
            // Section captures extend beyond the viewport; omit fixed chrome only
            // in the screenshot so it isn't composited over the middle of the image.
            style: '.mobile-header, .mobile-dock, .archive-rail, .wechat-contact, .skip-link { visibility: hidden !important; }',
          })
        }
        await flowPage.locator('#specimen').scrollIntoViewIfNeeded()
        const preparationFits = await flowPage.locator('#specimen').evaluate((section) => {
          const bounds = section.getBoundingClientRect()
          return Array.from(section.querySelectorAll('.material-card, .preparation__checklist')).every((card) => {
            const box = card.getBoundingClientRect()
            return box.left >= bounds.left && box.right <= bounds.right + 1
              && card.scrollWidth <= card.clientWidth + 1
          })
        })
        assert(preparationFits, `preparation materials and checklist must fit at ${width}px`)
        assert(await flowPage.locator('.preparation__checklist li').count() === 3, 'preparation must display three account checks')
        if (width === 1440 || width === 390) {
          await flowPage.locator('#specimen').screenshot({
            path: path.join(shotsDir, `preparation-redesign-${width}.png`),
            style: '.mobile-header, .mobile-dock, .archive-rail, .wechat-contact, .skip-link { visibility: hidden !important; }',
          })
        }
      }
      await flowPage.close()

      assert(consoleProblems.length === 0, `browser console problems:\n${consoleProblems.join('\n')}`)
      console.log('PASS: desktop + mobile + reduced-motion + detail-route matrix')
    } finally {
      await browser.close()
    }
  }
} finally {
  if (preview) {
    if (process.platform === 'win32') {
      try {
        spawn('taskkill', ['/pid', String(preview.pid), '/T', '/F'])
      } catch {
        preview.kill('SIGTERM')
      }
    } else {
      preview.kill('SIGTERM')
    }
  }
}
