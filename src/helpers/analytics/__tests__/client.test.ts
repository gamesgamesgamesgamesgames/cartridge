// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
	__resetAnalyticsForTests,
	analyticsEnabled,
	flush,
	setAnalyticsIdentity,
	track,
} from '@/helpers/analytics/client'
import { type ClientEvent } from '@/helpers/analytics/schema'

const impression: ClientEvent = {
	type: 'impression',
	gameUri: 'at://x/1',
	gameSlug: 'celeste',
	surface: 'feed',
	feedName: 'hot',
	position: 1,
}

function setDoNotTrack(value: string | null) {
	Object.defineProperty(navigator, 'doNotTrack', {
		value,
		configurable: true,
	})
}

let beacon: ReturnType<typeof vi.fn>

beforeEach(() => {
	__resetAnalyticsForTests()
	process.env.NEXT_PUBLIC_ANALYTICS_ENABLED = 'true'
	setDoNotTrack(null)
	sessionStorage.clear()
	beacon = vi.fn(() => true)
	Object.defineProperty(navigator, 'sendBeacon', {
		value: beacon,
		configurable: true,
	})
})

afterEach(() => {
	vi.restoreAllMocks()
})

async function lastBeaconPayload(): Promise<Record<string, unknown>> {
	const blob = beacon.mock.calls.at(-1)?.[1] as Blob
	return JSON.parse(await blob.text())
}

describe('analyticsEnabled', () => {
	it('is true with the flag on and no privacy signal', () => {
		expect(analyticsEnabled()).toBe(true)
	})

	it('is false when the feature flag is off', () => {
		process.env.NEXT_PUBLIC_ANALYTICS_ENABLED = 'false'
		expect(analyticsEnabled()).toBe(false)
	})

	it('is false when Do-Not-Track is set', () => {
		setDoNotTrack('1')
		expect(analyticsEnabled()).toBe(false)
	})
})

describe('track / flush', () => {
	it('does nothing when disabled', () => {
		process.env.NEXT_PUBLIC_ANALYTICS_ENABLED = 'false'
		track(impression)
		flush()
		expect(beacon).not.toHaveBeenCalled()
	})

	it('queues and flushes an event via sendBeacon', async () => {
		track(impression)
		expect(beacon).not.toHaveBeenCalled() // batched, not sent yet
		flush()
		expect(beacon).toHaveBeenCalledTimes(1)
		const payload = await lastBeaconPayload()
		expect(payload.events).toHaveLength(1)
		expect((payload.events as ClientEvent[])[0].gameSlug).toBe('celeste')
		expect(payload.sessionId).toBeTruthy()
	})

	it('batches multiple events into one beacon', async () => {
		track(impression)
		track({ ...impression, gameSlug: 'hades' })
		flush()
		expect(beacon).toHaveBeenCalledTimes(1)
		const payload = await lastBeaconPayload()
		expect(payload.events).toHaveLength(2)
	})

	it('includes identity when provided', async () => {
		setAnalyticsIdentity(() => ({ isAuthed: true, did: 'did:plc:z' }))
		track(impression)
		flush()
		const payload = await lastBeaconPayload()
		expect(payload.isAuthed).toBe(true)
		expect(payload.did).toBe('did:plc:z')
	})

	it('reuses a stable per-tab session id', async () => {
		track(impression)
		flush()
		const first = (await lastBeaconPayload()).sessionId
		track(impression)
		flush()
		const second = (await lastBeaconPayload()).sessionId
		expect(second).toBe(first)
	})

	it('falls back to fetch(keepalive) when sendBeacon is unavailable', () => {
		Object.defineProperty(navigator, 'sendBeacon', {
			value: undefined,
			configurable: true,
		})
		const fetchMock = vi
			.spyOn(globalThis, 'fetch')
			.mockResolvedValue(new Response(null, { status: 204 }))
		track(impression)
		flush()
		expect(fetchMock).toHaveBeenCalledWith(
			'/api/event',
			expect.objectContaining({ method: 'POST', keepalive: true }),
		)
	})

	it('flushes when the page is hidden', () => {
		track(impression)
		Object.defineProperty(document, 'visibilityState', {
			value: 'hidden',
			configurable: true,
		})
		document.dispatchEvent(new Event('visibilitychange'))
		expect(beacon).toHaveBeenCalledTimes(1)
	})
})
