/**
 * ClickHouse client for the ingest collector (server-only).
 *
 * Uses a lazily-created singleton so warm serverless invocations reuse the
 * connection pool. Inserts are async on the ClickHouse side so the request can
 * return immediately — analytics writes must never add latency to the browser.
 */

import 'server-only'

import { createClient, type ClickHouseClient } from '@clickhouse/client'

import { type EventRow } from '@/helpers/analytics/schema'

let client: ClickHouseClient | null = null

export function getClickHouseClient(): ClickHouseClient {
	if (client) return client

	const url = process.env.CLICKHOUSE_URL
	if (!url) {
		throw new Error('CLICKHOUSE_URL is not configured')
	}

	client = createClient({
		url,
		username: process.env.CLICKHOUSE_INSERT_USER ?? 'ingest',
		password: process.env.CLICKHOUSE_INSERT_PASSWORD ?? '',
		database: process.env.CLICKHOUSE_DATABASE ?? 'cartridge_analytics',
		clickhouse_settings: {
			// Fire-and-forget: ClickHouse buffers and flushes server-side.
			async_insert: 1,
			wait_for_async_insert: 0,
		},
	})

	return client
}

export async function insertEvents(rows: EventRow[]): Promise<void> {
	if (rows.length === 0) return
	await getClickHouseClient().insert({
		table: 'events',
		values: rows,
		format: 'JSONEachRow',
	})
}
