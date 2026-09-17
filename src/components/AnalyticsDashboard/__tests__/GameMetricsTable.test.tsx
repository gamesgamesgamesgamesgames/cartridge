// @vitest-environment happy-dom

// Module imports
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'

// Local imports
import { GameMetricsTable } from '@/components/AnalyticsDashboard/GameMetricsTable'
import { type GameAnalyticsSummary } from '@/helpers/analytics/types'
import { MY_GAMES_SUMMARIES } from '@/components/AnalyticsDashboard/__tests__/fixtures'

const UNTRACKED: GameAnalyticsSummary = {
	slug: 'ghost-game',
	name: 'Ghost Game',
	impressions: 0,
	pageviews: 0,
	ctr: 0,
	avgDwellMs: 0,
	sparkline: [],
}

describe('GameMetricsTable', () => {
	it('links each row to that game’s breakdown', () => {
		render(<GameMetricsTable games={MY_GAMES_SUMMARIES} />)

		const hrefs = screen
			.getAllByRole('link')
			.map((link) => link.getAttribute('href'))

		expect(hrefs).toEqual([
			'/studio/analytics/nebula-knight',
			'/studio/analytics/starbound-drifter',
			'/studio/analytics/pixel-forge',
		])
	})

	it('renders the caller’s order without re-sorting', () => {
		render(<GameMetricsTable games={[...MY_GAMES_SUMMARIES].reverse()} />)

		const hrefs = screen
			.getAllByRole('link')
			.map((link) => link.getAttribute('href'))

		expect(hrefs[0]).toBe('/studio/analytics/pixel-forge')
	})

	it('shows a dash rather than a zero for rates with no denominator', () => {
		render(<GameMetricsTable games={[UNTRACKED]} />)

		// CTR and dwell are undefined without impressions/pageviews; the counts
		// themselves are genuinely zero and keep their digits.
		expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2)
		expect(screen.queryByText('0.0%')).not.toBeInTheDocument()
		expect(screen.queryByText('0:00')).not.toBeInTheDocument()
	})

	it('renders plain header labels when no sort is supplied', () => {
		render(<GameMetricsTable games={MY_GAMES_SUMMARIES} />)

		expect(screen.queryByRole('button', { name: /sort by/i })).not.toBeInTheDocument()
		expect(screen.getByText('Impressions')).toBeInTheDocument()
	})

	it('renders sortable headers when a sort is supplied', () => {
		render(
			<GameMetricsTable
				games={MY_GAMES_SUMMARIES}
				sort={{ key: 'impressions', direction: 'desc', onSortChange: vi.fn() }}
			/>,
		)

		expect(
			screen.getByRole('button', { name: /sort by pageviews/i }),
		).toBeInTheDocument()
	})

	it('announces the active column’s direction and the next action', () => {
		render(
			<GameMetricsTable
				games={MY_GAMES_SUMMARIES}
				sort={{ key: 'impressions', direction: 'desc', onSortChange: vi.fn() }}
			/>,
		)

		expect(
			screen.getByRole('button', {
				name: 'Impressions, sorted descending. Activate to sort ascending.',
			}),
		).toBeInTheDocument()
	})

	it('spells out CTR for screen readers', () => {
		render(
			<GameMetricsTable
				games={MY_GAMES_SUMMARIES}
				sort={{ key: 'impressions', direction: 'desc', onSortChange: vi.fn() }}
			/>,
		)

		expect(
			screen.getByRole('button', { name: 'Sort by Click-through rate' }),
		).toBeInTheDocument()
	})

	it('reports the column that was activated', async () => {
		const onSortChange = vi.fn()
		const user = userEvent.setup()

		render(
			<GameMetricsTable
				games={MY_GAMES_SUMMARIES}
				sort={{ key: 'impressions', direction: 'desc', onSortChange }}
			/>,
		)

		await user.click(screen.getByRole('button', { name: /sort by pageviews/i }))

		expect(onSortChange).toHaveBeenCalledWith('pageviews')
	})

	describe('column alignment', () => {
		// The header and each row are separate grid containers. If their track
		// definitions ever diverge the columns drift apart on screen — and no
		// assertion here can catch that, because happy-dom performs no layout.
		// So guard the invariant that makes alignment possible instead.
		function gridClassLists(container: HTMLElement) {
			return [...container.querySelectorAll('div')]
				.map((node) => node.className)
				.filter((className) => className.includes('grid-cols-'))
		}

		it('defines identical column tracks for the header and every row', () => {
			const { container } = render(<GameMetricsTable games={MY_GAMES_SUMMARIES} />)

			const tracks = gridClassLists(container).map(
				(className) => className.match(/grid-cols-\[[^\]]+\]/)?.[0],
			)

			expect(tracks.length).toBe(1 + MY_GAMES_SUMMARIES.length)
			expect(new Set(tracks).size).toBe(1)
		})

		it('sizes the trailing trend column explicitly rather than by content', () => {
			const { container } = render(<GameMetricsTable games={MY_GAMES_SUMMARIES} />)

			// An `auto` final track collapses to zero in the header, whose only
			// content there is an out-of-flow `sr-only` label, while sizing to the
			// sparkline in the body — which is what pulled the columns apart.
			for (const className of gridClassLists(container)) {
				expect(className).toContain('_116px]')
				expect(className).not.toContain('_auto]')
			}
		})
	})

	it('gives every sparkline a name that identifies its game', () => {
		render(<GameMetricsTable games={[MY_GAMES_SUMMARIES[0]]} />)

		expect(
			screen.getAllByRole('img', { name: 'Pageviews trend for Nebula Knight' })
				.length,
		).toBeGreaterThan(0)
	})
})
