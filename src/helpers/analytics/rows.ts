/**
 * Maps validated client events into flat ClickHouse rows.
 *
 * Fields not relevant to a given event type are written as empty/zero defaults;
 * ClickHouse stores these sparsely. Pure and side-effect free so it can be unit
 * tested without a database.
 */

import { type EventRow, type IngestBatch } from '@/helpers/analytics/schema'

/** Format a Date as ClickHouse `DateTime64(3)` text in UTC: `YYYY-MM-DD HH:MM:SS.mmm`. */
export function clickhouseDateTime(now: Date): string {
	// toISOString() → '2026-07-20T12:34:56.789Z'
	return now.toISOString().replace('T', ' ').replace('Z', '')
}

function emptyRow(
	ts: string,
	visitorHash: string,
	sessionId: string,
	isAuthed: 0 | 1,
): EventRow {
	return {
		ts,
		event_type: 'impression',
		game_uri: '',
		game_slug: '',
		surface: '',
		feed_name: '',
		position: 0,
		query: '',
		referrer_type: '',
		referrer_feed: '',
		referrer_query: '',
		referrer_domain: '',
		action_type: '',
		visitor_hash: visitorHash,
		session_id: sessionId,
		dwell_ms: 0,
		scroll_pct: 0,
		tab: '',
		is_authed: isAuthed,
	}
}

export function toEventRows(
	batch: IngestBatch,
	ctx: { ts: string; visitorHash: string },
): EventRow[] {
	const isAuthed: 0 | 1 = batch.isAuthed ? 1 : 0

	return batch.events.map((event) => {
		const row = emptyRow(ctx.ts, ctx.visitorHash, batch.sessionId, isAuthed)
		row.event_type = event.type
		row.game_uri = event.gameUri
		row.game_slug = event.gameSlug

		switch (event.type) {
			case 'impression':
			case 'card_click':
				row.surface = event.surface
				row.feed_name = event.feedName ?? ''
				row.position = event.position ?? 0
				row.query = event.query ?? ''
				break

			case 'pageview':
				row.referrer_type = event.referrerType
				row.referrer_feed = event.referrerFeed ?? ''
				row.referrer_query = event.referrerQuery ?? ''
				row.referrer_domain = event.referrerDomain ?? ''
				break

			case 'dwell':
				row.dwell_ms = event.dwellMs
				row.scroll_pct = event.scrollPct ?? 0
				row.tab = event.tab ?? ''
				break

			case 'action':
				row.action_type = event.actionType
				break
		}

		return row
	})
}
