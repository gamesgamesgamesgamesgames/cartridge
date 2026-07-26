/**
 * Core ingest logic, separated from the HTTP route so it can be unit tested.
 *
 * Responsibilities: honor Do-Not-Track / Global Privacy Control, drop bots,
 * validate the batch, derive the salted daily `visitor_hash`, and produce the
 * ClickHouse rows. It performs NO I/O.
 */

import { isbot } from 'isbot'

import { clientIpFromForwardedFor, computeVisitorHash, dateKeyUTC } from '@/helpers/analytics/hash'
import { clickhouseDateTime, toEventRows } from '@/helpers/analytics/rows'
import { ingestBatchSchema, type EventRow } from '@/helpers/analytics/schema'

export type IngestHeaders = {
	dnt?: string | null
	secGpc?: string | null
	userAgent?: string | null
	forwardedFor?: string | null
	realIp?: string | null
}

export type IngestResult =
	| { ok: true; rows: EventRow[] }
	// `drop` = accept the request but write nothing (privacy / bot / bad input).
	| { ok: false; reason: 'dnt' | 'bot' | 'invalid'; status: number }

const privacyRequested = (headers: IngestHeaders): boolean =>
	headers.dnt === '1' || headers.secGpc === '1'

export function buildIngest(input: {
	rawBody: string
	headers: IngestHeaders
	now: Date
	secret: string
}): IngestResult {
	const { rawBody, headers, now, secret } = input

	// Respect Do-Not-Track / Global Privacy Control before doing anything else.
	if (privacyRequested(headers)) {
		return { ok: false, reason: 'dnt', status: 204 }
	}

	const userAgent = headers.userAgent ?? ''
	if (isbot(userAgent)) {
		return { ok: false, reason: 'bot', status: 204 }
	}

	let parsed: unknown
	try {
		parsed = JSON.parse(rawBody)
	} catch {
		return { ok: false, reason: 'invalid', status: 400 }
	}

	const result = ingestBatchSchema.safeParse(parsed)
	if (!result.success) {
		return { ok: false, reason: 'invalid', status: 400 }
	}
	const batch = result.data

	const ip = clientIpFromForwardedFor(headers.forwardedFor, headers.realIp)
	const visitorHash = computeVisitorHash(
		secret,
		dateKeyUTC(now),
		ip,
		userAgent,
		batch.did,
	)

	const rows = toEventRows(batch, {
		ts: clickhouseDateTime(now),
		visitorHash,
	})

	return { ok: true, rows }
}
