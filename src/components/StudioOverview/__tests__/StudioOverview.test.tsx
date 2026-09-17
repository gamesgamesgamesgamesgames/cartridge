// @vitest-environment happy-dom

// Module imports
import { render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'

// The attention rail fetches on mount and isn't controlled by the overview's
// props, so the API module is stubbed for the whole file. Every test below is
// about the performance half of the page.
vi.mock('@/helpers/API', () => ({
	listContributions: vi.fn(async () => ({ contributions: [] })),
	listClaims: vi.fn(async () => ({ claims: [] })),
	listMyGamesAnalytics: vi.fn(async () => ({ range: '30d', games: [] })),
}))

// Local imports
import { type GameAnalyticsSummary } from '@/helpers/analytics/types'
import { MY_GAMES_SUMMARIES } from '@/components/AnalyticsDashboard/__tests__/fixtures'
import { StudioOverview } from '@/components/StudioOverview/StudioOverview'

// Recharts' ResponsiveContainer measures via ResizeObserver, which happy-dom
// doesn't implement. Stub it so charts mount at zero size instead of throwing.
beforeAll(() => {
	globalThis.ResizeObserver = class {
		observe() {}
		unobserve() {}
		disconnect() {}
	} as unknown as typeof ResizeObserver
})

/** Fourteen days of pageviews: 100/day, then 120/day. A clean +20%. */
function risingGame(): GameAnalyticsSummary {
	return {
		slug: 'rising',
		name: 'Rising',
		impressions: 10000,
		pageviews: 1540,
		ctr: 0.1,
		avgDwellMs: 60000,
		sparkline: Array.from({ length: 14 }, (_, index) => ({
			date: `2026-07-${String(index + 1).padStart(2, '0')}`,
			value: index < 7 ? 100 : 120,
		})),
	}
}

const UNTRACKED: GameAnalyticsSummary = {
	slug: 'ghost-game',
	name: 'Ghost Game',
	impressions: 0,
	pageviews: 0,
	ctr: 0,
	avgDwellMs: 0,
	sparkline: [],
}

describe('StudioOverview', () => {
	describe('with a populated catalog', () => {
		it('shows catalog-wide totals rather than any single game’s', () => {
			render(<StudioOverview games={MY_GAMES_SUMMARIES} />)

			// 48,250 + 12,800 + 3,100 = 64,150 → 64.2k
			expect(screen.getByText('64.2k')).toBeInTheDocument()
			// 2,740 + 940 + 210 = 3,890 → 3.9k
			expect(screen.getByText('3.9k')).toBeInTheDocument()
		})

		it('counts the games behind the impressions total', () => {
			render(<StudioOverview games={MY_GAMES_SUMMARIES} />)

			expect(screen.getByText('across 3 games')).toBeInTheDocument()
		})

		it('derives clicks from the impressions-weighted rate', () => {
			render(<StudioOverview games={MY_GAMES_SUMMARIES} />)

			// 48250×0.0647 + 12800×0.052 + 3100×0.041 = 3,914.475 clicks
			expect(screen.getByText('3,914 clicks')).toBeInTheDocument()
		})

		it('ranks the top games by impressions', () => {
			render(<StudioOverview games={MY_GAMES_SUMMARIES} />)

			const hrefs = screen
				.getAllByRole('link')
				.map((link) => link.getAttribute('href'))
				.filter((href): href is string =>
					Boolean(href?.startsWith('/studio/analytics/')),
				)

			expect(hrefs).toEqual([
				'/studio/analytics/starbound-drifter',
				'/studio/analytics/nebula-knight',
				'/studio/analytics/pixel-forge',
			])
		})

		it('does not offer a "view all" link when every game already fits', () => {
			render(<StudioOverview games={MY_GAMES_SUMMARIES} />)

			expect(screen.getByText('Your games')).toBeInTheDocument()
			expect(screen.queryByText(/^All \d+ games$/)).not.toBeInTheDocument()
		})

		it('caps the ranking and links to the full table once there are more', () => {
			const many = Array.from({ length: 9 }, (_, index) => ({
				...MY_GAMES_SUMMARIES[0],
				slug: `game-${index}`,
				name: `Game ${index}`,
				impressions: 1000 * index,
			}))

			render(<StudioOverview games={many} />)

			const rows = screen
				.getAllByRole('link')
				.filter((link) =>
					link.getAttribute('href')?.startsWith('/studio/analytics/'),
				)

			expect(rows).toHaveLength(5)
			expect(screen.getByText('All 9 games')).toBeInTheDocument()
			expect(screen.getByText('Top games')).toBeInTheDocument()
		})
	})

	describe('deltas', () => {
		it('reports a pageview delta against the half-range it actually compares', () => {
			render(<StudioOverview games={[risingGame()]} />)

			expect(screen.getByText('+20%')).toBeInTheDocument()
			expect(screen.getByText('vs previous 15 days')).toBeInTheDocument()
		})

		it('shows no delta for metrics that have no baseline in the payload', () => {
			render(<StudioOverview games={[risingGame()]} />)

			// Pageviews is the only series on the summary, so it's the only tile
			// that may carry a delta.
			expect(screen.getAllByText(/^[+-]?\d+%$/)).toHaveLength(1)
		})

		it('shows no delta when the series is too short to split', () => {
			// The fixture sparklines are three points — below the minimum.
			render(<StudioOverview games={MY_GAMES_SUMMARIES} />)

			expect(screen.queryByText(/vs previous/)).not.toBeInTheDocument()
		})
	})

	describe('empty and partial states', () => {
		it('teaches both ways in when there are no games at all', () => {
			render(<StudioOverview games={[]} />)

			expect(screen.getByText('No games yet')).toBeInTheDocument()
			expect(screen.getByRole('link', { name: /add a game/i })).toHaveAttribute(
				'href',
				'/studio/catalog/new-game',
			)
			expect(
				screen.getByRole('link', { name: /claim existing games/i }),
			).toHaveAttribute('href', '/claim')
		})

		it('hides the range selector when there is nothing to range over', () => {
			render(<StudioOverview games={[]} />)

			expect(
				screen.queryByRole('group', { name: 'Time range' }),
			).not.toBeInTheDocument()
		})

		it('still lists games that exist but have no traffic yet', () => {
			render(<StudioOverview games={[UNTRACKED]} />)

			expect(screen.queryByText('No games yet')).not.toBeInTheDocument()
			// The row renders a narrow and a wide branch; only one is displayed in
			// a real browser, but both are in the DOM without CSS.
			expect(screen.getAllByText('Ghost Game').length).toBeGreaterThan(0)
			expect(
				screen.getByText(/No impressions recorded in this range yet/),
			).toBeInTheDocument()
		})

		it('explains an unchartable range instead of drawing an empty chart', () => {
			render(<StudioOverview games={[UNTRACKED]} />)

			expect(
				screen.getByText('Not enough activity in this range to chart yet.'),
			).toBeInTheDocument()
		})

		it('shows a dash rather than a fabricated zero for rates', () => {
			render(<StudioOverview games={[UNTRACKED]} />)

			expect(screen.queryByText('0.0%')).not.toBeInTheDocument()
			expect(screen.queryByText('0:00')).not.toBeInTheDocument()
		})
	})

	describe('accessibility', () => {
		it('marks the metrics region as a live region', () => {
			const { container } = render(<StudioOverview games={MY_GAMES_SUMMARIES} />)

			expect(container.querySelector('[aria-live="polite"]')).not.toBeNull()
		})

		it('names each section for assistive technology', () => {
			render(<StudioOverview games={MY_GAMES_SUMMARIES} />)

			expect(
				screen.getByRole('region', { name: 'Pageviews' }),
			).toBeInTheDocument()
			expect(
				screen.getByRole('region', { name: 'Your games' }),
			).toBeInTheDocument()
		})

		it('gives the page a single level-one heading', () => {
			render(<StudioOverview games={MY_GAMES_SUMMARIES} />)

			expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
			expect(
				screen.getByRole('heading', { level: 1, name: 'Studio' }),
			).toBeInTheDocument()
		})
	})
})
