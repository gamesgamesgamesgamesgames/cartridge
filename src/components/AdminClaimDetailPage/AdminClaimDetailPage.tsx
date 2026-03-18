'use client'

// Module imports
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useStore } from 'statery'

// Local imports
import * as API from '@/helpers/API'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Container } from '@/components/Container/Container'
import { DashboardHeader } from '@/components/DashboardHeader/DashboardHeader'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { isAdmin } from '@/helpers/admin'
import { store } from '@/store/store'
import { type ClaimView, type GameSummaryView } from '@/helpers/API'

export function AdminClaimDetailPage() {
	const { user } = useStore(store)
	const router = useRouter()
	const params = useParams<{ did: string; rkey: string }>()

	const { did, rkey } = params

	const claimUri = `at://${did}/games.gamesgamesgamesgames.claim/${rkey}`

	const [claim, setClaim] = useState<ClaimView | null>(null)
	const [orgGames, setOrgGames] = useState<GameSummaryView[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [selectedGameUris, setSelectedGameUris] = useState<Set<string>>(new Set())
	const [reason, setReason] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [submitError, setSubmitError] = useState<string | null>(null)

	const breadcrumbs = useMemo(
		() => [
			{ label: 'Admin', url: '/admin' },
			{ label: 'Claims', url: '/admin/claims' },
			{ label: 'Review Claim', url: `/admin/claims/${did}/${rkey}` },
		],
		[did, rkey],
	)

	useEffect(() => {
		let cancelled = false

		async function load() {
			setIsLoading(true)

			const fetchedClaim = await API.getClaim(claimUri)
			if (cancelled) return

			setClaim(fetchedClaim)

			if (fetchedClaim?.type === 'org' && fetchedClaim.org) {
				const { games } = await API.listOrgGames(fetchedClaim.org)
				if (cancelled) return
				setOrgGames(games)
				setSelectedGameUris(new Set(games.map((g) => g.uri)))
			} else if (fetchedClaim?.type === 'game' && fetchedClaim.games?.length) {
				setSelectedGameUris(new Set(fetchedClaim.games.map((g) => g.uri)))
			}

			setIsLoading(false)
		}

		load()

		return () => {
			cancelled = true
		}
	}, [claimUri])

	const handleGameToggle = useCallback((uri: string, checked: boolean) => {
		setSelectedGameUris((prev) => {
			const next = new Set(prev)
			if (checked) {
				next.add(uri)
			} else {
				next.delete(uri)
			}
			return next
		})
	}, [])

	const handleApprove = useCallback(async () => {
		if (!claim) return
		setIsSubmitting(true)
		setSubmitError(null)

		try {
			await API.reviewClaim({
				claim: { uri: claim.uri, cid: claim.cid },
				status: 'approved',
				approvedGames: Array.from(selectedGameUris),
				...(reason.trim() ? { reason: reason.trim() } : {}),
			})
			router.push('/admin/claims')
		} catch (error) {
			setSubmitError(
				error instanceof Error ? error.message : 'An unexpected error occurred.',
			)
			setIsSubmitting(false)
		}
	}, [claim, reason, router, selectedGameUris])

	const handleDeny = useCallback(async () => {
		if (!claim) return
		setIsSubmitting(true)
		setSubmitError(null)

		try {
			await API.reviewClaim({
				claim: { uri: claim.uri, cid: claim.cid },
				status: 'denied',
				...(reason.trim() ? { reason: reason.trim() } : {}),
			})
			router.push('/admin/claims')
		} catch (error) {
			setSubmitError(
				error instanceof Error ? error.message : 'An unexpected error occurred.',
			)
			setIsSubmitting(false)
		}
	}, [claim, reason, router])

	// Auth guard — after all hooks
	if (user !== null && !isAdmin(user?.did)) {
		router.replace('/')
		return null
	}

	if (isLoading) {
		return (
			<>
				<DashboardHeader breadcrumbs={breadcrumbs} />
				<Container>
					<div className={'flex items-center justify-center py-16'}>
						<Spinner className={'size-6'} />
					</div>
				</Container>
			</>
		)
	}

	if (!claim) {
		return (
			<>
				<DashboardHeader breadcrumbs={breadcrumbs} />
				<Container>
					<div className={'flex items-center justify-center py-16'}>
						<p className={'text-muted-foreground text-sm'}>{'Claim not found.'}</p>
					</div>
				</Container>
			</>
		)
	}

	const isReviewed = Boolean(claim.review)
	const reviewStatus = claim.review?.status

	const displayDate = new Date(claim.createdAt).toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})

	const gamesForDisplay =
		claim.type === 'org' ? orgGames : (claim.games ?? [])

	return (
		<>
			<DashboardHeader breadcrumbs={breadcrumbs} />

			<Container>
				<div className={'flex flex-col gap-8 max-w-2xl'}>
					<div className={'flex flex-col gap-2'}>
						<div className={'flex items-center gap-3'}>
							<h1 className={'text-2xl font-bold'}>{'Review Claim'}</h1>
							{isReviewed && reviewStatus && (
								<ReviewStatusBadge status={reviewStatus} />
							)}
						</div>
						<p className={'text-xs text-muted-foreground font-mono break-all'}>
							{claimUri}
						</p>
					</div>

					{/* Claim details */}
					<div className={'rounded-lg border border-border bg-card flex flex-col divide-y divide-border overflow-hidden'}>
						<DetailRow label={'Claimant DID'}>
							<span className={'font-mono text-sm'}>{claim.claimantDid}</span>
						</DetailRow>

						<DetailRow label={'Type'}>
							<span className={'text-sm capitalize'}>{claim.type}</span>
						</DetailRow>

						{claim.contact && (
							<DetailRow label={'Contact'}>
								<span className={'text-sm'}>{claim.contact}</span>
							</DetailRow>
						)}

						<DetailRow label={'Submitted'}>
							<span className={'text-sm'}>{displayDate}</span>
						</DetailRow>

						{claim.message && (
							<DetailRow label={'Message'}>
								<p className={'text-sm whitespace-pre-wrap'}>{claim.message}</p>
							</DetailRow>
						)}
					</div>

					{/* Review result (read-only) */}
					{isReviewed && claim.review && (
						<div className={'flex flex-col gap-4'}>
							<h2 className={'text-lg font-semibold'}>{'Review Result'}</h2>

							<div className={'rounded-lg border border-border bg-card flex flex-col divide-y divide-border overflow-hidden'}>
								<DetailRow label={'Status'}>
									<ReviewStatusBadge status={claim.review.status} />
								</DetailRow>

								<DetailRow label={'Reviewed by'}>
									<span className={'font-mono text-sm'}>{claim.review.reviewedBy}</span>
								</DetailRow>

								<DetailRow label={'Reviewed at'}>
									<span className={'text-sm'}>
										{new Date(claim.review.createdAt).toLocaleDateString(undefined, {
											year: 'numeric',
											month: 'long',
											day: 'numeric',
											hour: '2-digit',
											minute: '2-digit',
										})}
									</span>
								</DetailRow>

								{claim.review.reason && (
									<DetailRow label={'Reason'}>
										<p className={'text-sm whitespace-pre-wrap'}>{claim.review.reason}</p>
									</DetailRow>
								)}
							</div>
						</div>
					)}

					{/* Game list */}
					{gamesForDisplay.length > 0 && (
						<div className={'flex flex-col gap-4'}>
							<div className={'flex flex-col gap-1'}>
								<h2 className={'text-lg font-semibold'}>
									{claim.type === 'org' ? 'Organization Games' : 'Claimed Games'}
								</h2>
								{!isReviewed && (
									<p className={'text-xs text-muted-foreground'}>
										{'Uncheck games to exclude them from approval.'}
									</p>
								)}
							</div>

							<div className={'flex flex-col gap-2'}>
								{gamesForDisplay.map((game) => {
									const isSelected = selectedGameUris.has(game.uri)

									return (
										<div
											key={game.uri}
											className={'flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3'}>
											{!isReviewed && (
												<Checkbox
													id={`game-${game.uri}`}
													checked={isSelected}
													onCheckedChange={(checked) =>
														handleGameToggle(game.uri, Boolean(checked))
													}
												/>
											)}

											<label
												htmlFor={`game-${game.uri}`}
												className={'flex flex-col gap-0.5 flex-1 min-w-0 cursor-pointer'}>
												<span className={'text-sm font-medium'}>{game.name}</span>
												<span className={'text-xs text-muted-foreground font-mono truncate'}>
													{game.uri}
												</span>
											</label>
										</div>
									)
								})}
							</div>
						</div>
					)}

					{/* Review form */}
					{!isReviewed && (
						<div className={'flex flex-col gap-6'}>
							<div className={'flex flex-col gap-2'}>
								<Label htmlFor={'reason'}>
									{'Reason'}
									<span className={'text-muted-foreground ml-1 text-xs'}>{'(optional)'}</span>
								</Label>
								<Textarea
									id={'reason'}
									onChange={(e) => setReason(e.target.value)}
									placeholder={'Provide context for your decision…'}
									value={reason}
								/>
							</div>

							{submitError && (
								<div className={'rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3'}>
									<p className={'text-sm text-destructive'}>{submitError}</p>
								</div>
							)}

							<div className={'flex gap-3 justify-end'}>
								<Button
									disabled={isSubmitting}
									onClick={handleDeny}
									variant={'destructive'}>
									{isSubmitting ? (
										<>
											<Spinner className={'size-4'} />
											{'Processing…'}
										</>
									) : (
										'Deny'
									)}
								</Button>

								<Button
									disabled={isSubmitting}
									onClick={handleApprove}>
									{isSubmitting ? (
										<>
											<Spinner className={'size-4'} />
											{'Processing…'}
										</>
									) : (
										'Approve'
									)}
								</Button>
							</div>
						</div>
					)}
				</div>
			</Container>
		</>
	)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function DetailRow({
	label,
	children,
}: {
	label: string
	children: React.ReactNode
}) {
	return (
		<div className={'flex gap-4 px-4 py-3'}>
			<span className={'text-sm text-muted-foreground w-32 shrink-0'}>{label}</span>
			<div className={'flex-1 min-w-0'}>{children}</div>
		</div>
	)
}

function ReviewStatusBadge({ status }: { status: string }) {
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
