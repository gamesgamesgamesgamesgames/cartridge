'use client'

import { Clock, RotateCcw, X } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { BoxArt } from '@/components/BoxArt/BoxArt'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/Header/Header'
import { type ClaimView } from '@/helpers/API'

type Props = Readonly<{
	claim: ClaimView
}>

export function PendingClaimCard(props: Props) {
	const { claim } = props
	const isDenied = claim.review?.status === 'denied'
	const firstGame = claim.type === 'game' && claim.games?.length ? claim.games[0] : null
	const label = firstGame?.name ?? 'Pending Claim'

	return (
		<div className={'group relative flex flex-col gap-2 opacity-60'}>
			<div className={'relative overflow-hidden rounded-md'}>
				{firstGame ? (
					<BoxArt gameRecord={firstGame} className={'rounded-md'} />
				) : (
					<div className={'flex aspect-[3/4] items-center justify-center rounded-md bg-muted'}>
						<Clock className={'size-8 text-muted-foreground'} />
					</div>
				)}

				<div className={'absolute inset-x-0 bottom-0 p-2'}>
					{isDenied ? (
						<Badge variant={'destructive'} className={'gap-1'}>
							<X className={'size-3'} />
							{'Denied'}
						</Badge>
					) : (
						<Badge variant={'outline'} className={'gap-1 border-border bg-background/80 backdrop-blur-sm'}>
							<Clock className={'size-3'} />
							{'Pending'}
						</Badge>
					)}
				</div>
			</div>

			<div className={'flex items-start justify-between gap-1'}>
				<Header className={'line-clamp-2 text-sm'} level={4}>
					{label}
				</Header>

				{isDenied && (
					<Button
						asChild
						size={'icon-xs'}
						variant={'ghost'}
						aria-label={'Resubmit claim'}>
						<Link href={'/claim'}>
							<RotateCcw className={'size-3'} />
						</Link>
					</Button>
				)}
			</div>
		</div>
	)
}
