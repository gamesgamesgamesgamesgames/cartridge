'use client'

// Module imports
import { useEffect } from 'react'

// Local imports
import { readClickSource } from '@/helpers/analytics/attribution'
import { flush, track } from '@/helpers/analytics/client'
import { type ReferrerType } from '@/helpers/analytics/constants'

type Props = {
	gameUri: string
	gameSlug: string
}

const GAME_TABS = ['reviews', 'media', 'meta'] as const

/** Best-effort current sub-tab from the URL, defaulting to 'overview'. */
function currentTab(): string {
	const segments = window.location.pathname.split('/').filter(Boolean)
	const last = segments.at(-1) ?? ''
	return (GAME_TABS as readonly string[]).includes(last) ? last : 'overview'
}

/**
 * Records a game-page view (with traffic attribution) and, on the way out,
 * accumulated dwell time, max scroll depth, and the tab in view. Mounted in the
 * game layout so it persists across the game's sub-tabs. Renders nothing.
 */
export function GameAnalytics({ gameUri, gameSlug }: Props) {
	useEffect(() => {
		// --- Pageview + attribution (once per game) -------------------------
		const source = readClickSource(gameSlug)
		let referrerType: ReferrerType = 'direct'
		let referrerFeed: string | undefined
		let referrerQuery: string | undefined
		let referrerDomain: string | undefined

		if (source) {
			referrerType = source.surface === 'search' ? 'search' : 'feed'
			referrerFeed = source.feedName
			referrerQuery = source.query
		} else if (document.referrer) {
			try {
				const url = new URL(document.referrer)
				if (url.origin === window.location.origin) {
					referrerType = 'direct'
				} else {
					referrerType = 'external'
					referrerDomain = url.hostname
				}
			} catch {
				referrerType = 'direct'
			}
		}

		track({
			type: 'pageview',
			gameUri,
			gameSlug,
			referrerType,
			referrerFeed,
			referrerQuery,
			referrerDomain,
		})

		// --- Dwell / scroll -------------------------------------------------
		let visibleMs = 0
		let lastStart: number | null =
			document.visibilityState === 'visible' ? Date.now() : null
		let maxScroll = 0
		let finalized = false

		function onScroll() {
			const doc = document.documentElement
			const scrollable = doc.scrollHeight - doc.clientHeight
			const pct =
				scrollable > 0
					? Math.min(100, Math.round((doc.scrollTop / scrollable) * 100))
					: 0
			if (pct > maxScroll) maxScroll = pct
		}

		function onVisibility() {
			if (document.visibilityState === 'visible') {
				lastStart = Date.now()
			} else if (lastStart !== null) {
				visibleMs += Date.now() - lastStart
				lastStart = null
			}
		}

		function finalize() {
			if (finalized) return
			finalized = true
			if (lastStart !== null) {
				visibleMs += Date.now() - lastStart
				lastStart = null
			}
			track({
				type: 'dwell',
				gameUri,
				gameSlug,
				dwellMs: Math.round(visibleMs),
				scrollPct: maxScroll,
				tab: currentTab(),
			})
			flush()
		}

		window.addEventListener('scroll', onScroll, { passive: true })
		document.addEventListener('visibilitychange', onVisibility)
		window.addEventListener('pagehide', finalize)

		return () => {
			window.removeEventListener('scroll', onScroll)
			document.removeEventListener('visibilitychange', onVisibility)
			window.removeEventListener('pagehide', finalize)
			// Client-side navigation away from the game: finalize dwell now.
			finalize()
		}
	}, [gameUri, gameSlug])

	return null
}
