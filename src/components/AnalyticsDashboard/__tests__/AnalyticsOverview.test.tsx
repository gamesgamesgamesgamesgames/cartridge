// @vitest-environment happy-dom

// Module imports
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

// Local imports
import { AnalyticsOverview } from '@/components/AnalyticsDashboard/AnalyticsOverview'
import { MY_GAMES_SUMMARIES } from '@/components/AnalyticsDashboard/__tests__/fixtures'

describe('AnalyticsOverview', () => {
	it('renders a row per owned game', () => {
		render(<AnalyticsOverview games={MY_GAMES_SUMMARIES} />)

		expect(screen.getByText('Starbound Drifter')).toBeInTheDocument()
		expect(screen.getByText('Nebula Knight')).toBeInTheDocument()
		expect(screen.getByText('Pixel Forge')).toBeInTheDocument()

		const rows = screen
			.getAllByRole('link')
			.filter((link) =>
				link.getAttribute('href')?.startsWith('/dashboard/analytics/'),
			)
		expect(rows).toHaveLength(MY_GAMES_SUMMARIES.length)
	})

	it('sorts rows by impressions descending', () => {
		render(<AnalyticsOverview games={MY_GAMES_SUMMARIES} />)

		const orderedSlugs = screen
			.getAllByRole('link')
			.map((link) => link.getAttribute('href'))
			.filter((href): href is string =>
				Boolean(href?.startsWith('/dashboard/analytics/')),
			)

		expect(orderedSlugs).toEqual([
			'/dashboard/analytics/starbound-drifter',
			'/dashboard/analytics/nebula-knight',
			'/dashboard/analytics/pixel-forge',
		])
	})

	it('renders headline metrics for a row', () => {
		render(<AnalyticsOverview games={MY_GAMES_SUMMARIES} />)

		// Starbound Drifter: impressions 48,250 → 48.3k, ctr 0.0647 → 6.5%
		expect(screen.getByText('48.3k')).toBeInTheDocument()
		expect(screen.getByText('6.5%')).toBeInTheDocument()
	})

	it('shows the empty state when there are no games', () => {
		render(<AnalyticsOverview games={[]} />)

		expect(screen.getByText('No analytics yet')).toBeInTheDocument()
	})
})
