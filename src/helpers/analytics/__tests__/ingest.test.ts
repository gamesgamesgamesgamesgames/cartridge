import { describe, expect, it } from 'vitest'

import {
	clientIpFromForwardedFor,
	computeVisitorHash,
	dateKeyUTC,
} from '@/helpers/analytics/hash'
import { buildIngest, type IngestHeaders } from '@/helpers/analytics/ingest'
import { type IngestBatch } from '@/helpers/analytics/schema'

const SECRET = 'test-secret'
const NOW = new Date('2026-07-20T12:34:56.789Z')

const goodHeaders: IngestHeaders = {
	userAgent:
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
	forwardedFor: '203.0.113.7, 70.41.3.18',
}

function batch(events: IngestBatch['events'], extra?: Partial<IngestBatch>): string {
	return JSON.stringify({ sessionId: 'sess-1', events, ...extra })
}

const impression: IngestBatch['events'][number] = {
	type: 'impression',
	gameUri: 'at://did:plc:abc/games.gamesgamesgamesgames.game/1',
	gameSlug: 'celeste',
	surface: 'feed',
	feedName: 'hot',
	position: 3,
}

describe('dateKeyUTC', () => {
	it('formats the UTC day as YYYYMMDD', () => {
		expect(dateKeyUTC(NOW)).toBe('20260720')
	})

	it('uses UTC, not local time, across a day boundary', () => {
		expect(dateKeyUTC(new Date('2026-07-20T23:30:00.000Z'))).toBe('20260720')
		expect(dateKeyUTC(new Date('2026-07-21T00:30:00.000Z'))).toBe('20260721')
	})
})

describe('computeVisitorHash', () => {
	it('is deterministic for the same inputs within a day', () => {
		const a = computeVisitorHash(SECRET, '20260720', '1.2.3.4', 'UA')
		const b = computeVisitorHash(SECRET, '20260720', '1.2.3.4', 'UA')
		expect(a).toBe(b)
	})

	it('rotates across days for the same visitor', () => {
		const day1 = computeVisitorHash(SECRET, '20260720', '1.2.3.4', 'UA')
		const day2 = computeVisitorHash(SECRET, '20260721', '1.2.3.4', 'UA')
		expect(day1).not.toBe(day2)
	})

	it('changes when the DID changes', () => {
		const anon = computeVisitorHash(SECRET, '20260720', '1.2.3.4', 'UA')
		const authed = computeVisitorHash(SECRET, '20260720', '1.2.3.4', 'UA', 'did:plc:x')
		expect(anon).not.toBe(authed)
	})

	it('does not leak the raw ip/ua (opaque hex digest)', () => {
		const hash = computeVisitorHash(SECRET, '20260720', '1.2.3.4', 'UA')
		expect(hash).toMatch(/^[0-9a-f]{64}$/)
		expect(hash).not.toContain('1.2.3.4')
	})
})

describe('clientIpFromForwardedFor', () => {
	it('takes the first address in the chain', () => {
		expect(clientIpFromForwardedFor('203.0.113.7, 70.41.3.18')).toBe('203.0.113.7')
	})

	it('falls back to x-real-ip', () => {
		expect(clientIpFromForwardedFor(null, '9.9.9.9')).toBe('9.9.9.9')
	})

	it('returns empty string when nothing is present', () => {
		expect(clientIpFromForwardedFor(undefined, null)).toBe('')
	})
})

describe('buildIngest — privacy & bots', () => {
	it('drops when Do-Not-Track is set', () => {
		const res = buildIngest({
			rawBody: batch([impression]),
			headers: { ...goodHeaders, dnt: '1' },
			now: NOW,
			secret: SECRET,
		})
		expect(res).toEqual({ ok: false, reason: 'dnt', status: 204 })
	})

	it('drops when Global Privacy Control is set', () => {
		const res = buildIngest({
			rawBody: batch([impression]),
			headers: { ...goodHeaders, secGpc: '1' },
			now: NOW,
			secret: SECRET,
		})
		expect(res).toEqual({ ok: false, reason: 'dnt', status: 204 })
	})

	it('drops known bots by user-agent', () => {
		const res = buildIngest({
			rawBody: batch([impression]),
			headers: { ...goodHeaders, userAgent: 'Googlebot/2.1 (+http://www.google.com/bot.html)' },
			now: NOW,
			secret: SECRET,
		})
		expect(res).toEqual({ ok: false, reason: 'bot', status: 204 })
	})
})

