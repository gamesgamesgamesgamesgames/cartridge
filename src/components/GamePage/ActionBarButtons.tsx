'use client'

import { MessageSquareText } from 'lucide-react'

import { AddToListButton } from '@/components/GamePage/AddToListButton'
import { Button } from '@/components/ui/button'
import { LikeButton } from '@/components/GamePage/LikeButton'
import { SuggestEditButton } from '@/components/GamePage/SuggestEditButton'
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip'

type Props = Readonly<{
	gameName: string
	gameUri: string
	slug?: string
}>

export function ActionBarButtons(props: Props) {
	const { gameName, gameUri, slug } = props

	return (
		<div className={'flex items-center gap-1.5 md:gap-2 [&_[data-slot=button]]:min-h-11'}>
			<LikeButton gameName={gameName} />

			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant={'ghost'}
						size={'default'}
						aria-disabled={'true'}
						className={'hidden opacity-50 md:inline-flex'}>
						<MessageSquareText aria-hidden={'true'} />
						{'Review'}
					</Button>
				</TooltipTrigger>
				<TooltipContent side={'top'}>{'Coming soon'}</TooltipContent>
			</Tooltip>

			<AddToListButton gameUri={gameUri} />

			{slug && <SuggestEditButton slug={slug} />}
		</div>
	)
}
