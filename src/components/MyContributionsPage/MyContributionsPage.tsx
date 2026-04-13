'use client'

// Module imports
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from 'statery'

// Local imports
import * as API from '@/helpers/API'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/Container/Container'
import { DashboardHeader } from '@/components/DashboardHeader/DashboardHeader'
import { Spinner } from '@/components/ui/spinner'
import { UnderlineTabs } from '@/components/UnderlineTabs/UnderlineTabs'
import { store } from '@/store/store'
import { type ContributionView } from '@/helpers/API'

// Types
type StatusFilter = 'all' | 'pending' | 'approved' | 'denied' | 'needsRevision'

export function MyContributionsPage() {
	const { user } = useStore(store)
	const router = useRouter()

	const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
	const [contributions, setContributions] = useState<ContributionView[]>([])
	const [cursor, setCursor] = useState<string | undefined>(undefined)
	const [hasMore, setHasMore] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	const [isLoadingMore, setIsLoadingMore] = useState(false)

	const breadcrumbs = useMemo(
		() => [{ label: 'My Contributions', url: '/dashboard/contributions' }],
		[],
	)

	const fetchContributions = useCallback(
		async (filter: StatusFilter, nextCursor?: string) => {
			const options: Parameters<typeof API.listContributions>[0] = {
				limit: 25,
				contributor: user?.did,
			}
			if (filter !== 'all') {
				options.status = filter
			}
			if (nextCursor) {
				options.cursor = nextCursor
			}

			return API.listContributions(options)
		},
		[user?.did],
	)

	const loadInitial = useCallback(
		async (filter: StatusFilter) => {
			setIsLoading(true)
			setContributions([])
			setCursor(undefined)
			setHasMore(false)

			try {
				const result = await fetchContributions(filter)
				setContributions(result.contributions)
				setCursor(result.cursor)
				setHasMore(Boolean(result.cursor))
			} finally {
				setIsLoading(false)
			}
		},
		[fetchContributions],
	)

	const loadMore = useCallback(async () => {
		if (!cursor || isLoadingMore) return
		setIsLoadingMore(true)

		try {
			const result = await fetchContributions(statusFilter, cursor)
			setContributions((prev) => [...prev, ...result.contributions])
			setCursor(result.cursor)
			setHasMore(Boolean(result.cursor))
		} finally {
			setIsLoadingMore(false)
		}
	}, [cursor, fetchContributions, isLoadingMore, statusFilter])

	const handleFilterChange = useCallback(
		(value: string) => {
			const filter = value as StatusFilter
			setStatusFilter(filter)
			loadInitial(filter)
		},
		[loadInitial],
	)

	useEffect(() => {
		if (user?.did) {
			loadInitial('all')
		}
	}, [loadInitial, user?.did])

	const list = useMemo(() => {
		if (isLoading) {
			return (
				<div className={'flex items-center justify-center py-12'}>
					<Spinner className={'size-6'} />
				</div>
			)
		}

		if (!contributions.length) {
			return (
				<div className={'flex items-center justify-center py-12'}>
					<p className={'text-muted-foreground text-sm'}>
						{'No contributions found.'}
					</p>
				</div>
			)
		}

		return (
			<div className={'flex flex-col divide-y divide-border rounded-lg border border-border overflow-hidden'}>
				{contributions.map((contribution) => {
					const date = new Date(contribution.createdAt).toLocaleDateString(
						undefined,
						{ year: 'numeric', month: 'short', day: 'numeric' },
					)

					const status = contribution.review?.status ?? 'pending'

					return (
						<div
							key={contribution.uri}
							className={'w-full text-left px-4 py-3 flex items-center gap-4 bg-background'}>
							<div className={'flex-1 flex flex-col gap-0.5 min-w-0'}>
								<div className={'flex items-center gap-2 flex-wrap'}>
									<span className={'text-xs font-medium uppercase tracking-wide text-muted-foreground'}>
										{contribution.contributionType}
									</span>
									<StatusBadge status={status} />
								</div>

								{contribution.subjectName && (
									<p className={'text-sm font-medium'}>
										{contribution.subjectName}
									</p>
								)}

								<p className={'text-xs text-muted-foreground'}>{date}</p>

								{contribution.message && (
									<p className={'text-xs text-muted-foreground truncate mt-1'}>
										{contribution.message}
									</p>
								)}
							</div>
						</div>
					)
				})}
			</div>
		)
	}, [contributions, isLoading])

	if (!user) {
		return null
	}

	return (
		<>
			<DashboardHeader breadcrumbs={breadcrumbs} />

			<Container>
				<div className={'flex flex-col gap-6'}>
					<div className={'flex flex-col gap-2'}>
						<h1 className={'text-2xl font-bold'}>{'My Contributions'}</h1>
						<p className={'text-muted-foreground text-sm'}>
							{'Track the status of your suggested edits and contributions.'}
						</p>
					</div>

					<UnderlineTabs
						tabs={[
							{ id: 'all', label: 'All' },
							{ id: 'pending', label: 'Pending' },
							{ id: 'approved', label: 'Approved' },
							{ id: 'denied', label: 'Denied' },
							{ id: 'needsRevision', label: 'Needs Revision' },
						]}
						value={statusFilter}
						onValueChange={handleFilterChange}
					/>

					{list}

					{hasMore && (
						<Button
							className={'w-full'}
							disabled={isLoadingMore}
							onClick={loadMore}
							variant={'outline'}>
							{isLoadingMore ? (
								<>
									<Spinner className={'size-4'} />
									{'Loading...'}
								</>
							) : (
								'Load more'
							)}
						</Button>
					)}
				</div>
			</Container>
		</>
	)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: string }) {
	if (status === 'approved') {
		return (
			<Badge className={'bg-green-600 text-white border-transparent'}>
				{'Approved'}
			</Badge>
		)
	}

	if (status === 'denied') {
		return <Badge variant={'destructive'}>{'Denied'}</Badge>
	}

	if (status === 'needsRevision') {
		return <Badge variant={'outline'} className={'border-yellow-500 text-yellow-600'}>{'Needs Revision'}</Badge>
	}

	return <Badge variant={'outline'}>{'Pending'}</Badge>
}
