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
import { isAdmin } from '@/helpers/admin'
import { parseATURI } from '@/helpers/parseATURI'
import { store } from '@/store/store'
import { type ClaimView } from '@/helpers/API'
import { type AtUriString } from '@atproto/lex'

// Types
type StatusFilter = 'all' | 'pending' | 'approved' | 'denied'

export function AdminClaimsPage() {
	const { user } = useStore(store)
	const router = useRouter()

	const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
	const [claims, setClaims] = useState<ClaimView[]>([])
	const [cursor, setCursor] = useState<string | undefined>(undefined)
	const [hasMore, setHasMore] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	const [isLoadingMore, setIsLoadingMore] = useState(false)

	const breadcrumbs = useMemo(
		() => [
			{ label: 'Admin', url: '/dashboard/admin' },
			{ label: 'Claims', url: '/dashboard/admin/claims' },
		],
		[],
	)

	const fetchClaims = useCallback(
		async (filter: StatusFilter, nextCursor?: string) => {
			const options: Parameters<typeof API.listClaims>[0] = { limit: 25 }
			if (filter !== 'all') {
				options.status = filter
			}
			if (nextCursor) {
				options.cursor = nextCursor
			}

			const result = await API.listClaims(options)
			return result
		},
		[],
	)

	const loadInitial = useCallback(
		async (filter: StatusFilter) => {
			setIsLoading(true)
			setClaims([])
			setCursor(undefined)
			setHasMore(false)

			try {
				const result = await fetchClaims(filter)
				setClaims(result.claims)
				setCursor(result.cursor)
				setHasMore(Boolean(result.cursor))
			} finally {
				setIsLoading(false)
			}
		},
		[fetchClaims],
	)

	const loadMore = useCallback(async () => {
		if (!cursor || isLoadingMore) return
		setIsLoadingMore(true)

		try {
			const result = await fetchClaims(statusFilter, cursor)
			setClaims((prev) => [...prev, ...result.claims])
			setCursor(result.cursor)
			setHasMore(Boolean(result.cursor))
		} finally {
			setIsLoadingMore(false)
		}
	}, [cursor, fetchClaims, isLoadingMore, statusFilter])

	const handleFilterChange = useCallback(
		(value: string) => {
			const filter = value as StatusFilter
			setStatusFilter(filter)
			loadInitial(filter)
		},
		[loadInitial],
	)

	const handleClaimClick = useCallback(
		(uri: AtUriString) => {
			const { did, rkey } = parseATURI(uri)
			router.push(`/dashboard/admin/claims/${did}/${rkey}`)
		},
		[router],
	)

	useEffect(() => {
		loadInitial('all')
	}, [loadInitial])

	const claimsList = useMemo(() => {
		if (isLoading) {
			return (
				<div className={'flex items-center justify-center py-12'}>
					<Spinner className={'size-6'} />
				</div>
			)
		}

		if (!claims.length) {
			return (
				<div className={'flex items-center justify-center py-12'}>
					<p className={'text-muted-foreground text-sm'}>{'No claims found.'}</p>
				</div>
			)
		}

		return (
			<div className={'flex flex-col divide-y divide-border rounded-lg border border-border overflow-hidden'}>
				{claims.map((claim) => {
					const date = new Date(claim.createdAt).toLocaleDateString(undefined, {
						year: 'numeric',
						month: 'short',
						day: 'numeric',
					})

					return (
						<button
							key={claim.uri}
							type={'button'}
							onClick={() => handleClaimClick(claim.uri as AtUriString)}
							className={'w-full text-left px-4 py-3 flex items-center gap-4 hover:bg-accent transition-colors bg-background'}>
							<div className={'flex-1 flex flex-col gap-0.5 min-w-0'}>
								<div className={'flex items-center gap-2 flex-wrap'}>
									<span className={'text-xs font-medium uppercase tracking-wide text-muted-foreground'}>
										{claim.type === 'org' ? 'Organization' : 'Game'}
									</span>
									<StatusBadge status={claim.review?.status ?? 'pending'} />
								</div>

								<p className={'text-sm font-medium font-mono truncate'}>
									{claim.claimantDid}
								</p>

								<p className={'text-xs text-muted-foreground'}>{date}</p>
							</div>
						</button>
					)
				})}
			</div>
		)
	}, [claims, handleClaimClick, isLoading])

	// Auth guard — after all hooks
	if (user !== null && !isAdmin(user?.did)) {
		router.replace('/')
		return null
	}

	return (
		<>
			<DashboardHeader breadcrumbs={breadcrumbs} />

			<Container>
				<div className={'flex flex-col gap-6'}>
					<div className={'flex flex-col gap-2'}>
						<h1 className={'text-2xl font-bold'}>{'Claims'}</h1>
						<p className={'text-muted-foreground text-sm'}>
							{'Review and manage ownership claims submitted by developers and publishers.'}
						</p>
					</div>

					<UnderlineTabs
						tabs={[
							{ id: 'all', label: 'All' },
							{ id: 'pending', label: 'Pending' },
							{ id: 'approved', label: 'Approved' },
							{ id: 'denied', label: 'Denied' },
						]}
						value={statusFilter}
						onValueChange={handleFilterChange}
					/>

					{claimsList}

					{hasMore && (
						<Button
							className={'w-full'}
							disabled={isLoadingMore}
							onClick={loadMore}
							variant={'outline'}>
							{isLoadingMore ? (
								<>
									<Spinner className={'size-4'} />
									{'Loading…'}
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

	return <Badge variant={'outline'}>{'Pending'}</Badge>
}
