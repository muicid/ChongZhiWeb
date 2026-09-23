import { useCallback, useEffect, useRef, useState } from 'react'

export type DetailRoute =
  | { kind: 'chapter'; id: string }
  | { kind: 'record'; id: string }

const DETAIL_STATE = 'siteDetail'
const SCROLL_STATE = 'siteScrollY'
const DEPTH_STATE = 'siteDetailDepth'

function readRoute(): DetailRoute | null {
  const params = new URLSearchParams(window.location.search)
  const chapter = params.get('chapter')
  const record = params.get('record')
  if (chapter) return { kind: 'chapter', id: chapter }
  if (record) return { kind: 'record', id: record }
  return null
}

function writeRoute(route: DetailRoute | null) {
  const url = new URL(window.location.href)
  url.searchParams.delete('chapter')
  url.searchParams.delete('record')
  if (route) url.searchParams.set(route.kind, route.id)
  if (route) url.hash = ''
  return `${url.pathname}${url.search}${url.hash}`
}

export function useDetailRoute() {
  const [route, setRoute] = useState<DetailRoute | null>(() => readRoute())
  const [isClosing, setIsClosing] = useState(false)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const closeTimerRef = useRef<number | null>(null)
  const restoreFrameRef = useRef(0)

  const cancelPending = useCallback(() => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
    closeTimerRef.current = null
    window.cancelAnimationFrame(restoreFrameRef.current)
  }, [])

  const restorePage = useCallback((state: unknown) => {
    cancelPending()
    const restoredState = state && typeof state === 'object' ? state as Record<string, unknown> : {}
    const scrollY = typeof restoredState[SCROLL_STATE] === 'number' ? restoredState[SCROLL_STATE] : 0
    const nextRoute = readRoute()
    setRoute(nextRoute)
    setIsClosing(false)
    restoreFrameRef.current = requestAnimationFrame(() => {
      restoreFrameRef.current = requestAnimationFrame(() => {
        window.scrollTo({ top: scrollY, behavior: 'instant' })
        if (!nextRoute) returnFocusRef.current?.focus({ preventScroll: true })
      })
    })
  }, [cancelPending])

  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    const onPopState = (event: PopStateEvent) => restorePage(event.state)
    window.addEventListener('popstate', onPopState)
    return () => {
      window.removeEventListener('popstate', onPopState)
      window.history.scrollRestoration = previousRestoration
      cancelPending()
    }
  }, [cancelPending, restorePage])

  useEffect(() => {
    document.body.classList.toggle('is-detail-open', Boolean(route))
    return () => document.body.classList.remove('is-detail-open')
  }, [route])

  const open = useCallback((next: DetailRoute, trigger?: HTMLElement | null) => {
    cancelPending()
    const currentState = window.history.state && typeof window.history.state === 'object' ? window.history.state : {}
    window.history.replaceState({ ...currentState, [SCROLL_STATE]: window.scrollY }, '', window.location.href)
    if (!route) {
      returnFocusRef.current = trigger ?? null
    }
    const depth = !route ? 1 : typeof currentState[DEPTH_STATE] === 'number' ? currentState[DEPTH_STATE] + 1 : 0
    // Direct links have no home entry to return to: keep their detail navigation in-place.
    if (depth > 0) window.history.pushState({ [DETAIL_STATE]: true, [DEPTH_STATE]: depth }, '', writeRoute(next))
    else window.history.replaceState({}, '', writeRoute(next))
    setIsClosing(false)
    setRoute(next)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [cancelPending, route])

  const closeNow = useCallback(() => {
    const state = window.history.state && typeof window.history.state === 'object' ? window.history.state as Record<string, unknown> : {}
    const depth = state[DEPTH_STATE]
    if (state[DETAIL_STATE] && typeof depth === 'number' && depth > 0) {
      window.history.go(-depth)
      return
    }
    window.history.replaceState({}, '', writeRoute(null))
    restorePage({ [SCROLL_STATE]: 0 })
  }, [restorePage])

  const close = useCallback(() => {
    if (!route || isClosing) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      closeNow()
      return
    }
    setIsClosing(true)
    closeTimerRef.current = window.setTimeout(closeNow, 440)
  }, [closeNow, isClosing, route])

  return { route, isClosing, open, close }
}
