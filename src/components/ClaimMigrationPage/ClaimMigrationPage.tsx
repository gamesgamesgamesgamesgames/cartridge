'use client'

// Module imports
import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useStore } from 'statery'

// Local imports
import * as API from '@/helpers/API'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/Container/Container'
import { Spinner } from '@/components/ui/spinner'
import { type ClaimView, type GameSummaryView, type MigrationResult } from '@/helpers/API'
import { store } from '@/store/store'

export function ClaimMigrationPage() {
	const { did, rkey } = useParams<{ did: string; rkey: string }>()
	const { user } = useStore(store)

	const claimUri = `at://${did}/games.gamesgamesgamesgames.claim/${rkey}`

	const [isLoading, setIsLoading] = useState(true)
	const [claim, setClaim] = useState<ClaimView | null>(null)
	const [allGames, setAllGames] = useState<GameSummaryView[]>([])
	const [loadError, setLoadError] = useState<string | null>(null)

	const [isMigrating, setIsMigrating] = useState(false)
	const [migrationResults, setMigrationResults] = useState<MigrationResult[] | null>(null)
	const [migrationError, setMigrationError] = useState<string | null>(null)

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

	const handleMigrate = useCallback(async () => {
		if (!claim?.review?.uri) return

		setIsMigrating(true)
		setMigrationError(null)

		try {
			const results = await API.migrateClaim({
				claim: claimUri,
				claimReview: claim.review.uri,
			})
			setMigrationResults(results)
		} catch (error) {
			setMigrationError(
				error instanceof Error ? error.message : 'Migration failed. Please try again.',
			)
		} finally {
			setIsMigrating(false)
		}
	}, [claim, claimUri])

	const handleRetryFailed = useCallback(async () => {
		if (!claim?.review?.uri || !migrationResults) return

		setIsMigrating(true)
		setMigrationError(null)

		try {
			const results = await API.migrateClaim({
				claim: claimUri,
				claimReview: claim.review.uri,
			})
			setMigrationResults(results)
		} catch (error) {
			setMigrationError(
				error instanceof Error ? error.message : 'Migration failed. Please try again.',
			)
		} finally {
			setIsMigrating(false)
		}
	}, [claim, claimUri, migrationResults])

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

	const hasFailed = migrationResults?.some((r) => r.status === 'failed') ?? false

	// Helper to get migration result for a game URI
	function getMigrationResult(gameUri: string): MigrationResult | undefined {
		return migrationResults?.find((r) => r.gameUri === gameUri)
	}

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
						{/* Approved games */}
						{approvedGames.length > 0 && (
							<div className={'flex flex-col gap-3'}>
								<h2 className={'text-lg font-semibold'}>{'Approved Games'}</h2>

								<div className={'flex flex-col gap-2'}>
									{approvedGames.map((game) => {
										const result = getMigrationResult(game.uri)
										return (
											<div
												key={game.uri}
												className={'rounded-md border border-green-500/40 bg-green-500/10 px-4 py-3 flex flex-col gap-1'}>
												<div className={'flex items-center justify-between gap-3'}>
													<span className={'text-sm font-medium'}>{game.name}</span>

													{result && (
														<>
															{result.status === 'success' && (
																<Badge className={'border-green-600 bg-green-600 text-white shrink-0'}>
																	{'Migrated'}
																</Badge>
															)}
															{result.status === 'failed' && (
																<Badge variant={'destructive'} className={'shrink-0'}>
																	{'Failed'}
																</Badge>
															)}
															{result.status === 'skipped' && (
																<Badge variant={'outline'} className={'shrink-0'}>
																	{'Skipped'}
																</Badge>
															)}
														</>
													)}
												</div>

												{result?.status === 'failed' && result.error && (
													<p className={'text-xs text-destructive'}>{result.error}</p>
												)}
											</div>
										)
									})}
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

						{/* Migration error */}
						{migrationError && (
							<div className={'rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3'}>
								<p className={'text-sm text-destructive'}>{migrationError}</p>
							</div>
						)}

						{/* Action buttons */}
						<div className={'flex gap-3 flex-wrap'}>
							{!migrationResults && (
								<Button
									disabled={isMigrating}
									onClick={handleMigrate}>
									{isMigrating ? (
										<>
											<Spinner className={'size-4'} />
											{'Migrating…'}
										</>
									) : (
										'Start Migration'
									)}
								</Button>
							)}

							{migrationResults && hasFailed && (
								<Button
									disabled={isMigrating}
									onClick={handleRetryFailed}
									variant={'outline'}>
									{isMigrating ? (
										<>
											<Spinner className={'size-4'} />
											{'Retrying…'}
										</>
									) : (
										'Retry Failed'
									)}
								</Button>
							)}
						</div>
					</div>
				)}
			</div>
		</Container>
	)
}
