/**
 * Ingest contract shared by the browser analytics module and the collector.
 *
 * The browser posts an {@link IngestBatch}; the collector validates it, computes
 * a privacy-preserving `visitorHash`, stamps a server timestamp, and writes one
 * {@link EventRow} per event to ClickHouse.
 */

import { z } from 'zod'

import {
	ACTION_TYPES,
	MAX_EVENTS_PER_BATCH,
	REFERRER_TYPES,
	SURFACES,
} from '@/helpers/analytics/constants'

// ---------------------------------------------------------------------------
// Per-event schemas (discriminated on `type`)
// ---------------------------------------------------------------------------

const gameRef = {
	gameUri: z.string().min(1).max(512),
	gameSlug: z.string().min(1).max(256),
}

const feedName = z.string().max(64).optional()
const position = z.number().int().min(0).max(10_000).optional()
const query = z.string().max(256).optional()

const impressionEvent = z.object({
	type: z.literal('impression'),
	...gameRef,
	surface: z.enum(SURFACES),
	feedName,
	position,
	query,
})

const cardClickEvent = z.object({
	type: z.literal('card_click'),
	...gameRef,
	surface: z.enum(SURFACES),
	feedName,
	position,
	query,
})

const pageviewEvent = z.object({
	type: z.literal('pageview'),
	...gameRef,
	referrerType: z.enum(REFERRER_TYPES),
	referrerFeed: feedName,
	referrerQuery: query,
	referrerDomain: z.string().max(256).optional(),
})

const dwellEvent = z.object({
	type: z.literal('dwell'),
	...gameRef,
	dwellMs: z.number().int().min(0).max(86_400_000),
	scrollPct: z.number().int().min(0).max(100).optional(),
	tab: z.string().max(32).optional(),
})

const actionEvent = z.object({
	type: z.literal('action'),
	...gameRef,
	actionType: z.enum(ACTION_TYPES),
})

export const clientEventSchema = z.discriminatedUnion('type', [
	impressionEvent,
	cardClickEvent,
	pageviewEvent,
	dwellEvent,
	actionEvent,
])

export type ClientEvent = z.infer<typeof clientEventSchema>

// ---------------------------------------------------------------------------
// Batch envelope
// ---------------------------------------------------------------------------

export const ingestBatchSchema = z.object({
	/** Ephemeral per-tab id used to stitch events within a visit. Not a cookie. */
	sessionId: z.string().min(1).max(64),
	/** Whether the browser had an authed session. Stored as a flag only. */
	isAuthed: z.boolean().optional(),
	/** DID, when signed in. Used ONLY to strengthen the visitor hash; never stored. */
	did: z.string().max(256).optional(),
	events: z.array(clientEventSchema).min(1).max(MAX_EVENTS_PER_BATCH),
})

export type IngestBatch = z.infer<typeof ingestBatchSchema>

// ---------------------------------------------------------------------------
// ClickHouse row (server-side shape after enrichment)
// ---------------------------------------------------------------------------

/**
 * One row in the ClickHouse `events` table. Fields not relevant to a given
 * `event_type` are written as empty/zero defaults (ClickHouse stores these
 * sparsely). No raw IP or user-agent is ever included.
 */
export type EventRow = {
	ts: string // 'YYYY-MM-DD HH:MM:SS.SSS' (UTC)
	event_type: ClientEvent['type']
	game_uri: string
	game_slug: string
	surface: string
	feed_name: string
	position: number
	query: string
	referrer_type: string
	referrer_feed: string
	referrer_query: string
	referrer_domain: string
	action_type: string
	visitor_hash: string
	session_id: string
	dwell_ms: number
	scroll_pct: number
	tab: string
	is_authed: 0 | 1
}
