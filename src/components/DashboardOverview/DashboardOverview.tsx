'use client'

// Module imports
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useStore } from 'statery'
import {
	ArrowRight,
	Check,
	Clock,
	Gamepad2,
	BarChart3,
	TrendingUp,
	X,
} from 'lucide-react'

// Local imports
import * as API from '@/helpers/API'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { type ClaimView } from '@/helpers/API'
import { Container } from '@/components/Container/Container'
import { DashboardHeader } from '@/components/DashboardHeader/DashboardHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { store } from '@/store/store'

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
	if (diffDays < 7) return `${diffDays}d ago`
	if (diffDays < 30) {
		const weeks = Math.floor(diffDays / 7)
		return `${weeks}w ago`
	}

	return date.toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
	})
}

function StatusIcon({ status }: { status: 'pending' | 'approved' | 'denied' }) {
	if (status === 'approved') {
		return <Check className={'size-3.5 text-success'} />
	}
	if (status === 'denied') {
		return <X className={'size-3.5 text-destructive'} />
	}
	return <Clock className={'size-3.5 text-muted-foreground'} />
}

export function DashboardOverview() {
	const { user } = useStore(store)

	const [gameCount, setGameCount] = useState<number | null>(null)
	const [claims, setClaims] = useState<ClaimView[] | null>(null)
	const [isLoadingGames, setIsLoadingGames] = useState(true)
	const [isLoadingClaims, setIsLoadingClaims] = useState(true)

	const breadcrumbs = useMemo(
		() => [{ label: 'Overview', url: '/dashboard' }],
		[],
	)

	const loadData = useCallback(async () => {
		if (!user) return

		setIsLoadingGames(true)
		setIsLoadingClaims(true)

		const gamesPromise = API.getGameCount(user.did)
			.then((result) => setGameCount(result.count))
			.catch(() => setGameCount(0))
			.finally(() => setIsLoadingGames(false))

		const claimsPromise = API.listClaims({ limit: 5 })
			.then((result) => setClaims(result.claims))
			.catch(() => setClaims([]))
			.finally(() => setIsLoadingClaims(false))

		await Promise.all([gamesPromise, claimsPromise])
	}, [user])

	useEffect(() => {
		loadData()
	}, [loadData])

	const claimCounts = useMemo(() => {
		if (!claims) return null
		return {
			pending: claims.filter((c) => getClaimStatus(c) === 'pending').length,
			approved: claims.filter((c) => getClaimStatus(c) === 'approved').length,
			denied: claims.filter((c) => getClaimStatus(c) === 'denied').length,
		}
	}, [claims])

	return (
		<>
			<DashboardHeader breadcrumbs={breadcrumbs} />

			<Container>
				<div className={'flex flex-col gap-8'}>
					{/* Quick stats row */}
					<div className={'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'}>
						{/* Games */}
						<Link
							href={'/dashboard/catalog'}
							className={'group flex items-start gap-4 rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40'}>
							<div className={'flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10'}>
								<Gamepad2 className={'size-5 text-primary'} />
							</div>

							<div className={'flex min-w-0 flex-col gap-1'}>
								{isLoadingGames ? (
									<>
										<Skeleton className={'h-7 w-16'} />
										<Skeleton className={'h-4 w-24'} />
									</>
								) : (
									<>
										<span className={'text-2xl font-semibold tabular-nums tracking-tight'}>
											{gameCount}
										</span>
										<span className={'text-sm text-muted-foreground'}>
											{gameCount === 1 ? 'Game' : 'Games'} in catalog
										</span>
									</>
								)}
							</div>

							<ArrowRight className={'ml-auto mt-1 size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100'} />
						</Link>

						{/* Claims summary */}
						<Link
							href={'/dashboard/claims'}
							className={'group flex items-start gap-4 rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40'}>
							<div className={'flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10'}>
								<Check className={'size-5 text-primary'} />
							</div>

							<div className={'flex min-w-0 flex-col gap-1'}>
								{isLoadingClaims ? (
									<>
										<Skeleton className={'h-7 w-16'} />
										<Skeleton className={'h-4 w-32'} />
									</>
								) : (
									<>
										<span className={'text-2xl font-semibold tabular-nums tracking-tight'}>
											{claims?.length ?? 0}
										</span>
										<span className={'text-sm text-muted-foreground'}>
											{claims?.length === 1 ? 'Claim' : 'Claims'} filed
										</span>
									</>
								)}
							</div>

							<ArrowRight className={'ml-auto mt-1 size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100'} />
						</Link>

						{/* Analytics placeholder */}
						<div className={'flex items-start gap-4 rounded-lg border border-dashed border-border bg-card/50 p-5'}>
							<div className={'flex size-10 shrink-0 items-center justify-center rounded-md bg-muted'}>
								<BarChart3 className={'size-5 text-muted-foreground'} />
							</div>

							<div className={'flex min-w-0 flex-col gap-1'}>
								<span className={'text-sm font-medium text-muted-foreground'}>
									Analytics
								</span>
								<span className={'text-xs text-muted-foreground/70'}>
									Coming soon
								</span>
							</div>
						</div>
					</div>

					{/* Content sections */}
					<div className={'grid grid-cols-1 gap-6 lg:grid-cols-2'}>
						{/* Recent claims */}
						<div className={'flex flex-col gap-3'}>
							<div className={'flex items-center justify-between'}>
								<h2 className={'text-sm font-medium'}>Claims</h2>
								<Button
									asChild
									size={'sm'}
									variant={'ghost'}
									className={'h-auto px-2 py-1 text-xs'}>
									<Link href={'/dashboard/claims'}>
										View all
										<ArrowRight className={'ml-1 size-3'} />
									</Link>
								</Button>
							</div>

							{isLoadingClaims ? (
								<div className={'flex flex-col gap-2'}>
									{Array.from({ length: 3 }).map((_, i) => (
										<div
											key={i}
											className={'flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3'}>
											<Skeleton className={'size-3.5 rounded-full'} />
											<Skeleton className={'h-4 flex-1'} />
											<Skeleton className={'h-3 w-12'} />
										</div>
									))}
								</div>
							) : claims && claims.length > 0 ? (
								<>
									<div className={'flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border'}>
										{claims.map((claim) => {
											const status = getClaimStatus(claim)
											const label = (() => {
												if (claim.type === 'org') return 'Organization Claim'
												const games = Array.isArray(claim.games) ? claim.games : []
												if (games.length === 1) return games[0].name
												if (games.length === 2) return games.map((g) => g.name).join(' & ')
												if (games.length > 2) return `${games[0].name}, ${games[1].name} +${games.length - 2} more`
												return 'Game Claim'
											})()

											return (
												<Link
													key={claim.uri}
													href={`/claim/detail?uri=${encodeURIComponent(claim.uri)}`}
													className={'flex items-center gap-3 bg-card px-4 py-3 transition-colors hover:bg-accent'}>
													<StatusIcon status={status} />

													<span className={'min-w-0 flex-1 truncate text-sm'}>
														{label}
													</span>

													<span className={'shrink-0 text-xs text-muted-foreground'}>
														{formatRelativeDate(claim.createdAt)}
													</span>
												</Link>
											)
										})}
									</div>

									{claimCounts && (
										<div className={'flex items-center gap-3 text-xs text-muted-foreground'}>
											{claimCounts.pending > 0 && (
												<span className={'flex items-center gap-1'}>
													<Clock className={'size-3'} />
													{claimCounts.pending} pending
												</span>
											)}
											{claimCounts.approved > 0 && (
												<span className={'flex items-center gap-1'}>
													<Check className={'size-3 text-success'} />
													{claimCounts.approved} approved
												</span>
											)}
											{claimCounts.denied > 0 && (
												<span className={'flex items-center gap-1'}>
													<X className={'size-3 text-destructive'} />
													{claimCounts.denied} denied
												</span>
											)}
										</div>
									)}
								</>
							) : (
								<div className={'flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-8 text-center'}>
									<p className={'text-sm text-muted-foreground'}>
										No claims yet
									</p>
									<Button
										asChild
										size={'sm'}
										variant={'outline'}>
										<Link href={'/claim'}>File a claim</Link>
									</Button>
								</div>
							)}
						</div>

						{/* Analytics placeholder section */}
						<div className={'flex flex-col gap-3'}>
							<div className={'flex items-center justify-between'}>
								<h2 className={'text-sm font-medium'}>Performance</h2>
								<Badge
									variant={'outline'}
									className={'text-xs font-normal'}>
									Coming soon
								</Badge>
							</div>

							<div className={'flex flex-col gap-4 rounded-lg border border-dashed border-border p-6'}>
								<div className={'flex items-center gap-3'}>
									<TrendingUp className={'size-5 text-muted-foreground/50'} />
									<div className={'flex flex-col gap-0.5'}>
										<span className={'text-sm text-muted-foreground'}>
											Page views, wishlists, and engagement
										</span>
										<span className={'text-xs text-muted-foreground/70'}>
											Track how players discover and interact with your games
										</span>
									</div>
								</div>

								<div className={'grid grid-cols-3 gap-3'}>
									{['Views', 'Wishlists', 'Reviews'].map((metric) => (
										<div
											key={metric}
											className={'flex flex-col items-center gap-1 rounded-md bg-muted/50 py-3'}>
											<span className={'text-lg font-medium text-muted-foreground/40'}>
												--
											</span>
											<span className={'text-xs text-muted-foreground/50'}>
												{metric}
											</span>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</Container>
		</>
	)
}
