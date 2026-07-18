'use client'

// Module imports
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronDownIcon } from 'lucide-react'
import { useStore } from 'statery'

// Local imports
import * as API from '@/helpers/API'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Container } from '@/components/Container/Container'
import { Spinner } from '@/components/ui/spinner'
import { type ClaimView, type GameSummaryView, type MigrationJobStatus } from '@/helpers/API'
import { store } from '@/store/store'

const POLL_INTERVAL = 3000

function getFriendlyError(status: MigrationJobStatus['status'], rawError?: string): {
	title: string
	message: string
	retryLabel: string
} {
	if (status === 'cancelled') {
		return {
			title: 'Migration cancelled',
			message: 'This migration was cancelled before it could finish. You can restart it — any games that were already migrated will be skipped.',
			retryLabel: 'Restart Migration',
		}
	}

	if (status === 'paused') {
		return {
			title: 'Migration paused',
			message: 'This migration was paused. You can resume it to continue where it left off.',
			retryLabel: 'Resume Migration',
		}
	}

	if (rawError && /rate.limit/i.test(rawError)) {
		return {
			title: 'Migration interrupted',
			message: 'The migration was interrupted while waiting for a rate limit to reset. This is temporary — you can restart, and any games that were already migrated will be skipped.',
			retryLabel: 'Restart Migration',
		}
	}

	if (rawError && /job.stopped/i.test(rawError)) {
		return {
			title: 'Migration interrupted',
			message: 'The migration was stopped before it could finish. You can restart it — any games that were already migrated will be skipped.',
			retryLabel: 'Restart Migration',
		}
	}

	return {
		title: 'Migration failed',
		message: 'Something went wrong during migration. You can try again — any games that were already migrated will be skipped.',
		retryLabel: 'Retry Migration',
	}
}

