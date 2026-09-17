'use client'

// Module imports
import {
	BadgeCheck,
	Check,
	ChevronRight,
	Handshake,
	Shield,
} from 'lucide-react'
import Link from 'next/link'
import { type LucideIcon } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useStore } from 'statery'

// Local imports
import * as API from '@/helpers/API'
import { Skeleton } from '@/components/ui/skeleton'
import { store } from '@/store/store'

// Constants
/** Page size used purely to count; anything beyond renders as `N+`. */
const COUNT_LIMIT = 100

type WorkItem = {
	key: string
	Icon: LucideIcon
	/** Leading count, omitted for items that aren't countable. */
	count?: number
	/** True when the count hit the page limit and is a floor, not a total. */
	isPartial?: boolean
	label: string
	href: string
}

type Props = Readonly<{
	/** Injected in tests; production reads from the API. */
	items?: WorkItem[]
}>

function pluralize(count: number, singular: string, plural: string): string {
	return count === 1 ? singular : plural
}

function WorkRow(props: Readonly<{ item: WorkItem }>) {
	const { item } = props
	const { count, href, Icon, isPartial, label } = item

	return (
		<Link
			href={href}
			className={
				'group -mx-2 flex items-center gap-3 rounded-md px-2 py-3 transition-colors duration-150 hover:bg-accent focus-visible:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
			}>
			<Icon
				aria-hidden={'true'}
				className={
					'size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground'
				}
			/>

			<span className={'min-w-0 flex-1 text-sm'}>
				{typeof count === 'number' && (
					<span className={'font-semibold tabular-nums'}>
						{count}
						{isPartial ? '+' : ''}{' '}
					</span>
				)}
				{label}
			</span>

			<ChevronRight
				aria-hidden={'true'}
				className={
					'size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100'
				}
			/>
		</Link>
	)
}

/**
 * The studio's short list of open work, sitting beside the performance chart.
 *
 * Deliberately counts rather than enumerates: the full detail already lives at
 * `/studio/contributions` and `/studio/claims`, and a narrow rail that
 * tried to reproduce those lists would just truncate them badly. Each row is a
 * doorway, not a record.
 *
 * The empty case is a real state, not a hidden component — "all caught up" is
 * the outcome a studio wants, and collapsing the rail would shift the layout
 * every time the last item cleared.
 */
export function StudioAttentionRail(props: Props) {
	const { items: injectedItems } = props
	const isControlled = injectedItems !== undefined

	const { user } = useStore(store)

	const [items, setItems] = useState<WorkItem[] | null>(injectedItems ?? null)
	const [isLoading, setIsLoading] = useState(!isControlled)

	// The rail has no controls that refetch, so `isLoading` only ever falls from
	// its initial `true` — no need to raise it again at the top of the fetch.
	const loadData = useCallback(async () => {
		if (isControlled || !user) {
			return
		}

		const [contributionsResult, claimsResult] = await Promise.all([
			API.listContributions({ status: 'pending', limit: COUNT_LIMIT }).catch(
				() => ({ contributions: [], cursor: undefined }),
			),
			API.listClaims({ limit: COUNT_LIMIT }).catch(() => ({
				claims: [],
				cursor: undefined,
			})),
		])

		const next: WorkItem[] = []

		const toReview = contributionsResult.contributions.length

		if (toReview > 0) {
			next.push({
				key: 'contributions',
				Icon: Handshake,
				count: toReview,
				isPartial: Boolean(contributionsResult.cursor),
				label: `community ${pluralize(toReview, 'edit', 'edits')} awaiting your review`,
				href: '/studio/contributions',
			})
		}

		const pendingClaims = claimsResult.claims.filter(
			(claim) => !claim.review,
		).length

		if (pendingClaims > 0) {
			next.push({
				key: 'claims',
				Icon: Shield,
				count: pendingClaims,
				label: `${pluralize(pendingClaims, 'claim', 'claims')} awaiting review`,
				href: '/studio/claims',
			})
		}

		if (!user.verifiedAccountType) {
			next.push({
				key: 'verification',
				Icon: BadgeCheck,
				label: 'Get verified as a studio',
				href: '/verify',
			})
		}

		setItems(next)
		setIsLoading(false)
	}, [isControlled, user])

	useEffect(() => {
		loadData()
	}, [loadData])

	return (
		<section
			aria-labelledby={'studio-attention-heading'}
			className={
				// `self-start` so the rail hugs its content instead of stretching to
				// match the chart beside it — an empty list shouldn't rent 300px.
				'flex flex-col gap-2 self-start rounded-xl border border-border bg-card p-4 sm:p-5'
			}>
			<h2
				id={'studio-attention-heading'}
				className={'text-sm font-semibold'}>
				{'Needs Attention'}
			</h2>

			<div
				aria-live={'polite'}
				className={'flex flex-col'}>
				{isLoading || !items ? (
					<div className={'flex flex-col gap-3 py-2'}>
						<Skeleton className={'h-5 w-full'} />
						<Skeleton className={'h-5 w-4/5'} />
					</div>
				) : items.length === 0 ? (
					<p
						className={
							'flex items-center gap-2 py-3 text-sm text-muted-foreground'
						}>
						<Check
							aria-hidden={'true'}
							className={'size-4 shrink-0 text-trend-up'}
						/>
						{'Nothing waiting on you.'}
					</p>
				) : (
					items.map((item) => (
						<WorkRow
							key={item.key}
							item={item}
						/>
					))
				)}
			</div>
		</section>
	)
}
