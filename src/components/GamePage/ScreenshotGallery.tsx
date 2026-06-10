'use client'

import { useCallback, useMemo, useState } from 'react'

import { Lightbox } from '@/components/Lightbox/Lightbox'
import { Scroller } from '@/components/ui/scroller'
import { type MediaItem } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { useBlobUrl } from '@/hooks/use-blob-url'
import { SCREENSHOT_TYPES } from '@/constants/MEDIA_CATEGORIES'

type GameMediaItem = {
	blob?: unknown
	mediaType?: string
	title?: string
	description?: string
	width?: number
	height?: number
	locale?: string
}

type Props = Readonly<{
	uri: string
	gameName: string
	media: GameMediaItem[]
}>

function ScreenshotImage(props: {
	uri: string
	item: GameMediaItem
	gameName: string
	index: number
	onClick: () => void
}) {
	const { uri, item, gameName, index, onClick } = props
	const blobUrl = useBlobUrl(uri, item.blob as MediaItem['blob'])

	if (!blobUrl) return null

	return (
		<button
			type={'button'}
			aria-label={`View screenshot ${index + 1} from ${gameName}`}
			className={'group relative block h-full shrink-0 cursor-pointer overflow-hidden rounded-lg'}
			onClick={onClick}>
			<img
				alt={''}
				aria-hidden={'true'}
				className={'absolute inset-0 h-full w-full scale-110 object-cover blur-xl'}
				src={blobUrl}
			/>
			<img
				alt={`Screenshot from ${gameName}`}
				className={'relative h-full w-auto object-contain transition-transform duration-300 group-hover:scale-105'}
				src={blobUrl}
			/>
		</button>
	)
}

function useBlobUrls(uri: string, items: GameMediaItem[]) {
	// Safe: item count is derived from static game data and won't change between renders
	const urls: (string | undefined)[] = []
	for (const item of items) {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		urls.push(useBlobUrl(uri, item.blob as MediaItem['blob']))
	}
	return urls
}

export function ScreenshotGallery(props: Props) {
	const { uri, gameName, media } = props
	const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

	const screenshots = useMemo(
		() => media.filter((item) => item.mediaType && (SCREENSHOT_TYPES as string[]).includes(item.mediaType)),
		[media],
	)

	const blobUrls = useBlobUrls(uri, screenshots)

	const lightboxImages = useMemo(
		() =>
			screenshots.map((item, i) => ({
				src: blobUrls[i] ?? '',
				alt: `Screenshot from ${gameName}`,
				description: item.description,
			})),
		[screenshots, blobUrls, gameName],
	)

	const closeLightbox = useCallback(() => setLightboxIndex(null), [])

	if (!screenshots.length) return null

	return (
		<>
			<Scroller
				orientation={'horizontal'}
				hideScrollbar
				withNavigation
				scrollStep={400}
				className={'-mx-4 flex h-40 gap-3 px-4 py-2 md:h-56 md:gap-4 lg:h-72'}>
				{screenshots.map((item, index) => (
					<ScreenshotImage
						key={index}
						uri={uri}
						item={item}
						gameName={gameName}
						index={index}
						onClick={() => setLightboxIndex(index)}
					/>
				))}
			</Scroller>

			{lightboxIndex !== null && (
				<Lightbox
					sectionLabel={'Screenshots'}
					images={lightboxImages}
					currentIndex={lightboxIndex}
					onClose={closeLightbox}
					onNavigate={setLightboxIndex}
				/>
			)}
		</>
	)
}
