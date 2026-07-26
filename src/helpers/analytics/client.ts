/**
 * Browser-side analytics transport.
 *
 * Queues events and flushes them in batches via `navigator.sendBeacon` (falling
 * back to `fetch(keepalive)`), on a short interval and whenever the page is
 * hidden/unloaded. Collection is disabled entirely when the user signals a
 * privacy preference (DNT / Global Privacy Control) or the feature flag is off.
 *
 * Framework-agnostic and side-effect free until `track()` is first called, so it
 * is safe to import in both server and client bundles.
 */

import {
	ANALYTICS_COLLECT_PATH,
	MAX_EVENTS_PER_BATCH,
} from '@/helpers/analytics/constants'
import { type ClientEvent } from '@/helpers/analytics/schema'

const FLUSH_INTERVAL_MS = 4_000
const SESSION_ID_KEY = 'cartridge.analytics.sid'

let queue: ClientEvent[] = []
let flushTimer: ReturnType<typeof setTimeout> | null = null
let lifecycleInstalled = false

/** Optional identity provider so the module doesn't hard-depend on the auth layer. */
type IdentityFn = () => { isAuthed: boolean; did?: string }
let identityFn: IdentityFn = () => ({ isAuthed: false })

export function setAnalyticsIdentity(fn: IdentityFn): void {
	identityFn = fn
}

function privacySignalled(): boolean {
	const nav = navigator as Navigator & {
		globalPrivacyControl?: boolean
		msDoNotTrack?: string
	}
	const dnt =
		nav.doNotTrack ??
		nav.msDoNotTrack ??
		(window as Window & { doNotTrack?: string }).doNotTrack
	return dnt === '1' || dnt === 'yes' || nav.globalPrivacyControl === true
}

export function analyticsEnabled(): boolean {
	if (typeof window === 'undefined') return false
	if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== 'true') return false
	return !privacySignalled()
}

function getSessionId(): string {
	try {
		const existing = sessionStorage.getItem(SESSION_ID_KEY)
		if (existing) return existing
		const id = crypto.randomUUID()
		sessionStorage.setItem(SESSION_ID_KEY, id)
		return id
	} catch {
		// sessionStorage may be unavailable (private mode); fall back to per-load id.
		return 'ephemeral'
	}
}

function installLifecycle(): void {
	if (lifecycleInstalled || typeof window === 'undefined') return
	lifecycleInstalled = true
	document.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'hidden') flush()
	})
	window.addEventListener('pagehide', () => flush())
}

function scheduleFlush(): void {
	if (flushTimer) return
	flushTimer = setTimeout(() => {
		flushTimer = null
		flush()
	}, FLUSH_INTERVAL_MS)
}

function send(payload: string): void {
	const url = ANALYTICS_COLLECT_PATH
	// text/plain keeps the beacon a "simple request" (no CORS preflight); the
	// collector reads the raw body regardless of content-type.
	try {
		if (typeof navigator.sendBeacon === 'function') {
			const blob = new Blob([payload], { type: 'text/plain' })
			if (navigator.sendBeacon(url, blob)) return
		}
	} catch {
		// fall through to fetch
	}
	void fetch(url, {
		method: 'POST',
		body: payload,
		keepalive: true,
		headers: { 'Content-Type': 'text/plain' },
	}).catch(() => {})
}

/** Flush queued events immediately. Safe to call when the queue is empty. */
export function flush(): void {
	if (flushTimer) {
		clearTimeout(flushTimer)
		flushTimer = null
	}
	if (queue.length === 0) return

	const events = queue
	queue = []

	const { isAuthed, did } = safeIdentity()
	const payload = JSON.stringify({
		sessionId: getSessionId(),
		isAuthed,
		...(did ? { did } : {}),
		events,
	})
	send(payload)
}

function safeIdentity(): { isAuthed: boolean; did?: string } {
	try {
		return identityFn()
	} catch {
		return { isAuthed: false }
	}
}

/** Queue an analytics event. No-op when analytics is disabled. */
export function track(event: ClientEvent): void {
	if (!analyticsEnabled()) return
	installLifecycle()
	queue.push(event)
	if (queue.length >= MAX_EVENTS_PER_BATCH) {
		flush()
	} else {
		scheduleFlush()
	}
}

/** Test-only: reset module state between cases. */
export function __resetAnalyticsForTests(): void {
	queue = []
	if (flushTimer) clearTimeout(flushTimer)
	flushTimer = null
	lifecycleInstalled = false
	identityFn = () => ({ isAuthed: false })
}
