/**
 * Privacy-preserving visitor identity.
 *
 * We never store raw IP or user-agent. Instead we derive a `visitor_hash` from
 * an HMAC keyed by a server-only secret, mixing in a UTC day key so the hash
 * ROTATES DAILY. That lets us count unique visitors within a day while making a
 * visitor unlinkable across days (and irreversible without the secret).
 */

import { createHmac } from 'node:crypto'

/** UTC calendar day as `YYYYMMDD`. */
export function dateKeyUTC(now: Date): string {
	return now.toISOString().slice(0, 10).replace(/-/g, '')
}

/**
 * HMAC-SHA256 over the day key + IP + user-agent (+ DID when signed in).
 * `secret` is the rotating-salt key held only on the server.
 */
export function computeVisitorHash(
	secret: string,
	dateKey: string,
	ip: string,
	userAgent: string,
	did?: string,
): string {
	return createHmac('sha256', secret)
		.update(`${dateKey}|${ip}|${userAgent}|${did ?? ''}`)
		.digest('hex')
}

/** First address in an `X-Forwarded-For` chain, or ''. */
export function clientIpFromForwardedFor(
	forwardedFor: string | null | undefined,
	realIp?: string | null,
): string {
	if (forwardedFor) {
		const first = forwardedFor.split(',')[0]?.trim()
		if (first) return first
	}
	return realIp?.trim() ?? ''
}
