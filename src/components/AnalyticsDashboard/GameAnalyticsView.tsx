'use client'

// Module imports
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useStore } from 'statery'

// Local imports
import * as API from '@/helpers/API'
import { type AnalyticsRange } from '@/helpers/analytics/constants'
import { Container } from '@/components/Container/Container'
import { DashboardHeader } from '@/components/DashboardHeader/DashboardHeader'
import { type GameAnalytics } from '@/helpers/analytics/types'
import { GameAnalyticsPanel } from '@/components/AnalyticsDashboard/GameAnalyticsPanel'
import { RangeSelector } from '@/components/AnalyticsDashboard/RangeSelector'
import { Skeleton } from '@/components/ui/skeleton'
import { store } from '@/store/store'

type Props = Readonly<{
	slug: string
	/** Injected in tests; production reads from the API. */
	analytics?: GameAnalytics | null
}>

function LoadingState() {
	return (
		<div className={'flex flex-col gap-6'}>
			<div className={'grid grid-cols-2 gap-4 lg:grid-cols-4'}>
				{Array.from({ length: 4 }).map((_, index) => (
					<Skeleton key={index} className={'h-[92px] rounded-lg'} />
				))}
			</div>
			<Skeleton className={'h-[320px] rounded-xl'} />
			<Skeleton className={'h-[320px] rounded-xl'} />
		</div>
	)
}

/**
 * Per-game analytics view: fetches the payload for `slug` at the selected range
 * and hands it to {@link GameAnalyticsPanel}. Fetches client-side, matching the
 * rest of the dashboard.
 */
export function GameAnalyticsView(props: Props) {
	const { slug, analytics: injectedAnalytics } = props
	const isControlled = injectedAnalytics !== undefined

	const { user } = useStore(store)

	const [range, setRange] = useState<AnalyticsRange>('30d')
	const [analytics, setAnalytics] = useState<GameAnalytics | null>(
		injectedAnalytics ?? null,
	)
	const [isLoading, setIsLoading] = useState(!isControlled)

	const loadData = useCallback(async () => {
		if (isControlled || !user) {
			return
		}

		setIsLoading(true)

		try {
			const result = await API.getGameAnalytics(slug, range)
			setAnalytics(result)
		} catch {
			setAnalytics(null)
		} finally {
			setIsLoading(false)
		}
	}, [isControlled, range, slug, user])

	useEffect(() => {
		loadData()
	}, [loadData])

	const breadcrumbs = useMemo(
		() => [
			{ label: 'Analytics', url: '/dashboard/analytics' },
			{
				label: analytics?.name ?? slug,
				url: `/dashboard/analytics/${slug}`,
			},
		],
		[analytics?.name, slug],
	)

	if (!isControlled && !user) {
		return (
			<>
				<DashboardHeader breadcrumbs={breadcrumbs} />
				<Container>
					<div className={'flex flex-col items-center gap-4 py-16 text-center'}>
						<p className={'text-muted-foreground'}>
							{'You must be signed in to view analytics.'}
						</p>
					</div>
				</Container>
			</>
		)
	}

	return (
		<>
			<DashboardHeader breadcrumbs={breadcrumbs} />

			<Container>
				<div className={'flex flex-col gap-6'}>
					<div className={'flex flex-wrap items-center justify-between gap-3'}>
						<h1 className={'text-lg font-semibold'}>
							{analytics?.name ?? slug}
						</h1>

						<RangeSelector
							range={range}
							onRangeChange={setRange}
							disabled={isLoading}
						/>
					</div>

					{isLoading ? (
						<LoadingState />
					) : (
						<GameAnalyticsPanel analytics={analytics} />
					)}
				</div>
			</Container>
		</>
	)
}
