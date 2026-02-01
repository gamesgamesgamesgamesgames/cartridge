// Local imports
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { type Game } from '@/typedefs/Game'
import { Skeleton } from '@radix-ui/themes'

// Types
type Props = {
	game?: Game
}

export function BoxArt(props: Props) {
	const { game } = props

	return (
		<Skeleton loading={!game}>
			<AspectRatio ratio={2 / 3}>
				<img
					alt={`Box art for ${game?.record.name}`}
					className={'relative h-full w-full object-cover'}
					src={'https://placehold.co/200x300'}
				/>
			</AspectRatio>
		</Skeleton>
	)
}
