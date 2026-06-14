import { Check, Clock, Handshake, Shield, X } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'

type ItemType = 'contribution-to-review' | 'your-claim' | 'your-contribution'

export type InboxItemStatus = 'pending' | 'approved' | 'denied' | 'needsRevision'

const KNOWN_STATUSES = new Set<string>(['pending', 'approved', 'denied', 'needsRevision'])

export function normalizeStatus(status: string | undefined): InboxItemStatus {
	if (status && KNOWN_STATUSES.has(status)) return status as InboxItemStatus
	return 'pending'
}

type Props = Readonly<{
	type: ItemType
	label: string
	sublabel?: string
	status: InboxItemStatus
	href: string
	date: string
}>

const TYPE_ICONS = {
	'contribution-to-review': Handshake,
	'your-claim': Shield,
	'your-contribution': Handshake,
} as const

function StatusBadge({ status }: { status: Props['status'] }) {
	switch (status) {
		case 'approved':
			return (
				<Badge variant={'default'} className={'gap-1'}>
					<Check className={'size-3'} />
					{'Approved'}
				</Badge>
			)
		case 'denied':
			return (
				<Badge variant={'destructive'} className={'gap-1'}>
					<X className={'size-3'} />
					{'Denied'}
				</Badge>
			)
		case 'needsRevision':
			return (
				<Badge variant={'secondary'} className={'gap-1'}>
					{'Needs Revision'}
				</Badge>
			)
		default:
			return (
				<Badge variant={'outline'} className={'gap-1'}>
					<Clock className={'size-3'} />
					{'Pending'}
				</Badge>
			)
	}
}

export function ManagementInboxItem(props: Props) {
	const { type, label, sublabel, status, href, date } = props
	const Icon = TYPE_ICONS[type]

	return (
		<Link
			href={href}
			className={'flex items-center gap-3 rounded-lg px-3 py-3 -mx-3 transition-colors hover:bg-accent'}>
			<div className={'flex size-8 shrink-0 items-center justify-center rounded-md bg-muted'}>
				<Icon className={'size-4 text-muted-foreground'} />
			</div>

			<div className={'flex min-w-0 flex-1 flex-col gap-0.5'}>
				<span className={'truncate text-sm font-medium'}>{label}</span>
				{sublabel && (
					<span className={'truncate text-xs text-muted-foreground'}>{sublabel}</span>
				)}
			</div>

			<div className={'flex shrink-0 items-center gap-3'}>
				<StatusBadge status={status} />
				<span className={'text-xs text-muted-foreground'}>{date}</span>
			</div>
		</Link>
	)
}
