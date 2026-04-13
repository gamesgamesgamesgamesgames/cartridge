'use client'

// Module imports
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useStore } from 'statery'

// Local imports
import * as API from '@/helpers/API'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/Container/Container'
import { DashboardHeader } from '@/components/DashboardHeader/DashboardHeader'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { isAdmin } from '@/helpers/admin'
import { store } from '@/store/store'
import { type ContributionView } from '@/helpers/API'

export function AdminContributionDetailPage() {
	const { user } = useStore(store)
	const router = useRouter()
	const params = useParams<{ did: string; rkey: string }>()

	const { did, rkey } = params
	const contributionUri = `at://${did}/games.gamesgamesgamesgames.contribution/${rkey}`

	const [contribution, setContribution] = useState<ContributionView | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [reason, setReason] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [submitError, setSubmitError] = useState<string | null>(null)

	const breadcrumbs = useMemo(
		() => [
			{ label: 'Admin', url: '/dashboard/admin' },
			{ label: 'Contributions', url: '/dashboard/admin/contributions' },
			{ label: 'Review Contribution', url: `/dashboard/admin/contributions/${did}/${rkey}` },
		],
		[],
	)

	useEffect(() => {
		let cancelled = false

		async function load() {
			setIsLoading(true)
			const result = await API.getContribution(contributionUri)
			if (cancelled) return
			setContribution(result)
			setIsLoading(false)
		}

		load()

		return () => {
			cancelled = true
		}
	}, [contributionUri])

	const handleApprove = useCallback(async () => {
		if (!contribution) return
		setIsSubmitting(true)
		setSubmitError(null)

		try {
			await API.reviewContribution({
				contribution: { uri: contribution.uri, cid: contribution.cid },
				status: 'approved',
				...(reason.trim() ? { reason: reason.trim() } : {}),
			})
			router.push('/dashboard/admin/contributions')
		} catch (error) {
			setSubmitError(
				error instanceof Error ? error.message : 'An unexpected error occurred.',
			)
			setIsSubmitting(false)
		}
	}, [contribution, reason, router])

	const handleDeny = useCallback(async () => {
		if (!contribution) return
		setIsSubmitting(true)
		setSubmitError(null)

		try {
			await API.reviewContribution({
				contribution: { uri: contribution.uri, cid: contribution.cid },
				status: 'denied',
				...(reason.trim() ? { reason: reason.trim() } : {}),
			})
			router.push('/dashboard/admin/contributions')
		} catch (error) {
			setSubmitError(
				error instanceof Error ? error.message : 'An unexpected error occurred.',
			)
			setIsSubmitting(false)
		}
	}, [contribution, reason, router])

	const handleNeedsRevision = useCallback(async () => {
		if (!contribution) return
		setIsSubmitting(true)
		setSubmitError(null)

		try {
			await API.reviewContribution({
				contribution: { uri: contribution.uri, cid: contribution.cid },
				status: 'needsRevision',
				...(reason.trim() ? { reason: reason.trim() } : {}),
			})
			router.push('/dashboard/admin/contributions')
		} catch (error) {
			setSubmitError(
				error instanceof Error ? error.message : 'An unexpected error occurred.',
			)
			setIsSubmitting(false)
		}
	}, [contribution, reason, router])

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

	if (!contribution) {
		return (
			<>
				<DashboardHeader breadcrumbs={breadcrumbs} />
				<Container>
					<div className={'flex items-center justify-center py-16'}>
						<p className={'text-muted-foreground text-sm'}>
							{'Contribution not found.'}
						</p>
					</div>
				</Container>
			</>
		)
	}

	const isReviewed = Boolean(contribution.review)
	const reviewStatus = contribution.review?.status
	const changedFields = Object.entries(contribution.changes as Record<string, unknown>)

	const displayDate = new Date(contribution.createdAt).toLocaleDateString(
		undefined,
		{ year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' },
	)

	return (
		<>
			<DashboardHeader breadcrumbs={breadcrumbs} />

			<Container>
				<div className={'flex flex-col gap-8 max-w-2xl'}>
					<div className={'flex flex-col gap-2'}>
						<div className={'flex items-center gap-3'}>
							<h1 className={'text-2xl font-bold'}>{'Review Contribution'}</h1>
							{isReviewed && reviewStatus && (
								<ReviewStatusBadge status={reviewStatus} />
							)}
						</div>
						<p className={'text-xs text-muted-foreground font-mono break-all'}>
							{contributionUri}
						</p>
					</div>

					{/* Contribution details */}
					<div className={'rounded-lg border border-border bg-card flex flex-col divide-y divide-border overflow-hidden'}>
						<DetailRow label={'Contributor'}>
							<span className={'font-mono text-sm'}>{contribution.contributorDid}</span>
						</DetailRow>

						<DetailRow label={'Type'}>
							<span className={'text-sm capitalize'}>{contribution.contributionType}</span>
						</DetailRow>

						{contribution.subjectName && (
							<DetailRow label={'Subject'}>
								<span className={'text-sm'}>{contribution.subjectName}</span>
							</DetailRow>
						)}

						<DetailRow label={'Submitted'}>
							<span className={'text-sm'}>{displayDate}</span>
						</DetailRow>

						{contribution.message && (
							<DetailRow label={'Message'}>
								<p className={'text-sm whitespace-pre-wrap'}>{contribution.message}</p>
							</DetailRow>
						)}
					</div>

					{/* Proposed changes */}
					<div className={'flex flex-col gap-4'}>
						<h2 className={'text-lg font-semibold'}>{'Proposed Changes'}</h2>

						<div className={'rounded-lg border border-border bg-card flex flex-col divide-y divide-border overflow-hidden'}>
							{changedFields.map(([field, value]) => (
								<DetailRow key={field} label={field}>
									<pre className={'text-sm whitespace-pre-wrap font-mono'}>
										{typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
									</pre>
								</DetailRow>
							))}

							{changedFields.length === 0 && (
								<div className={'px-4 py-3'}>
									<p className={'text-sm text-muted-foreground'}>{'No changes.'}</p>
								</div>
							)}
						</div>
					</div>

					{/* Review result (read-only) */}
					{isReviewed && contribution.review && (
						<div className={'flex flex-col gap-4'}>
							<h2 className={'text-lg font-semibold'}>{'Review Result'}</h2>

							<div className={'rounded-lg border border-border bg-card flex flex-col divide-y divide-border overflow-hidden'}>
								<DetailRow label={'Status'}>
									<ReviewStatusBadge status={contribution.review.status} />
								</DetailRow>

								<DetailRow label={'Reviewed by'}>
									<span className={'font-mono text-sm'}>{contribution.review.reviewedBy}</span>
								</DetailRow>

								<DetailRow label={'Reviewed at'}>
									<span className={'text-sm'}>
										{new Date(contribution.review.createdAt).toLocaleDateString(undefined, {
											year: 'numeric',
											month: 'long',
											day: 'numeric',
											hour: '2-digit',
											minute: '2-digit',
										})}
									</span>
								</DetailRow>

								{contribution.review.reason && (
									<DetailRow label={'Reason'}>
										<p className={'text-sm whitespace-pre-wrap'}>
											{contribution.review.reason}
										</p>
									</DetailRow>
								)}
							</div>
						</div>
					)}

					{/* Verification status */}
					{contribution.verification && (
						<div className={'flex flex-col gap-4'}>
							<h2 className={'text-lg font-semibold'}>{'Verification'}</h2>

							<div className={'rounded-lg border border-border bg-card flex flex-col divide-y divide-border overflow-hidden'}>
								<DetailRow label={'Accepted by'}>
									<span className={'text-sm capitalize'}>{contribution.verification.acceptedBy}</span>
								</DetailRow>
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
									placeholder={'Provide context for your decision...'}
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
									onClick={handleNeedsRevision}
									variant={'outline'}>
									{isSubmitting ? (
										<>
											<Spinner className={'size-4'} />
											{'Processing...'}
										</>
									) : (
										'Needs Revision'
									)}
								</Button>

								<Button
									disabled={isSubmitting}
									onClick={handleDeny}
									variant={'destructive'}>
									{isSubmitting ? (
										<>
											<Spinner className={'size-4'} />
											{'Processing...'}
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
											{'Processing...'}
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

	if (status === 'needsRevision') {
		return <Badge variant={'outline'} className={'border-yellow-500 text-yellow-600'}>{'Needs Revision'}</Badge>
	}

	return <Badge variant={'outline'}>{'Pending'}</Badge>
}
