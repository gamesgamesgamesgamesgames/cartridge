import { buildIngest, type IngestHeaders } from '@/helpers/analytics/ingest'
import { insertEvents } from '@/helpers/analytics/clickhouse'

// Node runtime: uses node:crypto (HMAC) and the ClickHouse client.
export const runtime = 'nodejs'
// Never cache; every request is a fresh write.
export const dynamic = 'force-dynamic'

/**
 * Anonymous, high-volume analytics ingest.
 *
 * Beacons arrive via `navigator.sendBeacon` (often `text/plain`). This endpoint
 * fails closed and silent — analytics must never surface an error to the user,
 * so every path returns 2xx with an empty body.
 */
export async function POST(request: Request): Promise<Response> {
	if (process.env.ANALYTICS_ENABLED !== 'true') {
		return new Response(null, { status: 204 })
	}

	const secret = process.env.ANALYTICS_SALT_SECRET
	if (!secret) {
		// Misconfigured: drop rather than store un-hashed identities.
		return new Response(null, { status: 204 })
	}

	const rawBody = await request.text()

	const headers: IngestHeaders = {
		dnt: request.headers.get('dnt'),
		secGpc: request.headers.get('sec-gpc'),
		userAgent: request.headers.get('user-agent'),
		forwardedFor: request.headers.get('x-forwarded-for'),
		realIp: request.headers.get('x-real-ip'),
	}

	const result = buildIngest({ rawBody, headers, now: new Date(), secret })

	if (!result.ok) {
		// 400 for malformed input (helps debugging), 204 for privacy/bot drops.
		return new Response(null, { status: result.status })
	}

	try {
		await insertEvents(result.rows)
	} catch {
		// Swallow write failures; the client neither knows nor cares.
		return new Response(null, { status: 202 })
	}

	return new Response(null, { status: 204 })
}
