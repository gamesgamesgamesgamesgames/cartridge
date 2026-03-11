'use client'

// Module imports
import { useState, type ComponentProps } from 'react'

// Local imports
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { type MediaItem } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { Skeleton } from '@radix-ui/themes'
import { useBlobUrl } from '@/hooks/use-blob-url'
import { twMerge } from 'tailwind-merge'

// Types
type BoxArtRecord = {
	name?: string
	uri?: string
	media?: MediaItem[]
}

type Props = Readonly<
	ComponentProps<'div'> & {
		gameRecord?: BoxArtRecord
	}
>

export function BoxArt(props: Props) {
	const { className, gameRecord } = props

	const mediaItem = gameRecord?.media?.find(
		(item) => item.mediaType === 'cover',
	)

	const blobUrl = useBlobUrl(gameRecord?.uri, mediaItem?.blob)
	const [imageLoaded, setImageLoaded] = useState(false)

	return (
		<div className={twMerge('overflow-hidden rounded-sm', className)}>
			<Skeleton loading={!gameRecord}>
				<AspectRatio ratio={2.25 / 3}>
					<div className={'absolute inset-0 flex items-center justify-center bg-muted'}>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							alt={''}
							className={'size-2/3 opacity-30'}
							src={'/images/branding/logomark.color.svg'}
							style={{ animation: 'spin-pause 1.2s ease-in-out infinite' }}
						/>
					</div>

					{blobUrl && (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							key={blobUrl}
							alt={`Box art for ${gameRecord?.name}`}
							className={twMerge(
								'absolute inset-0 h-full w-full object-cover transition-opacity duration-300',
								imageLoaded ? 'opacity-100' : 'opacity-0',
							)}
							src={blobUrl}
							onLoad={() => setImageLoaded(true)}
						/>
					)}
				</AspectRatio>
			</Skeleton>
		</div>
	)
}
