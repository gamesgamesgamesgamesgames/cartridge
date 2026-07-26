// @vitest-environment happy-dom

import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { track, stashClickSource, readClickSource } = vi.hoisted(() => ({
	track: vi.fn(),
	stashClickSource: vi.fn(),
	readClickSource: vi.fn(() => null),
}))

vi.mock('@/helpers/analytics/client', () => ({ track, flush: vi.fn() }))
vi.mock('@/helpers/analytics/attribution', () => ({
	stashClickSource,
	readClickSource,
}))

import { GameAnalytics } from '@/components/analytics/GameAnalytics'
import { ImpressionSurfaceProvider } from '@/components/analytics/ImpressionSurface'
import { TrackedGameLink } from '@/components/analytics/TrackedGameLink'

class MockIntersectionObserver {
	static instances: MockIntersectionObserver[] = []
	cb: IntersectionObserverCallback
	constructor(cb: IntersectionObserverCallback) {
		this.cb = cb
		MockIntersectionObserver.instances.push(this)
	}
	observe(el: Element) {
		// Simulate the element becoming fully visible immediately.
		this.cb(
			[{ isIntersecting: true, intersectionRatio: 1, target: el } as IntersectionObserverEntry],
			this as unknown as IntersectionObserver,
		)
	}
	disconnect() {}
	unobserve() {}
	takeRecords() {
		return []
	}
}

beforeEach(() => {
	track.mockClear()
	stashClickSource.mockClear()
	readClickSource.mockReturnValue(null)
	MockIntersectionObserver.instances = []
	vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
})

afterEach(() => {
	vi.unstubAllGlobals()
	vi.useRealTimers()
})

function renderLink() {
	return render(
		<ImpressionSurfaceProvider value={{ surface: 'feed', feedName: 'hot' }}>
			<TrackedGameLink
				gameUri={'at://x/1'}
				gameSlug={'celeste'}
				position={2}
				onClick={(e) => e.preventDefault()}>
				Celeste
			</TrackedGameLink>
		</ImpressionSurfaceProvider>,
	)
}

describe('impression tracking', () => {
	it('fires one impression after the element is visible for the dwell threshold', () => {
		vi.useFakeTimers()
		renderLink()
		expect(track).not.toHaveBeenCalled()
		vi.advanceTimersByTime(1_000)
		expect(track).toHaveBeenCalledTimes(1)
		expect(track).toHaveBeenCalledWith(
			expect.objectContaining({
				type: 'impression',
				gameSlug: 'celeste',
				surface: 'feed',
				feedName: 'hot',
				position: 2,
			}),
		)
	})
})

describe('click-through tracking', () => {
	it('records a card_click and stashes the source on click', async () => {
		const user = userEvent.setup()
		const { getByText } = renderLink()
		await user.click(getByText('Celeste'))
		expect(track).toHaveBeenCalledWith(
			expect.objectContaining({ type: 'card_click', gameSlug: 'celeste', feedName: 'hot' }),
		)
		expect(stashClickSource).toHaveBeenCalledWith(
			'celeste',
			expect.objectContaining({ surface: 'feed', feedName: 'hot', position: 2 }),
		)
	})
})

describe('game pageview tracking', () => {
	it('emits a direct pageview when there is no click source or referrer', () => {
		render(<GameAnalytics gameUri={'at://x/1'} gameSlug={'hades'} />)
		expect(track).toHaveBeenCalledWith(
			expect.objectContaining({ type: 'pageview', gameSlug: 'hades', referrerType: 'direct' }),
		)
	})

	it('attributes the pageview to a stashed feed click', () => {
		readClickSource.mockReturnValue({ surface: 'feed', feedName: 'personalized' } as never)
		render(<GameAnalytics gameUri={'at://x/1'} gameSlug={'hades'} />)
		expect(track).toHaveBeenCalledWith(
			expect.objectContaining({
				type: 'pageview',
				referrerType: 'feed',
				referrerFeed: 'personalized',
			}),
		)
	})
})
