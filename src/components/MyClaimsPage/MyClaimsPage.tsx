'use client'

// Module imports
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useStore } from 'statery'

// Local imports
import * as API from '@/helpers/API'
import { type ClaimView } from '@/helpers/API'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/Container/Container'
import { Spinner } from '@/components/ui/spinner'
import { store } from '@/store/store'

// Helpers
function parseAtUri(uri: string): { did: string; rkey: string } | null {
	// AT URI format: at://did/collection/rkey
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

function StatusBadge({ status }: { status: 'pending' | 'approved' | 'denied' }) {
	if (status === 'approved') {
		return (
			<Badge className={'bg-green-600 text-white dark:bg-green-700'}>
				{'Approved'}
			</Badge>
		)
	}

	if (status === 'denied') {
		return <Badge variant={'destructive'}>{'Denied'}</Badge>
	}

	return <Badge variant={'outline'}>{'Pending'}</Badge>
}

export function MyClaimsPage() {
	const { user } = useStore(store)
	const router = useRouter()

	const [claims, setClaims] = useState<ClaimView[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [loadError, setLoadError] = useState<string | null>(null)

	useEffect(() => {
		if (!user) return

		let cancelled = false

		async function fetchClaims() {
			setIsLoading(true)
			setLoadError(null)

			try {
				const result = await API.listClaims()
				if (!cancelled) {
					setClaims(result.claims)
				}
			} catch (error) {
				if (!cancelled) {
					setLoadError(
						error instanceof Error
							? error.message
							: 'Failed to load claims. Please try again.',
					)
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false)
				}
			}
		}

		fetchClaims()

		return () => {
			cancelled = true
		}
	}, [user])

	const handleClaimClick = useCallback(
		(uri: string) => {
			const parsed = parseAtUri(uri)
			if (!parsed) return
			router.push(`/claim/${parsed.did}/${parsed.rkey}`)
		},
		[router],
	)

	if (!user) {
		return (
			<Container>
				<div className={'flex flex-col gap-4 max-w-2xl'}>
					<h1 className={'text-2xl font-bold'}>{'My Claims'}</h1>
					<p className={'text-muted-foreground'}>
						{'You must be signed in to view your claims.'}
					</p>
				</div>
			</Container>
		)
	}

	return (
		<Container>
			<div className={'flex flex-col gap-6 max-w-2xl'}>
				<div className={'flex items-center justify-between gap-4'}>
					<h1 className={'text-2xl font-bold'}>{'My Claims'}</h1>

					<Button
						asChild
						variant={'default'}>
						<Link href={'/claim'}>{'New Claim'}</Link>
					</Button>
				</div>

				{isLoading && (
					<div className={'flex items-center justify-center py-16'}>
						<Spinner className={'size-6'} />
					</div>
				)}

				{!isLoading && loadError && (
					<div className={'rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3'}>
						<p className={'text-sm text-destructive'}>{loadError}</p>
					</div>
				)}

				{!isLoading && !loadError && claims.length === 0 && (
					<div className={'flex flex-col items-center gap-4 py-16 text-center'}>
						<p className={'text-muted-foreground'}>
							{"You haven't submitted any claims yet."}
						</p>

						<Button
							asChild
							variant={'outline'}>
							<Link href={'/claim'}>{'Submit Your First Claim'}</Link>
						</Button>
					</div>
				)}

				{!isLoading && !loadError && claims.length > 0 && (
					<div className={'flex flex-col divide-y divide-border rounded-lg border border-border overflow-hidden'}>
						{claims.map((claim) => {
							const status = getClaimStatus(claim)
							const gameCount = claim.games?.length ?? 0
							const date = new Date(claim.createdAt).toLocaleDateString(undefined, {
								year: 'numeric',
								month: 'short',
								day: 'numeric',
							})

							return (
								<button
									key={claim.uri}
									type={'button'}
									onClick={() => handleClaimClick(claim.uri)}
									className={'w-full text-left px-4 py-4 transition-colors hover:bg-accent bg-background flex items-center justify-between gap-4'}>
									<div className={'flex flex-col gap-1'}>
										<div className={'flex items-center gap-2'}>
											<span className={'text-sm font-medium capitalize'}>
												{claim.type === 'game' ? 'Game Claim' : 'Organization Claim'}
											</span>
										</div>

										<div className={'flex items-center gap-3 text-xs text-muted-foreground'}>
											{claim.type === 'game' && (
												<span>
													{gameCount === 1
														? '1 game'
														: `${gameCount} games`}
												</span>
											)}

											<span>{date}</span>
										</div>
									</div>

									<StatusBadge status={status} />
								</button>
							)
						})}
					</div>
				)}
			</div>
		</Container>
	)
}
