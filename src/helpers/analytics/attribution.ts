/**
 * Click → pageview attribution.
 *
 * When a user clicks a game card in a feed or search, we stash where the click
 * came from keyed by the destination slug. When the game page loads it reads
 * (and clears) that stash to attribute the visit to the right surface/feed/
 * query. Stored in sessionStorage — ephemeral, per-tab, no cookie.
 */

import {
	ATTRIBUTION_STASH_PREFIX,
	type Surface,
} from '@/helpers/analytics/constants'

export type ClickSource = {
	surface: Surface
	feedName?: string
	query?: string
	position?: number
}

type StashedSource = ClickSource & { t: number }

/** Attribution is only trusted for a short window after the click. */
const MAX_AGE_MS = 10 * 60 * 1_000

export function stashClickSource(slug: string, source: ClickSource): void {
	try {
		const value: StashedSource = { ...source, t: Date.now() }
		sessionStorage.setItem(
			ATTRIBUTION_STASH_PREFIX + slug,
			JSON.stringify(value),
		)
	} catch {
		// sessionStorage unavailable — attribution simply falls back to referrer.
	}
}

/** Read and consume the stashed source for a slug, if fresh. */
export function readClickSource(slug: string): ClickSource | null {
	try {
		const key = ATTRIBUTION_STASH_PREFIX + slug
		const raw = sessionStorage.getItem(key)
		if (!raw) return null
		sessionStorage.removeItem(key)

		const parsed = JSON.parse(raw) as StashedSource
		if (typeof parsed.t !== 'number' || Date.now() - parsed.t > MAX_AGE_MS) {
			return null
		}
		return {
			surface: parsed.surface,
			feedName: parsed.feedName,
			query: parsed.query,
			position: parsed.position,
		}
	} catch {
		return null
	}
}