export function ClaimMigrationPage() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const { user } = useStore(store)

	const claimUri = searchParams.get('uri') ?? ''
	const restoredJobId = searchParams.get('jobId')

	const [isLoading, setIsLoading] = useState(true)
	const [claim, setClaim] = useState<ClaimView | null>(null)
	const [allGames, setAllGames] = useState<GameSummaryView[]>([])
	const [loadError, setLoadError] = useState<string | null>(null)

	const [isMigrating, setIsMigrating] = useState(false)
	const [jobStatus, setJobStatus] = useState<MigrationJobStatus | null>(null)
	const [migrationError, setMigrationError] = useState<string | null>(null)

	const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

	// Load claim (and org games if org type)
	useEffect(() => {
		let cancelled = false

		async function load() {
			setIsLoading(true)
			setLoadError(null)

			try {
				const fetchedClaim = await API.getClaim(claimUri)

				if (cancelled) return

				if (!fetchedClaim) {
					setLoadError('Claim not found.')
					return
				}

				setClaim(fetchedClaim)

				if (fetchedClaim.type === 'org' && fetchedClaim.org) {
					const { games } = await API.listOrgGames(fetchedClaim.org)
					if (!cancelled) {
						setAllGames(games)
					}
				} else {
					setAllGames(fetchedClaim.games ?? [])
				}
			} catch (error) {
				if (!cancelled) {
					setLoadError(
						error instanceof Error ? error.message : 'Failed to load claim.',
					)
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false)
				}
			}
		}

		load()

		return () => {
			cancelled = true
		}
	}, [claimUri])

	// Restore job status from URL on page load
	useEffect(() => {
		if (!restoredJobId || jobStatus) return

		let cancelled = false

		async function restore() {
			try {
				const status = await API.getMigrationStatus(restoredJobId!)
				if (!cancelled) {
					setJobStatus(status)
				}
			} catch {
				// Job may have been cleaned up — ignore
			}
		}

		restore()

		return () => {
			cancelled = true
		}
	}, [restoredJobId, jobStatus])

	// Poll for job status
	useEffect(() => {
		if (!jobStatus?.jobId) return
		if (jobStatus.status === 'completed' || jobStatus.status === 'failed' || jobStatus.status === 'cancelled' || jobStatus.status === 'paused') return

		pollRef.current = setInterval(async () => {
			try {
				const updated = await API.getMigrationStatus(jobStatus.jobId)
				setJobStatus(updated)

				if (updated.status === 'completed' || updated.status === 'failed' || updated.status === 'cancelled' || updated.status === 'paused') {
					if (pollRef.current) {
						clearInterval(pollRef.current)
						pollRef.current = null
					}
				}
			} catch {
				// Keep polling on transient errors
			}
		}, POLL_INTERVAL)

		return () => {
			if (pollRef.current) {
				clearInterval(pollRef.current)
				pollRef.current = null
			}
		}
	}, [jobStatus?.jobId, jobStatus?.status])

	const handleRetry = useCallback(() => {
		setJobStatus(null)
		setMigrationError(null)
		const params = new URLSearchParams(searchParams.toString())
		params.delete('jobId')
		router.replace(`?${params.toString()}`, { scroll: false })
	}, [router, searchParams])

	const handleMigrate = useCallback(async () => {
		if (!claim?.review?.uri) return

		setIsMigrating(true)
		setMigrationError(null)

		try {
			const result = await API.migrateClaim({
				claim: claimUri,
				claimReview: claim.review.uri,
			})

			const params = new URLSearchParams(searchParams.toString())
			params.set('jobId', result.jobId)
			router.replace(`?${params.toString()}`, { scroll: false })

			setJobStatus({
				jobId: result.jobId,
				status: result.status as MigrationJobStatus['status'],
				progress: {
					total: result.gamesCount,
					processed: 0,
				},
			})
		} catch (error) {
			setMigrationError(
				error instanceof Error ? error.message : 'Migration failed. Please try again.',
			)
		} finally {
			setIsMigrating(false)
		}
	}, [claim, claimUri, router, searchParams])

	// Loading state
	if (isLoading) {
		return (
			<Container>
				<div className={'flex items-center gap-3 text-muted-foreground'}>
					<Spinner className={'size-5'} />
					<span>{'Loading claim…'}</span>
				</div>
			</Container>
		)
	}

	// Load error
	if (loadError || !claim) {
		return (
			<Container>
				<div className={'flex flex-col gap-4 max-w-lg'}>
					<h1 className={'text-2xl font-bold'}>{'Claim Migration'}</h1>
					<div className={'rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3'}>
						<p className={'text-sm text-destructive'}>{loadError ?? 'Claim not found.'}</p>
					</div>
				</div>
			</Container>
		)
	}

	// Ownership check
	if (user?.did !== claim.claimantDid) {
		return (
			<Container>
				<div className={'flex flex-col gap-4 max-w-lg'}>
					<h1 className={'text-2xl font-bold'}>{'Access Denied'}</h1>
					<p className={'text-muted-foreground'}>
						{'You do not have permission to view this claim.'}
					</p>
				</div>
			</Container>
		)
	}

	const review = claim.review
	const approvedGameUris = new Set(review?.approvedGames ?? [])

	const approvedGames = allGames.filter((game) => approvedGameUris.has(game.uri))
	const deniedGames = allGames.filter((game) => !approvedGameUris.has(game.uri))

	const isJobActive = jobStatus && (jobStatus.status === 'pending' || jobStatus.status === 'running')
	const isJobDone = jobStatus?.status === 'completed'
	const isJobStopped = jobStatus?.status === 'failed' || jobStatus?.status === 'cancelled' || jobStatus?.status === 'paused'

	return (
		<Container>
			<div className={'flex flex-col gap-8 max-w-2xl'}>
				{/* Header */}
				<div className={'flex flex-col gap-2'}>
					<div className={'flex items-center gap-3'}>
						<h1 className={'text-2xl font-bold'}>{'Claim Migration'}</h1>

						{!review && (
							<Badge variant={'secondary'}>{'Pending Review'}</Badge>
						)}

						{review?.status === 'denied' && (
							<Badge variant={'destructive'}>{'Denied'}</Badge>
						)}

						{review?.status === 'approved' && (
							<Badge variant={'default'}>{'Approved'}</Badge>
						)}
					</div>

					<p className={'text-sm text-muted-foreground font-mono break-all'}>{claimUri}</p>
				</div>

				{/* Pending state */}
				{!review && (
					<div className={'rounded-lg border border-border bg-card p-6 flex flex-col gap-3'}>
						<p className={'text-base font-medium'}>{'Your claim is pending review.'}</p>
						<p className={'text-sm text-muted-foreground'}>
							{'Our team is reviewing your claim. Once approved, you will be able to migrate your games here. We will reach out to you via the contact information you provided if we need additional details.'}
						</p>
					</div>
				)}

				{/* Denied state */}
				{review?.status === 'denied' && (
					<div className={'rounded-lg border border-destructive/50 bg-destructive/10 p-6 flex flex-col gap-3'}>
						<p className={'text-base font-medium text-destructive'}>{'Your claim was denied.'}</p>
						{review.reason && (
							<p className={'text-sm text-muted-foreground'}>{review.reason}</p>
						)}
					</div>
				)}

				{/* Approved state */}
				{review?.status === 'approved' && (
					<div className={'flex flex-col gap-6'}>
						{/* Migration in progress */}
						{isJobActive && jobStatus.progress && (
							<div className={'rounded-lg border border-amber-500/40 bg-amber-500/10 p-6 flex flex-col gap-3'}>
								<div className={'flex items-center gap-3'}>
									<Spinner className={'size-5'} />
									<p className={'text-base font-medium text-amber-700 dark:text-amber-400'}>
										{'Migrating…'}
									</p>
								</div>
								<p className={'text-sm text-muted-foreground'}>
									{`${jobStatus.progress.processed ?? 0} of ${jobStatus.progress.total ?? 0} game${(jobStatus.progress.total ?? 0) === 1 ? '' : 's'} migrated.`}
								</p>
							</div>
						)}

						{/* Migration completed */}
						{isJobDone && (
							<div className={'rounded-lg border border-green-500/40 bg-green-500/10 p-6 flex flex-col gap-3'}>
								<p className={'text-base font-medium text-green-700 dark:text-green-400'}>
									{'Migration complete'}
								</p>
								{jobStatus.results && (
									<div className={'flex flex-col gap-1'}>
										{jobStatus.results.map((result) => (
											<div
												key={result.gameUri}
												className={'flex items-center gap-2 text-sm'}>
												{result.status === 'success' && (
													<span className={'text-green-600'}>{'migrated'}</span>
												)}
												{result.status === 'skipped' && (
													<span className={'text-muted-foreground'}>{'already migrated'}</span>
												)}
												{result.status === 'failed' && (
													<span className={'text-destructive'}>{'failed'}</span>
												)}
												<span className={'font-mono text-xs text-muted-foreground truncate'}>{result.newUri ?? result.gameUri}</span>
											</div>
										))}
									</div>
								)}
							</div>
						)}

						{/* Migration stopped (failed / cancelled / paused) */}
						{isJobStopped && jobStatus && (() => {
							const friendly = getFriendlyError(jobStatus.status, jobStatus.error)
							const isWarning = jobStatus.status === 'paused' || jobStatus.status === 'cancelled'

							return (
								<div className={`rounded-lg border p-6 flex flex-col gap-4 ${
									isWarning
										? 'border-amber-500/40 bg-amber-500/10'
										: 'border-destructive/50 bg-destructive/10'
								}`}>
									<div className={'flex flex-col gap-2'}>
										<p className={`text-base font-medium ${
											isWarning ? 'text-amber-700 dark:text-amber-400' : 'text-destructive'
										}`}>
											{friendly.title}
										</p>
										<p className={'text-sm text-muted-foreground'}>
											{friendly.message}
										</p>
									</div>

									<div className={'flex items-center gap-3'}>
										<Button
											onClick={handleRetry}
											size={'sm'}
											variant={isWarning ? 'default' : 'destructive'}>
											{friendly.retryLabel}
										</Button>
									</div>

									{jobStatus.error && (
										<Collapsible>
											<CollapsibleTrigger className={'group flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer'}>
												<ChevronDownIcon className={'size-3.5 transition-transform group-data-[state=open]:rotate-180'} />
												{'Technical details'}
											</CollapsibleTrigger>
											<CollapsibleContent>
												<pre className={'mt-2 rounded-md bg-black/20 p-3 text-xs text-muted-foreground font-mono whitespace-pre-wrap break-all overflow-x-auto max-h-40 overflow-y-auto'}>
													{jobStatus.error}
												</pre>
											</CollapsibleContent>
										</Collapsible>
									)}
								</div>
							)
						})()}

						{/* Approved games */}
						{approvedGames.length > 0 && (
							<div className={'flex flex-col gap-3'}>
								<h2 className={'text-lg font-semibold'}>{'Approved Games'}</h2>

								<div className={'flex flex-col gap-2'}>
									{approvedGames.map((game) => (
										<div
											key={game.uri}
											className={'rounded-md border border-green-500/40 bg-green-500/10 px-4 py-3'}>
											<span className={'text-sm font-medium'}>{game.name}</span>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Denied games */}
						{deniedGames.length > 0 && (
							<div className={'flex flex-col gap-3'}>
								<h2 className={'text-lg font-semibold'}>{'Denied Games'}</h2>

								<div className={'flex flex-col gap-2'}>
									{deniedGames.map((game) => (
										<div
											key={game.uri}
											className={'rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3'}>
											<span className={'text-sm font-medium'}>{game.name}</span>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Migration error (from the initial enqueue call) */}
						{migrationError && (
							<div className={'rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3'}>
								<p className={'text-sm text-destructive'}>{migrationError}</p>
							</div>
						)}

						{/* Action buttons */}
						{!jobStatus && (
							<div className={'flex gap-3 flex-wrap'}>
								<Button
									disabled={isMigrating}
									onClick={handleMigrate}>
									{isMigrating ? (
										<>
											<Spinner className={'size-4'} />
											{'Starting migration…'}
										</>
									) : (
										'Start Migration'
									)}
								</Button>
							</div>
						)}
					</div>
				)}
			</div>
		</Container>
	)
}
