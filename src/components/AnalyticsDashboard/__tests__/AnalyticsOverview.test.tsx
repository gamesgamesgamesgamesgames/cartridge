// @vitest-environment happy-dom

// Module imports
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import userEvent from '@testing-library/user-event'

// Local imports
import { AnalyticsOverview } from '@/components/AnalyticsDashboard/AnalyticsOverview'
import { type GameAnalyticsSummary } from '@/helpers/analytics/types'
import { MY_GAMES_SUMMARIES } from '@/components/AnalyticsDashboard/__tests__/fixtures'

/** Enough games to cross the threshold that reveals the filter. */
function manyGames(): GameAnalyticsSummary[] {
	return Array.from({ length: 10 }, (_, index) => ({
		...MY_GAMES_SUMMARIES[0],
		slug: `game-${index}`,
		name: index === 0 ? 'Aurora Fall' : `Filler ${index}`,
		impressions: 1000 * index,
	}))
}

/** Row order, read off the row links (each row is one link). */
function rowSlugs() {
	return screen
		.getAllByRole('link')
		.map((link) => link.getAttribute('href'))
		.filter((href): href is string =>
			Boolean(href?.startsWith('/studio/analytics/')),
		)
		.map((href) => href.replace('/studio/analytics/', ''))
}

describe('AnalyticsOverview', () => {
	it('renders a row per owned game', () => {
		render(<AnalyticsOverview games={MY_GAMES_SUMMARIES} />)

		expect(rowSlugs()).toHaveLength(MY_GAMES_SUMMARIES.length)
	})

	it('sorts by impressions descending out of the box', () => {
		render(<AnalyticsOverview games={MY_GAMES_SUMMARIES} />)

		expect(rowSlugs()).toEqual([
			'starbound-drifter',
			'nebula-knight',
			'pixel-forge',
		])
	})

	it('summarises the catalog in the page description', () => {
		render(<AnalyticsOverview games={MY_GAMES_SUMMARIES} />)

		// 64,150 impressions across 3 games → 64.2k
		expect(screen.getByText(/3 games · 64\.2k impressions/)).toBeInTheDocument()
	})

	it('shows the empty state when there are no games', () => {
		render(<AnalyticsOverview games={[]} />)

		expect(screen.getByText('No analytics yet')).toBeInTheDocument()
	})

	describe('sorting', () => {
		it('reverses the active column when it is activated again', async () => {
			const user = userEvent.setup()
			render(<AnalyticsOverview games={MY_GAMES_SUMMARIES} />)

			await user.click(screen.getByRole('button', { name: /^Impressions, sorted/ }))

			expect(rowSlugs()).toEqual([
				'pixel-forge',
				'nebula-knight',
				'starbound-drifter',
			])
		})

		it('sorts names ascending when switching to a text column', async () => {
			const user = userEvent.setup()
			render(<AnalyticsOverview games={MY_GAMES_SUMMARIES} />)

			await user.click(screen.getByRole('button', { name: 'Sort by Game' }))

			expect(rowSlugs()).toEqual([
				'nebula-knight',
				'pixel-forge',
				'starbound-drifter',
			])
		})

		it('sorts magnitudes descending when switching to a numeric column', async () => {
			const user = userEvent.setup()
			render(<AnalyticsOverview games={MY_GAMES_SUMMARIES} />)

			await user.click(screen.getByRole('button', { name: 'Sort by Avg dwell' }))

			// 92000 / 74000 / 53000
			expect(rowSlugs()).toEqual([
				'starbound-drifter',
				'nebula-knight',
				'pixel-forge',
			])
		})
	})

	describe('filtering', () => {
		it('stays out of the way for a catalog small enough to scan', () => {
			render(<AnalyticsOverview games={MY_GAMES_SUMMARIES} />)

			expect(
				screen.queryByRole('searchbox', { name: 'Filter games by name' }),
			).not.toBeInTheDocument()
		})

		it('appears once the catalog is large', () => {
			render(<AnalyticsOverview games={manyGames()} />)

			expect(
				screen.getByRole('searchbox', { name: 'Filter games by name' }),
			).toBeInTheDocument()
		})

		it('narrows the rows to matching names', async () => {
			const user = userEvent.setup()
			render(<AnalyticsOverview games={manyGames()} />)

			await user.type(
				screen.getByRole('searchbox', { name: 'Filter games by name' }),
				'aurora',
			)

			expect(rowSlugs()).toEqual(['game-0'])
		})

		it('offers a way back when a filter matches nothing', async () => {
			const user = userEvent.setup()
			render(<AnalyticsOverview games={manyGames()} />)

			const filter = screen.getByRole('searchbox', { name: 'Filter games by name' })
			await user.type(filter, 'zzzz')

			expect(screen.getByText(/No games match/)).toBeInTheDocument()

			await user.click(screen.getByRole('button', { name: 'Clear filter' }))

			expect(rowSlugs()).toHaveLength(10)
		})
	})

	describe('accessibility', () => {
		it('gives the page a level-one heading', () => {
			render(<AnalyticsOverview games={MY_GAMES_SUMMARIES} />)

			expect(
				screen.getByRole('heading', { level: 1, name: 'Analytics' }),
			).toBeInTheDocument()
		})

		it('announces row changes politely', () => {
			const { container } = render(
				<AnalyticsOverview games={MY_GAMES_SUMMARIES} />,
			)

			const live = container.querySelector('[aria-live="polite"]')

			expect(live).not.toBeNull()
			expect(within(live as HTMLElement).getAllByRole('link').length).toBe(3)
		})
	})
})