describe('buildIngest — validation', () => {
	it('rejects malformed JSON with 400', () => {
		const res = buildIngest({ rawBody: '{not json', headers: goodHeaders, now: NOW, secret: SECRET })
		expect(res).toEqual({ ok: false, reason: 'invalid', status: 400 })
	})

	it('rejects a batch with no events', () => {
		const res = buildIngest({ rawBody: batch([]), headers: goodHeaders, now: NOW, secret: SECRET })
		expect(res).toEqual({ ok: false, reason: 'invalid', status: 400 })
	})

	it('rejects an unknown event type', () => {
		const res = buildIngest({
			rawBody: JSON.stringify({ sessionId: 's', events: [{ type: 'nope', gameUri: 'x', gameSlug: 'y' }] }),
			headers: goodHeaders,
			now: NOW,
			secret: SECRET,
		})
		expect(res.ok).toBe(false)
	})
})

describe('buildIngest — row mapping', () => {
	it('maps an impression with surface/feed/position and stamps ts + hash', () => {
		const res = buildIngest({
			rawBody: batch([impression], { isAuthed: true, did: 'did:plc:x' }),
			headers: goodHeaders,
			now: NOW,
			secret: SECRET,
		})
		expect(res.ok).toBe(true)
		if (!res.ok) return
		expect(res.rows).toHaveLength(1)
		const row = res.rows[0]
		expect(row.event_type).toBe('impression')
		expect(row.game_slug).toBe('celeste')
		expect(row.surface).toBe('feed')
		expect(row.feed_name).toBe('hot')
		expect(row.position).toBe(3)
		expect(row.is_authed).toBe(1)
		expect(row.session_id).toBe('sess-1')
		expect(row.ts).toBe('2026-07-20 12:34:56.789')
		expect(row.visitor_hash).toBe(
			computeVisitorHash(SECRET, '20260720', '203.0.113.7', goodHeaders.userAgent!, 'did:plc:x'),
		)
	})

	it('maps a pageview with referrer attribution', () => {
		const res = buildIngest({
			rawBody: batch([
				{
					type: 'pageview',
					gameUri: 'at://x/1',
					gameSlug: 'hades',
					referrerType: 'feed',
					referrerFeed: 'personalized',
				},
			]),
			headers: goodHeaders,
			now: NOW,
			secret: SECRET,
		})
		expect(res.ok).toBe(true)
		if (!res.ok) return
		expect(res.rows[0].referrer_type).toBe('feed')
		expect(res.rows[0].referrer_feed).toBe('personalized')
	})

	it('maps dwell and action events', () => {
		const res = buildIngest({
			rawBody: batch([
				{ type: 'dwell', gameUri: 'at://x/1', gameSlug: 'hades', dwellMs: 45_000, scrollPct: 80, tab: 'reviews' },
				{ type: 'action', gameUri: 'at://x/1', gameSlug: 'hades', actionType: 'like' },
			]),
			headers: goodHeaders,
			now: NOW,
			secret: SECRET,
		})
		expect(res.ok).toBe(true)
		if (!res.ok) return
		const [dwell, action] = res.rows
		expect(dwell.dwell_ms).toBe(45_000)
		expect(dwell.scroll_pct).toBe(80)
		expect(dwell.tab).toBe('reviews')
		expect(action.action_type).toBe('like')
	})

	it('defaults is_authed to 0 for anonymous batches', () => {
		const res = buildIngest({ rawBody: batch([impression]), headers: goodHeaders, now: NOW, secret: SECRET })
		expect(res.ok).toBe(true)
		if (!res.ok) return
		expect(res.rows[0].is_authed).toBe(0)
	})
})
