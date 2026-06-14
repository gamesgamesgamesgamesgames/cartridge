'use client'

import { Eye } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { ManagementInboxItem, normalizeStatus } from './ManagementInboxItem'
import { parseATURI } from '@/helpers/parseATURI'
import { Skeleton } from '@/components/ui/skeleton'
import { type ClaimView } from '@/helpers/API'
import { type ContributionView } from '@/helpers/API'
import * as API from '@/helpers/API'

type Props = Readonly<{
	profileDid: string
}>

function formatRelativeDate(dateString: string): string {
	const date = new Date(dateString)
	const now = new Date()
	const diffMs = now.getTime() - date.getTime()
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

	if (diffDays === 0) return 'Today'
	if (diffDays === 1) return 'Yesterday'
	if (diffDays < 7) return `${diffDays}d ago`
	if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
	return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function ManagementInbox(props: Props) {
	const { profileDid } = props

	const [isLoading, setIsLoading] = useState(true)
	const [claims, setClaims] = useState<ClaimView[]>([])
	const [contributionsToReview, setContributionsToReview] = useState<ContributionView[]>([])
	const [myContributions, setMyContributions] = useState<ContributionView[]>([])

	const fetchAll = useCallback(async () => {
		setIsLoading(true)
		try {
			const [claimsResult, toReviewResult, myResult] = await Promise.all([
				API.listClaims({ limit: 5 }).catch(() => ({ claims: [] as ClaimView[] })),
				API.listContributions({ status: 'pending', limit: 5 }).catch(() => ({ contributions: [] as ContributionView[] })),
				API.listContributions({ contributor: profileDid, limit: 5 }).catch(() => ({ contributions: [] as ContributionView[] })),
			])

			setClaims(claimsResult.claims.filter((c) => !c.review))
			setContributionsToReview(toReviewResult.contributions)
			setMyContributions(myResult.contributions)
		} finally {
			setIsLoading(false)
		}
	}, [profileDid])

	useEffect(() => {
		fetchAll()
	}, [fetchAll])

	if (isLoading) {
		return (
			<div className={'flex flex-col gap-3 rounded-lg border border-border bg-card/50 p-4'}>
				<Skeleton className={'h-4 w-48'} />
				<Skeleton className={'h-12 w-full'} />
				<Skeleton className={'h-12 w-full'} />
			</div>
		)
	}

	const hasItems = claims.length > 0 || contributionsToReview.length > 0 || myContributions.length > 0

	if (!hasItems) return null

	return (
		<div className={'mb-6 flex flex-col gap-1 rounded-lg border border-border bg-card/50 p-4'}>
			<div className={'mb-2 flex items-center gap-2'}>
				<Eye className={'size-4 text-muted-foreground'} />
				<span className={'text-xs font-medium text-muted-foreground'}>
					{'Only visible to you'}
				</span>
			</div>

			{contributionsToReview.length > 0 && (
				<div className={'flex flex-col'}>
					<h3 className={'mb-1 text-sm font-medium'}>{'Contributions to review'}</h3>
					{contributionsToReview.map((c) => {
						const { did, rkey } = parseATURI(c.uri)
						return (
							<ManagementInboxItem
								key={c.uri}
								type={'contribution-to-review'}
								label={c.subjectName ?? 'Game edit'}
								sublabel={c.contributionType}
								status={normalizeStatus(c.review?.status)}
								href={`/admin/contributions/${did}/${rkey}`}
								date={formatRelativeDate(c.createdAt)}
							/>
						)
					})}
				</div>
			)}

			{claims.length > 0 && (
				<div className={'flex flex-col'}>
					<h3 className={'mb-1 text-sm font-medium'}>{'Your claims'}</h3>
					{claims.map((c) => {
						const { did, rkey } = parseATURI(c.uri)
						const label = c.type === 'game' && c.games?.length
							? c.games.map((g) => g.name).join(', ')
							: 'Organization Claim'
						return (
							<ManagementInboxItem
								key={c.uri}
								type={'your-claim'}
								label={label}
								status={normalizeStatus(c.review?.status)}
								href={`/admin/claims/${did}/${rkey}`}
								date={formatRelativeDate(c.createdAt)}
							/>
						)
					})}
				</div>
			)}

			{myContributions.length > 0 && (
				<div className={'flex flex-col'}>
					<h3 className={'mb-1 text-sm font-medium'}>{'Your contributions'}</h3>
					{myContributions.map((c) => {
						const { did, rkey } = parseATURI(c.uri)
						return (
							<ManagementInboxItem
								key={c.uri}
								type={'your-contribution'}
								label={c.subjectName ?? 'Game edit'}
								sublabel={c.contributionType}
								status={normalizeStatus(c.review?.status)}
								href={`/dashboard/contributions`}
								date={formatRelativeDate(c.createdAt)}
							/>
						)
					})}
				</div>
			)}
		</div>
	)
}
