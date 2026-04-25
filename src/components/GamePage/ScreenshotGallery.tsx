'use client'

import { useCallback, useMemo, useState } from 'react'

import { Lightbox } from '@/components/Lightbox/Lightbox'
import { Scroller } from '@/components/ui/scroller'
import { type MediaItem } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { useBlobUrl } from '@/hooks/use-blob-url'
import { SCREENSHOT_TYPES } from '@/constants/MEDIA_CATEGORIES'
import { type MediaType } from '@/typedefs/MediaType'

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
	onClick: () => void
}) {
	const { uri, item, gameName, onClick } = props
	const blobUrl = useBlobUrl(uri, item.blob as MediaItem['blob'])

	if (!blobUrl) return null

	return (
		<button
			type={'button'}
			className={'group relative block h-full shrink-0 cursor-pointer overflow-hidden rounded-lg'}
			onClick={onClick}>
			<img
				alt={''}
				aria-hidden
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

function useScreenshotBlobUrls(uri: string, items: GameMediaItem[]) {
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

	const blobUrls = useScreenshotBlobUrls(uri, screenshots)

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
				className={'-mx-4 flex gap-3 px-4 py-2 md:gap-4'}
				style={{ height: '220px' }}>
				{screenshots.map((item, index) => (
					<ScreenshotImage
						key={index}
						uri={uri}
						item={item}
						gameName={gameName}
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
