'use client'

// Module imports
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from 'statery'

// Local imports
import * as API from '@/helpers/API'
import { type VerificationRequestView } from '@/helpers/API'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/Container/Container'
import { Header } from '@/components/Header/Header'
import { Spinner } from '@/components/ui/spinner'
import { UnderlineTabs } from '@/components/UnderlineTabs/UnderlineTabs'
import { isAdmin } from '@/helpers/admin'
import { store } from '@/store/store'
import { ACCOUNT_TYPE_LABELS } from '@/constants/ACCOUNT_TYPES'

// Types
type StatusFilter = 'all' | 'pending' | 'approved' | 'denied'

export function AdminVerificationRequestsPage() {
	const { user } = useStore(store)
	const router = useRouter()

	const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
	const [requests, setRequests] = useState<VerificationRequestView[]>([])
	const [cursor, setCursor] = useState<string | undefined>(undefined)
	const [hasMore, setHasMore] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	const [isLoadingMore, setIsLoadingMore] = useState(false)
	const [profiles, setProfiles] = useState<Record<string, { handle?: string; displayName?: string }>>({})

const fetchRequests = useCallback(
		async (filter: StatusFilter, nextCursor?: string) => {
			const options: Parameters<typeof API.listVerificationRequests>[0] = { limit: 25 }
			if (filter !== 'all') {
				options.status = filter
			}
			if (nextCursor) {
				options.cursor = nextCursor
			}

			return API.listVerificationRequests(options)
		},
		[],
	)

	const resolveProfiles = useCallback(
		async (dids: string[]) => {
			const unknown = dids.filter((did) => !profiles[did])
			if (!unknown.length) return

			const resolved = await Promise.all(
				unknown.map(async (did) => {
					try {
						const result = await API.getProfileByHandle(did)
						return {
							did,
							handle: result.handle,
							displayName: result.profile?.displayName,
						}
					} catch {
						return { did }
					}
				}),
			)

			setProfiles((prev) => {
				const next = { ...prev }
				for (const entry of resolved) {
					next[entry.did] = { handle: entry.handle, displayName: entry.displayName }
				}
				return next
			})
		},
		[profiles],
	)

	const loadInitial = useCallback(
		async (filter: StatusFilter) => {
			setIsLoading(true)
			setRequests([])
			setCursor(undefined)
			setHasMore(false)

			try {
				const result = await fetchRequests(filter)
				setRequests(result.requests)
				setCursor(result.cursor)
				setHasMore(Boolean(result.cursor))
				resolveProfiles(result.requests.map((r) => r.requesterDid))
			} finally {
				setIsLoading(false)
			}
		},
		[fetchRequests, resolveProfiles],
	)

	const loadMore = useCallback(async () => {
		if (!cursor || isLoadingMore) return
		setIsLoadingMore(true)

		try {
			const result = await fetchRequests(statusFilter, cursor)
			setRequests((prev) => [...prev, ...result.requests])
			setCursor(result.cursor)
			setHasMore(Boolean(result.cursor))
			resolveProfiles(result.requests.map((r) => r.requesterDid))
		} finally {
			setIsLoadingMore(false)
		}
	}, [cursor, fetchRequests, isLoadingMore, resolveProfiles, statusFilter])

	const handleFilterChange = useCallback(
		(value: string) => {
			const filter = value as StatusFilter
			setStatusFilter(filter)
			loadInitial(filter)
		},
		[loadInitial],
	)

	useEffect(() => {
		loadInitial('all')
	}, [loadInitial])

	const requestsList = useMemo(() => {
		if (isLoading) {
			return (
				<div className={'flex items-center justify-center py-12'}>
					<Spinner className={'size-6'} />
				</div>
			)
		}

		if (!requests.length) {
			return (
				<div className={'flex items-center justify-center py-12'}>
					<p className={'text-muted-foreground text-sm'}>{'No verification requests found.'}</p>
				</div>
			)
		}

		return (
			<div className={'flex flex-col divide-y divide-border rounded-lg border border-border overflow-hidden'}>
				{requests.map((request) => {
					const date = new Date(request.createdAt).toLocaleDateString(undefined, {
						year: 'numeric',
						month: 'short',
						day: 'numeric',
					})
					const profile = profiles[request.requesterDid]

					return (
						<button
							key={request.id}
							type={'button'}
							onClick={() => router.push(`/admin/verification-requests/${request.id}`)}
							className={'w-full text-left px-4 py-3 flex items-center gap-4 hover:bg-accent transition-colors bg-background focus-visible:bg-accent focus-visible:outline-none'}>
							<div className={'flex-1 flex flex-col gap-0.5 min-w-0'}>
								<div className={'flex items-center gap-2 flex-wrap'}>
									<span className={'text-xs font-medium uppercase tracking-wide text-muted-foreground'}>
										{ACCOUNT_TYPE_LABELS[request.accountType]}
									</span>
									<StatusBadge status={request.status} />
								</div>

								<p className={'text-sm font-medium truncate'}>
									{profile?.displayName ?? profile?.handle ?? request.requesterDid}
								</p>

								{profile?.handle && (
									<p className={'text-xs text-muted-foreground truncate'}>
										{`@${profile.handle}`}
									</p>
								)}

								<div className={'flex items-center gap-2'}>
									<p className={'text-xs text-muted-foreground font-mono truncate'}>
										{request.requesterDid}
									</p>
									<span className={'text-xs text-muted-foreground'}>{'·'}</span>
									<p className={'text-xs text-muted-foreground shrink-0'}>{date}</p>
								</div>
							</div>
						</button>
					)
				})}
			</div>
		)
	}, [isLoading, profiles, requests, router])

	// Auth guard — after all hooks
	if (user !== null && !isAdmin(user)) {
		router.replace('/')
		return null
	}

	return (
		<Container>
				<div className={'flex flex-col gap-6'}>
					<div className={'flex flex-col gap-2'}>
						<Header level={3}>{'Verification Requests'}</Header>
						<p className={'text-muted-foreground text-sm'}>
							{'Review verification requests from studios, developers, and publishers.'}
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

					{requestsList}

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
	)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: string }) {
	if (status === 'approved') {
		return (
			<Badge className={'bg-success text-success-foreground border-transparent'}>
				{'Approved'}
			</Badge>
		)
	}

	if (status === 'denied') {
		return <Badge variant={'destructive'}>{'Denied'}</Badge>
	}

	return <Badge variant={'outline'}>{'Pending'}</Badge>
}
