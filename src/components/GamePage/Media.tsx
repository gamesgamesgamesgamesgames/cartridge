'use client'

// Module imports
import { Fragment } from 'react'

// Local imports
import { Card } from '@/components/ui/card'
import { type GameRecord } from '@/typedefs/GameRecord'
import { Header } from '@/components/Header/Header'
import { type MediaItem } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { MediaType } from '@/typedefs/MediaType'
import { useBlobUrl } from '@/hooks/use-blob-url'

// Types
type GameMediaItem = NonNullable<GameRecord['media']>[number]
type Props = Readonly<{ gameRecord: GameRecord }>

function BlobImage(props: { uri: string; mediaItem: GameMediaItem; gameName?: string }) {
	const { uri, mediaItem, gameName } = props
	const blobUrl = useBlobUrl(uri, mediaItem.blob as MediaItem['blob'])

	return (
		<img
			alt={`Screenshot from ${gameName}`}
			className={'relative h-full w-full object-contain'}
			src={blobUrl ?? 'https://placehold.co/320x180'}
		/>
	)
}

export function Media(props: Props) {
	const { gameRecord } = props

	if (!gameRecord.media?.length) {
		return null
	}

	const mediaItemFilters = gameRecord?.media?.reduce(
		(accumulator, mediaItem) => {
			const mediaType = mediaItem.mediaType!
			if (!accumulator[mediaType]) {
				accumulator[mediaType] = []
			}

			accumulator[mediaType].push(mediaItem)

			return accumulator
		},
		{} as Record<MediaType, GameMediaItem[]>,
	)

	return (
		<section>
			<Card className={'flex p-4'}>
				<Header level={3}>{'Media'}</Header>

				{Object.entries(mediaItemFilters).map(([mediaType, mediaItems]) => (
					<Fragment key={mediaType}>
						<Header level={4}>{mediaType}</Header>
						<div className={'col-span-2 gap-4 grid grid-cols-3'}>
							{mediaItems.map((mediaItem, index) => (
								<BlobImage
									key={index}
									uri={gameRecord.uri}
									mediaItem={mediaItem}
									gameName={gameRecord.name}
								/>
							))}
						</div>
					</Fragment>
				))}
			</Card>
		</section>
	)
}
