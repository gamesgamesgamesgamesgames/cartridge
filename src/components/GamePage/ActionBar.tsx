'use client'

// Module imports
import { ListPlus, MessageSquareText } from 'lucide-react'

// Local imports
import { Button } from '@/components/ui/button'
import { Container } from '@/components/Container/Container'
import { LikeButton } from '@/components/GamePage/LikeButton'
import { SuggestEditButton } from '@/components/GamePage/SuggestEditButton'
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip'

// Types
type Props = Readonly<{
	gameUri: string
	initialLikeCount: number
	initialLiked: boolean
	slug?: string
}>

export function ActionBar(props: Props) {
	const { gameUri, initialLikeCount, initialLiked, slug } = props

	return (
		<div className={'border-b border-border bg-card'}>
			<Container isScrollable={false}>
				<div className={'flex items-center gap-1 py-1 -mx-2'}>
					<LikeButton
						gameUri={gameUri}
						initialCount={initialLikeCount}
						initialLiked={initialLiked}
					/>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant={'ghost'}
								size={'sm'}
								disabled>
								<MessageSquareText />
								{'Review'}
							</Button>
						</TooltipTrigger>
						<TooltipContent>{'Coming soon'}</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant={'ghost'}
								size={'sm'}
								disabled>
								<ListPlus />
								{'Add to List'}
							</Button>
						</TooltipTrigger>
						<TooltipContent>{'Coming soon'}</TooltipContent>
					</Tooltip>

					{slug && (
						<div className={'ml-auto'}>
							<SuggestEditButton slug={slug} />
						</div>
					)}
				</div>
			</Container>
		</div>
	)
}
