// @vitest-environment happy-dom

// Module imports
import { render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it } from 'vitest'

// Local imports
import {
	EMPTY_GAME_ANALYTICS,
	GAME_ANALYTICS_FIXTURE,
} from '@/components/AnalyticsDashboard/__tests__/fixtures'
import { GameAnalyticsPanel } from '@/components/AnalyticsDashboard/GameAnalyticsPanel'

// Recharts' ResponsiveContainer measures its parent via ResizeObserver, which
// happy-dom doesn't implement. Stub it so charts mount (and render nothing at
// zero size) instead of throwing.
beforeAll(() => {
	globalThis.ResizeObserver = class {
		observe() {}
		unobserve() {}
		disconnect() {}
	} as unknown as typeof ResizeObserver
})

describe('GameAnalyticsPanel', () => {
	it('renders the headline stat numbers from totals', () => {
		render(<GameAnalyticsPanel analytics={GAME_ANALYTICS_FIXTURE} />)

		// impressions 48,250 → 48.3k; pageviews 2,740 → 2.7k
		expect(screen.getAllByText('48.3k').length).toBeGreaterThan(0)
		expect(screen.getByText('2.7k')).toBeInTheDocument()
		// ctr 0.0647 → 6.5%
		expect(screen.getByText('6.5%')).toBeInTheDocument()
		// avg dwell 92000ms → 1:32 (headline + engagement tile)
		expect(screen.getAllByText('1:32').length).toBeGreaterThan(0)
	})

	it('renders all four section panels', () => {
		render(<GameAnalyticsPanel analytics={GAME_ANALYTICS_FIXTURE} />)

		expect(screen.getByText('Discovery & visibility')).toBeInTheDocument()
		expect(screen.getByText('Attribution')).toBeInTheDocument()
		expect(screen.getByText('Engagement')).toBeInTheDocument()
		expect(screen.getByText('Conversions & trends')).toBeInTheDocument()
	})

	it('shows the daily-uniques privacy footnote', () => {
		render(<GameAnalyticsPanel analytics={GAME_ANALYTICS_FIXTURE} />)

		expect(
			screen.getByText(/not comparable across days/i),
		).toBeInTheDocument()
	})

	it('shows the empty state when all totals are zero', () => {
		render(<GameAnalyticsPanel analytics={EMPTY_GAME_ANALYTICS} />)

		expect(screen.getByText('No analytics yet')).toBeInTheDocument()
		// No section panels should render.
		expect(screen.queryByText('Discovery & visibility')).not.toBeInTheDocument()
	})

	it('shows the empty state when the payload is null', () => {
		render(<GameAnalyticsPanel analytics={null} />)

		expect(screen.getByText('No analytics yet')).toBeInTheDocument()
	})
})
