'use client'

// Module imports
import { useCallback, useMemo, useState } from 'react'

// Local imports
import { type GameRecord } from '@/typedefs/GameRecord'
import { Lightbox } from '@/components/Lightbox/Lightbox'
import { type MediaItem } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { type MediaType } from '@/typedefs/MediaType'
import { useBlobUrl } from '@/hooks/use-blob-url'
import {
	ALL_CATEGORIZED_TYPES,
	ARTWORK_TYPES,
	COVER_TYPES,
	LOGO_TYPES,
	SCREENSHOT_TYPES,
} from '@/constants/MEDIA_CATEGORIES'
import { SectionHeader } from './SectionHeader'

// Types
type GameMediaItem = NonNullable<GameRecord['media']>[number]
type Props = Readonly<{ gameRecord: GameRecord }>

type MediaSection = {
	label: string
	items: GameMediaItem[]
}

type LightboxState = {
	sectionIndex: number
	imageIndex: number
} | null

function BlobImage(props: {
	uri: string
	mediaItem: GameMediaItem
	gameName?: string
	onClick: (blobUrl: string) => void
}) {
	const { uri, mediaItem, gameName, onClick } = props
	const blobUrl = useBlobUrl(uri, mediaItem.blob as MediaItem['blob'])

	return (
		<button
			type={'button'}
			className={'cursor-pointer text-left'}
			onClick={() => {
				if (blobUrl) onClick(blobUrl)
			}}>
			<img
				alt={`${mediaItem.mediaType} from ${gameName}`}
				className={'h-full w-full object-cover aspect-video rounded'}
				src={blobUrl ?? 'https://placehold.co/320x180'}
			/>
		</button>
	)
}

function VideoEmbed(props: {
	videoId: string
	platform: string
	title?: string
}) {
	const { videoId, platform, title } = props

	let embedUrl: string
	switch (platform) {
		case 'youtube':
			embedUrl = `https://www.youtube.com/embed/${videoId}`
			break
		case 'twitch':
			embedUrl = `https://player.twitch.tv/?video=${videoId}&parent=${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}`
			break
		case 'vimeo':
			embedUrl = `https://player.vimeo.com/video/${videoId}`
			break
		default:
			return null
	}

	return (
		<iframe
			className={'w-full aspect-video rounded'}
			src={embedUrl}
			title={title ?? `${platform} video`}
			allow={'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'}
			allowFullScreen
		/>
	)
}

function filterByTypes(
	items: GameMediaItem[],
	types: MediaType[],
): GameMediaItem[] {
	const typeSet = new Set<MediaType>(types)
	return items.filter((item) => typeSet.has(item.mediaType as MediaType))
}

function useSectionBlobUrls(uri: string, items: GameMediaItem[]) {
	const urls: (string | undefined)[] = []
	for (const item of items) {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		urls.push(useBlobUrl(uri, item.blob as MediaItem['blob']))
	}
	return urls
}

function ImageSection(props: {
	section: MediaSection
	uri: string
	gameName: string
	onImageClick: (index: number) => void
}) {
	const { section, uri, gameName, onImageClick } = props
	const blobUrls = useSectionBlobUrls(uri, section.items)

	return (
		<div className={'grid grid-cols-3 gap-4'}>
			{section.items.map((mediaItem, index) => (
				<button
					key={index}
					type={'button'}
					className={'cursor-pointer text-left'}
					onClick={() => {
						if (blobUrls[index]) onImageClick(index)
					}}>
					<img
						alt={`${mediaItem.mediaType} from ${gameName}`}
						className={'h-full w-full object-cover aspect-video rounded'}
						src={blobUrls[index] ?? 'https://placehold.co/320x180'}
					/>
				</button>
			))}
		</div>
	)
}

function LightboxForSection(props: {
	section: MediaSection
	uri: string
	gameName: string
	imageIndex: number
	onClose: () => void
	onNavigate: (index: number) => void
}) {
	const { section, uri, gameName, imageIndex, onClose, onNavigate } = props
	const blobUrls = useSectionBlobUrls(uri, section.items)

	const images = section.items.map((item, i) => ({
		src: blobUrls[i] ?? '',
		alt: `${item.mediaType} from ${gameName}`,
		description: item.description,
	}))

	return (
		<Lightbox
			sectionLabel={section.label}
			images={images}
			currentIndex={imageIndex}
			onClose={onClose}
			onNavigate={onNavigate}
		/>
	)
}

export function MediaTab(props: Props) {
	const { gameRecord } = props
	const [lightbox, setLightbox] = useState<LightboxState>(null)

	const sections = useMemo(() => {
		const mediaItems = gameRecord.media ?? []
		const videos = gameRecord.videos ?? []

		const result: MediaSection[] = []

		const screenshots = filterByTypes(mediaItems, SCREENSHOT_TYPES)
		if (screenshots.length) {
			result.push({ label: 'Screenshots', items: screenshots })
		}

		// Trailers are handled separately (video embeds)
		// We insert a placeholder to mark where trailers go in the order
		if (videos.length) {
			result.push({ label: 'Trailers', items: [] })
		}

		const artwork = filterByTypes(mediaItems, ARTWORK_TYPES)
		if (artwork.length) {
			result.push({ label: 'Artwork', items: artwork })
		}

		const covers = filterByTypes(mediaItems, COVER_TYPES)
		if (covers.length) {
			result.push({ label: 'Covers', items: covers })
		}

		const logos = filterByTypes(mediaItems, LOGO_TYPES)
		if (logos.length) {
			result.push({ label: 'Logos', items: logos })
		}

		const other = mediaItems.filter(
			(item) => !ALL_CATEGORIZED_TYPES.has(item.mediaType as MediaType),
		)
		if (other.length) {
			result.push({ label: 'Other', items: other })
		}

		return { sections: result, videos }
	}, [gameRecord.media, gameRecord.videos])

	const closeLightbox = useCallback(() => setLightbox(null), [])

	const hasContent =
		sections.sections.length > 0 || sections.videos.length > 0

	if (!hasContent) {
		return (
			<p className={'text-muted-foreground'}>{'No media available.'}</p>
		)
	}

	// Find the active lightbox section (only image sections, not trailers)
	const lightboxSection = lightbox !== null ? sections.sections[lightbox.sectionIndex] : null

	return (
		<>
			{sections.sections.map((section, sectionIndex) => (
				<SectionHeader
					key={section.label}
					id={`media-${section.label.toLowerCase()}`}
					title={section.label}>
					{section.label === 'Trailers' ? (
						<div className={'grid grid-cols-2 gap-4'}>
							{sections.videos.map((video) => (
								<VideoEmbed
									key={video.videoId}
									videoId={video.videoId}
									platform={video.platform}
									title={video.title}
								/>
							))}
						</div>
					) : (
						<ImageSection
							section={section}
							uri={gameRecord.uri}
							gameName={gameRecord.name}
							onImageClick={(imageIndex) =>
								setLightbox({ sectionIndex, imageIndex })
							}
						/>
					)}
				</SectionHeader>
			))}

			{lightbox !== null && lightboxSection && (
				<LightboxForSection
					section={lightboxSection}
					uri={gameRecord.uri}
					gameName={gameRecord.name}
					imageIndex={lightbox.imageIndex}
					onClose={closeLightbox}
					onNavigate={(imageIndex) =>
						setLightbox({ sectionIndex: lightbox.sectionIndex, imageIndex })
					}
				/>
			)}
		</>
	)
}
