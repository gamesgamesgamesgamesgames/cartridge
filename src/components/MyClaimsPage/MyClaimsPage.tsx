'use client'

// Module imports
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from 'statery'

// Local imports
import * as API from '@/helpers/API'
import { type ClaimView } from '@/helpers/API'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/Container/Container'
import { DashboardHeader } from '@/components/DashboardHeader/DashboardHeader'
import {
	faCheck,
	faClock,
	faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Spinner } from '@/components/ui/spinner'
import { store } from '@/store/store'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

// Types
type StatusFilter = 'all' | 'pending' | 'approved' | 'denied'

// Helpers
function parseAtUri(uri: string): { did: string; rkey: string } | null {
	const match = uri.match(/^at:\/\/([^/]+)\/[^/]+\/([^/]+)$/)
	if (!match) return null
	return { did: match[1], rkey: match[2] }
}

function getClaimStatus(claim: ClaimView): 'pending' | 'approved' | 'denied' {
	if (!claim.review) return 'pending'
	if (claim.review.status === 'approved') return 'approved'
	if (claim.review.status === 'denied') return 'denied'
	return 'pending'
}

function formatRelativeDate(dateString: string): string {
	const date = new Date(dateString)
	const now = new Date()
	const diffMs = now.getTime() - date.getTime()
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

	if (diffDays === 0) return 'Today'
	if (diffDays === 1) return 'Yesterday'
	if (diffDays < 7) return `${diffDays} days ago`
	if (diffDays < 30) {
		const weeks = Math.floor(diffDays / 7)
		return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`
	}

	return date.toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	})
}

function getClaimLabel(claim: ClaimView): string {
	if (claim.type === 'game' && claim.games?.length) {
		const names = claim.games.map((g) => g.name)
		if (names.length === 1) return names[0]
		if (names.length === 2) return names.join(' & ')
		return `${names[0]}, ${names[1]} +${names.length - 2} more`
	}

	if (claim.type === 'org') return 'Organization Claim'

	return 'Game Claim'
}

function StatusBadge({ status }: { status: 'pending' | 'approved' | 'denied' }) {
	if (status === 'approved') {
		return (
			<Badge className={'border-green-600/30 bg-green-600/10 text-green-600 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400'}>
				<FontAwesomeIcon icon={faCheck} className={'mr-1 size-3'} />
				{'Approved'}
			</Badge>
		)
	}

	if (status === 'denied') {
		return (
			<Badge variant={'destructive'}>
				<FontAwesomeIcon icon={faXmark} className={'mr-1 size-3'} />
				{'Denied'}
			</Badge>
		)
	}

	return (
		<Badge variant={'outline'}>
			<FontAwesomeIcon icon={faClock} className={'mr-1 size-3'} />
			{'Pending'}
		</Badge>
	)
}

export function MyClaimsPage() {
	const { user } = useStore(store)
	const router = useRouter()

	const [claims, setClaims] = useState<ClaimView[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [loadError, setLoadError] = useState<string | null>(null)
	const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
	const [cursor, setCursor] = useState<string | undefined>(undefined)
	const [isLoadingMore, setIsLoadingMore] = useState(false)
	const fetchIdRef = useRef(0)

	const breadcrumbs = useMemo(
		() => [{ label: 'My Claims', url: '/dashboard/claims' }],
		[],
	)

	const fetchClaims = useCallback(async (status: StatusFilter) => {
		const fetchId = ++fetchIdRef.current
		setIsLoading(true)
		setLoadError(null)

		try {
			const result = await API.listClaims(
				status === 'all' ? undefined : { status },
			)
			if (fetchId !== fetchIdRef.current) return
			setClaims(result.claims)
			setCursor(result.cursor)
		} catch (error) {
			if (fetchId !== fetchIdRef.current) return
			setLoadError(
				error instanceof Error
					? error.message
					: 'Failed to load claims. Please try again.',
			)
		} finally {
			if (fetchId === fetchIdRef.current) {
				setIsLoading(false)
			}
		}
	}, [])

	const loadMore = useCallback(async () => {
		if (!cursor || isLoadingMore) return

		setIsLoadingMore(true)

		try {
			const result = await API.listClaims({
				...(statusFilter !== 'all' ? { status: statusFilter } : {}),
				cursor,
			})
			setClaims((prev) => [...prev, ...result.claims])
			setCursor(result.cursor)
		} catch {
			// Keep existing results on error
		} finally {
			setIsLoadingMore(false)
		}
	}, [cursor, isLoadingMore, statusFilter])

	useEffect(() => {
		if (!user) return
		fetchClaims(statusFilter)
	}, [user, statusFilter, fetchClaims])

	const handleRetry = useCallback(() => {
		fetchClaims(statusFilter)
	}, [fetchClaims, statusFilter])

	const handleClaimClick = useCallback(
		(uri: string) => {
			const parsed = parseAtUri(uri)
			if (!parsed) return
			router.push(`/claim/${parsed.did}/${parsed.rkey}`)
		},
		[router],
	)

	const handleFilterChange = useCallback((value: string) => {
		if (value) {
			setStatusFilter(value as StatusFilter)
		}
	}, [])

	const handleShowAll = useCallback(() => {
		setStatusFilter('all')
	}, [])

	if (!user) {
		return (
			<>
				<DashboardHeader breadcrumbs={breadcrumbs} />
				<Container>
					<div className={'flex flex-col items-center gap-4 py-16 text-center'}>
						<p className={'text-muted-foreground'}>
							{'You must be signed in to view your claims.'}
						</p>
					</div>
				</Container>
			</>
		)
	}

	const statusLabel = statusFilter === 'all'
		? `${claims.length} claim${claims.length !== 1 ? 's' : ''}`
		: `${claims.length} ${statusFilter}`

	return (
		<>
			<DashboardHeader
				breadcrumbs={breadcrumbs}
				controls={
					<Button
						asChild
						size={'sm'}>
						<Link href={'/dashboard/claim'}>{'New Claim'}</Link>
					</Button>
				}
			/>

			<Container>
				<div className={'flex flex-col gap-6'}>
					<ToggleGroup
						type={'single'}
						value={statusFilter}
						onValueChange={handleFilterChange}
						variant={'outline'}
						size={'sm'}>
						<ToggleGroupItem value={'all'}>{'All'}</ToggleGroupItem>
						<ToggleGroupItem value={'pending'}>{'Pending'}</ToggleGroupItem>
						<ToggleGroupItem value={'approved'}>{'Approved'}</ToggleGroupItem>
						<ToggleGroupItem value={'denied'}>{'Denied'}</ToggleGroupItem>
					</ToggleGroup>

					<div aria-live={'polite'} aria-atomic={'true'}>
						{isLoading && (
							<div className={'flex items-center justify-center py-16'}>
								<Spinner className={'size-6'} />
							</div>
						)}

						{!isLoading && loadError && (
							<div className={'flex flex-col items-center gap-3 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-6'}>
								<p className={'text-sm text-destructive'}>{loadError}</p>
								<Button
									onClick={handleRetry}
									size={'sm'}
									variant={'outline'}>
									{'Try again'}
								</Button>
							</div>
						)}

						{!isLoading && !loadError && claims.length === 0 && (
							<div className={'flex flex-col items-center gap-4 py-16 text-center'}>
								{statusFilter === 'all' ? (
									<>
										<div className={'flex flex-col gap-2'}>
											<p className={'text-muted-foreground'}>
												{"You haven't submitted any claims yet."}
											</p>
											<p className={'text-muted-foreground text-xs max-w-sm'}>
												{'Claims verify your ownership of a game or organization on Cartridge. Once approved, you can manage its page directly.'}
											</p>
										</div>

										<Button
											asChild
											variant={'outline'}>
											<Link href={'/dashboard/claim'}>
												{'Submit Your First Claim'}
											</Link>
										</Button>
									</>
								) : (
									<>
										<p className={'text-muted-foreground'}>
											{`No ${statusFilter} claims.`}
										</p>

										<Button
											onClick={handleShowAll}
											size={'sm'}
											variant={'ghost'}>
											{'Show all claims'}
										</Button>
									</>
								)}
							</div>
						)}

						{!isLoading && !loadError && claims.length > 0 && (
							<>
								<p className={'text-xs text-muted-foreground'}>
									{statusLabel}{cursor ? '+' : ''}
								</p>

								<div className={'mt-2 flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border'}>
									{claims.map((claim) => {
										const status = getClaimStatus(claim)
										const label = getClaimLabel(claim)
										const gameCount = claim.games?.length ?? 0

										return (
											<button
												key={claim.uri}
												type={'button'}
												onClick={() => handleClaimClick(claim.uri)}
												className={'flex w-full items-center justify-between gap-4 bg-background px-4 py-4 text-left transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none'}>
												<div className={'flex min-w-0 flex-col gap-1'}>
													<span className={'truncate text-sm font-medium'}>
														{label}
													</span>

													<div className={'flex items-center gap-3 text-xs text-muted-foreground'}>
														<span>
															{claim.type === 'game'
																? `${gameCount} ${gameCount === 1 ? 'game' : 'games'}`
																: 'Organization'}
														</span>
														<span>{formatRelativeDate(claim.createdAt)}</span>
													</div>
												</div>

												<div className={'shrink-0'}>
													<StatusBadge status={status} />
												</div>
											</button>
										)
									})}
								</div>

								{cursor && (
									<Button
										className={'mt-4 w-full'}
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
							</>
						)}
					</div>
				</div>
			</Container>
		</>
	)
}
